import { Cache, StopWatch } from '@lotexiu/typescript'

/**
 * Mapa de deslocamento para `feDisplacementMap`: R e G dizem, para cada ponto, para onde o fundo deve ser
 * "puxado" (128 = parado). Perto da borda o vetor aponta para dentro com força máxima e cai a zero no
 * miolo — a cara de lente convexa (bisel de vidro).
 *
 * É um SVG vetorial (4 faixas de gradiente nas bordas, combinadas por `mix-blend-mode`), não pixels:
 * montar a string custa microssegundos, não há laço por pixel nem canvas, e o navegador rasteriza uma vez.
 *  - faixa esquerda/topo: `screen` com vermelho/verde crescente     → o canal sobe de 128 até 255
 *  - faixa direita/base:  `multiply` com vermelho/verde decrescente → o canal desce de 128 até 0
 * No banco de testes (LIB-FINDINGS.md, seção "vidro") a imagem é equivalente à do mapa em canvas.
 */
const NEUTRAL = 128
const CHANNEL_MAX = 255
const FALLOFF_POWER = 2.4
/** Pontos de controle da queda `(1 - t) ** 2.4` — o gradiente interpola entre eles. */
const RAMP_STOPS = [0, 0.15, 0.3, 0.5, 0.75, 1] as const
/** O bisel nunca passa dessa fração da menor dimensão — senão painéis pequenos viram só borda. */
const MAX_BEZEL_RATIO = 0.38
const CACHE_LIMIT = 48

type TStrip = Readonly<{
	/** gradiente: de onde nasce → para onde vai (em fração da faixa) */
	from: readonly [number, number]
	to: readonly [number, number]
	channel: 'r' | 'g'
	/** `screen` sobe o canal acima de 128; `multiply` o desce abaixo */
	blend: 'screen' | 'multiply'
	/** retângulo da faixa, dados o tamanho do painel e o bisel */
	rect: (w: number, h: number, bezel: number) => readonly [x: number, y: number, width: number, height: number]
}>

const STRIPS: readonly TStrip[] = [
	{ from: [0, 0], to: [1, 0], channel: 'r', blend: 'screen', rect: (_w, h, b) => [0, 0, b, h] },
	{ from: [1, 0], to: [0, 0], channel: 'r', blend: 'multiply', rect: (w, h, b) => [w - b, 0, b, h] },
	{ from: [0, 0], to: [0, 1], channel: 'g', blend: 'screen', rect: (w, _h, b) => [0, 0, w, b] },
	{ from: [0, 1], to: [0, 0], channel: 'g', blend: 'multiply', rect: (w, h, b) => [0, h - b, w, b] },
]

const falloff = (t: number) => (1 - t) ** FALLOFF_POWER

/** `screen` soma ao canal (preto = neutro); `multiply` o reduz (branco = neutro). */
function stripColor({ channel, blend }: TStrip, strength: number): string {
	const level = Math.round(blend === 'screen' ? strength * CHANNEL_MAX : CHANNEL_MAX - strength * CHANNEL_MAX)
	const rest = blend === 'screen' ? 0 : CHANNEL_MAX
	return channel === 'r' ? `rgb(${level},${rest},${rest})` : `rgb(${rest},${level},${rest})`
}

function gradientOf(strip: TStrip, id: string): string {
	const stops = RAMP_STOPS.map((t) => `<stop offset="${t}" stop-color="${stripColor(strip, falloff(t))}"/>`).join('')
	return `<linearGradient id="${id}" x1="${strip.from[0]}" y1="${strip.from[1]}" x2="${strip.to[0]}" y2="${strip.to[1]}">${stops}</linearGradient>`
}

function rectOf(strip: TStrip, id: string, w: number, h: number, bezel: number): string {
	const [x, y, width, height] = strip.rect(w, h, bezel)
	return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#${id})" style="mix-blend-mode:${strip.blend}"/>`
}

function buildMap(width: number, height: number, bezel: number): string {
	const ids = STRIPS.map((_, index) => `s${index}`)
	const gradients = STRIPS.map((strip, i) => gradientOf(strip, ids[i])).join('')
	const rects = STRIPS.map((strip, i) => rectOf(strip, ids[i], width, height, bezel)).join('')
	const base = `<rect width="${width}" height="${height}" fill="rgb(${NEUTRAL},${NEUTRAL},${NEUTRAL})"/>`
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${gradients}</defs>${base}${rects}</svg>`
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const cache = new Cache<string>({ maxEntries: CACHE_LIMIT })

/** Custo de montar cada mapa (mostrado nos ajustes de vidro). */
const mapTimer = new StopWatch()

function displacementMap(width: number, height: number, requestedBezel: number): string {
	const bezel = Math.round(Math.min(requestedBezel, Math.min(width, height) * MAX_BEZEL_RATIO))
	return cache.getOrSet(`${width}x${height}b${bezel}`, () => mapTimer.measure(() => buildMap(width, height, bezel)))
}

/** Só Chromium aceita `url(#filtro)` em `backdrop-filter`; nos outros cai no desfoque simples. */
const SUPPORTS_REFRACTION = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#x)')

export { displacementMap, mapTimer, SUPPORTS_REFRACTION }
