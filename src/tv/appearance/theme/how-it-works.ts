/**
 * COMO O SISTEMA DE TEMA FUNCIONA — exemplo fictício, ninguém importa este arquivo. (O uso real
 * está em `appearance/appearance.ts` e `appearance/theme/*`.)
 *
 * Quem manda é o ESTILO. Ele diz de que precisa, e o resto se adapta:
 *
 *   1. PALETAS o estilo declara os IDs de paleta que usa (2, 3, 4… quantos quiser) e, para cada id,
 *                uma paleta PADRÃO (obrigatória). Uma paleta é uma régua de tons de 0 (preto) a 100
 *                (branco).
 *   2. PAPÉIS o que cada cor FAZ no app: "fundo", "texto", "botão"… Cada papel cita um id de
 *   paleta, o tom
 *                no modo escuro e no claro, e (opcional) sobre qual papel fica e quão legível
 *                precisa ser (`on` + `min`).
 *   3. ESTILO    ids de paleta (+ padrões) + papéis + `components` (raios, fontes…).
 *   4. TEMA junta o estilo com as paletas ATRIBUÍDAS pelo usuário e o modo/contraste, e entrega as
 *   cores.
 *   5. FACTORY (opcional) gera as paletas de todos os ids a partir de poucas cores: o usuário
 *   informa uma ou duas,
 *                o resto sai pronto, e qualquer paleta gerada ainda pode ser trocada à mão.
 *
 * Qual paleta cada id usa: a que foi atribuída (`theme.setPalettes`), senão a padrão do estilo. Por
 * isso trocar para um estilo que precisa de MAIS paletas nunca deixa um papel sem cor.
 *
 * Fora da lib (é do app): a lista de paletas com nome que a interface mostra para o usuário
 * escolher.
 */
import { ColorUtils, PaletteFactory, Theme, ThemeStyle, TonalPalette } from '@lotexiu/typescript'

// ─── Um "catálogo" qualquer: só uma lista de paletas que o app oferece. A lib não sabe disso. ───
const ocean = new TonalPalette('#1a5fb4', 'ocean')
const sunset = new TonalPalette('#c0392b', 'sunset')
// mesma cor, quase sem saturação: ótima para fundos
const graphite = new TonalPalette('#1a5fb4', 'graphite').neutral()

// ─── 5. FACTORY: as ENTRADAS (seeds) que o usuário pode editar e a RECEITA de cada paleta ─────
// Aqui são duas cores. `label` é o que a interface mostra; `default` vale enquanto o usuário não
// escolhe. A regra de cada paleta recebe as seeds já como paletas, então é só derivar:
// `.derive(...)`, `.neutral()`.
const twoColorsFactory = new PaletteFactory({
	seeds: {
		brand: { label: 'Cor da marca', default: ocean },
		accent: { label: 'Cor de destaque', default: sunset },
	},
	palettes: {
		brand: ({ seeds }) => seeds.brand,
		accent: ({ seeds }) => seeds.accent,
		neutral: ({ seeds }) => seeds.brand.neutral(), // o cinza do fundo sai da cor da marca
	},
})

// ─── 1, 2 e 3. ESTILO: ids de paleta com padrão + papéis que citam esses ids ──────────────────
// Dois ids. Escrever `palette: 'brnad'` aqui é erro do compilador: o id precisa existir em
// `palettes`.
const softStyle = new ThemeStyle({
	name: 'soft',
	palettes: { brand: ocean, neutral: graphite },
	roles: {
		background: { palette: 'neutral', tone: { dark: 10, light: 98 } },
		text: { palette: 'neutral', tone: { dark: 94, light: 10 }, on: 'background', min: 4.5 },
		button: { palette: 'brand', tone: { dark: 80, light: 40 } },
		'button-text': { palette: 'brand', tone: { dark: 10, light: 100 }, on: 'button', min: 4.5 },
	},
	components: { 'button-radius': '999px' }, // o que não é cor: o app lê como quiser
})

// Outro estilo, com TRÊS ids. Os papéis e tons são dele; a paleta `accent` só existe aqui. Os
// padrões obrigatórios são a própria factory com as seeds padrão: `twoColorsFactory.build()`.
const sharpStyle = new ThemeStyle({
	name: 'sharp',
	palettes: twoColorsFactory.build(),
	roles: {
		background: { palette: 'neutral', tone: { dark: 0, light: 100 } },
		text: { palette: 'neutral', tone: { dark: 100, light: 0 }, on: 'background', min: 7 },
		button: { palette: 'brand', tone: { dark: 70, light: 30 } },
		'button-text': { palette: 'brand', tone: { dark: 0, light: 100 }, on: 'button', min: 7 },
		highlight: { palette: 'accent', tone: { dark: 70, light: 40 } },
	},
	components: { 'button-radius': '2px' },
})

// ─── 4. O TEMA ────────────────────────────────────────────────────────────────────────────────
// `ThemeStyle` sem detalhes no genérico porque este tema vai trocar de estilo.
function createExampleTheme() {
	// nada atribuído: tudo usa o padrão do estilo
	return new Theme<ThemeStyle>({ style: softStyle, mode: 'dark' })
}

/** Uma passada pelo que o app faz com o tema, na ordem em que acontece. */
function exampleUsage() {
	const theme = createExampleTheme()

	// Ler: cada papel vira uma cor.
	const buttonColor = ColorUtils.toHex(theme.roles()['button']) // '#88c0ff' (modo escuro, estilo soft)

	// Atribuir paletas aos ids: uma ou várias de uma vez. O que não for citado continua como estava.
	theme.setPalettes({ brand: sunset })
	theme.setPalettes({ brand: ocean, neutral: graphite })
	theme.setPalettes({ brand: undefined }) // undefined = volta para a padrão do estilo

	// Trocar de estilo: `sharp` precisa de `accent`, que ninguém atribuiu. Sem erro: usa a padrão do
	// estilo (`sunset`).
	theme.style.set(sharpStyle)
	// { brand, accent, neutral }: o que está de fato em uso
	const paletteInUse = theme.activePalettes()

	// FACTORY: a interface lê as seeds e desenha um seletor para cada uma (aqui, dois). ['Cor da
	// marca', 'Cor de destaque']
	const seedLabels = Object.values(twoColorsFactory.seeds).map((seed) => seed.label)
	// O usuário informa só as cores; todas as paletas saem prontas. Uma cor em texto já basta.
	theme.setPalettes(twoColorsFactory.build({ brand: '#2d6a2d' }))
	// E se ele quiser escolher uma delas à mão: o segundo argumento troca a paleta gerada por outra.
	theme.setPalettes(twoColorsFactory.build({ brand: '#2d6a2d' }, { neutral: graphite }))

	// Modo e contraste: o tema se recalcula, é só ler de novo.
	theme.mode.set('light')

	// Conferir a legibilidade: um item por papel que tem `on` + `min`. `passed: false` traz
	// `suggestion` com o tom mais próximo que passaria; com `theme.enforce` ligado (padrão),
	// `theme.roles()` já devolve essa sugestão no lugar do tom original.
	const failures = theme.checks().filter((check) => !check.passed)

	// Entregar aos componentes: aqui, variáveis CSS (`--button`, `--text`…). O nome do papel é o da
	// variável.
	const cssVariables = {
		...Object.fromEntries(
			Object.entries(theme.roles()).map(([role, color]) => [`--${role}`, ColorUtils.toHex(color)])
		),
		...Object.fromEntries(
			Object.entries(theme.components()).map(([name, value]) => [`--${name}`, String(value)])
		),
	}

	return { buttonColor, paletteInUse, seedLabels, failures, cssVariables }
}

export { createExampleTheme, exampleUsage }
