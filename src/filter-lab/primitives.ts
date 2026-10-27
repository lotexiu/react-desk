import { discUri, domeUri, glintUri, lensMapUri, liquidMapUri, sphereMapUri } from './maps'
import type { TField, TParams, TParamValue, TPrimitiveDef, TSvgElement } from './types'

const num = (key: string, label: string, def: number, opts: { min?: number; max?: number; step?: number; group?: string; showIf?: TField['showIf'] } = {}): TField => ({
  kind: 'number', key, label, default: def, ...opts,
})
const select = (key: string, label: string, options: string[], def: string, opts: { group?: string; showIf?: TField['showIf'] } = {}): TField => ({
  kind: 'select', key, label, options, default: def, ...opts,
})
const text = (key: string, label: string, def: string, opts: { placeholder?: string; pickFile?: boolean; group?: string; showIf?: TField['showIf'] } = {}): TField => ({
  kind: 'text', key, label, default: def, ...opts,
})
const color = (key: string, label: string, def: string): TField => ({ kind: 'color', key, label, default: def })
const input = (key: string, label: string, def = ''): TField => ({ kind: 'input', key, label, default: def })

const isRound = (p: TParams) => p.mode !== 'custom' && p.mode !== 'liquid'
const IN: TField = input('in', 'Entrada (in)')
const IN2: TField = input('in2', 'Entrada 2 (in2)', 'SourceGraphic')

type TAttrs = Record<string, TParamValue | undefined>

/** Cria o elemento descartando atributos `undefined`. */
function el(tag: string, attrs: TAttrs, children?: TSvgElement[]): TSvgElement {
  const clean: Record<string, TParamValue> = {}
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) clean[k] = v
  return children?.length ? { tag, attrs: clean, children } : { tag, attrs: clean }
}

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

const CHANNELS = ['R', 'G', 'B', 'A'] as const
const FUNC_TYPES = ['identity', 'linear', 'gamma', 'table', 'discrete']

const transferFields: TField[] = CHANNELS.flatMap((ch) => {
  const group = `Canal ${ch}`
  const is = (...types: string[]) => (p: TParams) => types.includes(String(p[`${ch}_type`]))
  return [
    select(`${ch}_type`, 'Tipo', FUNC_TYPES, ch === 'A' ? 'identity' : 'linear', { group }),
    num(`${ch}_slope`, 'slope', 1, { step: 0.1, group, showIf: is('linear') }),
    num(`${ch}_intercept`, 'intercept', 0, { step: 0.05, group, showIf: is('linear') }),
    num(`${ch}_amplitude`, 'amplitude', 1, { step: 0.1, group, showIf: is('gamma') }),
    num(`${ch}_exponent`, 'exponent', 1, { step: 0.1, group, showIf: is('gamma') }),
    num(`${ch}_offset`, 'offset', 0, { step: 0.05, group, showIf: is('gamma') }),
    text(`${ch}_tableValues`, 'tableValues', '0 1', { group, showIf: is('table', 'discrete') }),
  ]
})

function transferChild(ch: string, p: TParams): TSvgElement | null {
  const type = String(p[`${ch}_type`])
  if (type === 'identity') return null
  const attrs: TAttrs = { type }
  if (type === 'linear') {
    attrs.slope = p[`${ch}_slope`]
    attrs.intercept = p[`${ch}_intercept`]
  } else if (type === 'gamma') {
    attrs.amplitude = p[`${ch}_amplitude`]
    attrs.exponent = p[`${ch}_exponent`]
    attrs.offset = p[`${ch}_offset`]
  } else {
    attrs.tableValues = p[`${ch}_tableValues`]
  }
  return el(`feFunc${ch}`, attrs)
}

const LIGHT_GROUP = 'Fonte de luz'
const isLight = (...kinds: string[]) => (p: TParams) => kinds.includes(String(p.light))

const lightFields: TField[] = [
  select('light', 'Tipo de luz', ['distant', 'point', 'spot'], 'distant', { group: LIGHT_GROUP }),
  num('azimuth', 'Azimute', 45, { min: 0, max: 360, step: 1, group: LIGHT_GROUP, showIf: isLight('distant') }),
  num('elevation', 'Elevação', 55, { min: 0, max: 90, step: 1, group: LIGHT_GROUP, showIf: isLight('distant') }),
  num('lx', 'Posição X', 300, { step: 10, group: LIGHT_GROUP, showIf: isLight('point', 'spot') }),
  num('ly', 'Posição Y', 180, { step: 10, group: LIGHT_GROUP, showIf: isLight('point', 'spot') }),
  num('lz', 'Altura Z', 100, { step: 5, group: LIGHT_GROUP, showIf: isLight('point', 'spot') }),
  num('px', 'Aponta para X', 300, { step: 10, group: LIGHT_GROUP, showIf: isLight('spot') }),
  num('py', 'Aponta para Y', 180, { step: 10, group: LIGHT_GROUP, showIf: isLight('spot') }),
  num('pz', 'Aponta para Z', 0, { step: 5, group: LIGHT_GROUP, showIf: isLight('spot') }),
  num('spotExponent', 'Concentração do foco', 1, { min: 0.1, step: 0.5, group: LIGHT_GROUP, showIf: isLight('spot') }),
  num('coneAngle', 'Ângulo do cone (0 = sem limite)', 0, { min: 0, max: 90, step: 1, group: LIGHT_GROUP, showIf: isLight('spot') }),
]

/** Elemento filho da fonte de luz escolhida (feDistantLight, fePointLight ou feSpotLight). */
function lightElement(p: TParams): TSvgElement {
  if (p.light === 'point') return el('fePointLight', { x: p.lx, y: p.ly, z: p.lz })
  if (p.light === 'spot') {
    return el('feSpotLight', {
      x: p.lx,
      y: p.ly,
      z: p.lz,
      pointsAtX: p.px,
      pointsAtY: p.py,
      pointsAtZ: p.pz,
      specularExponent: p.spotExponent,
      limitingConeAngle: Number(p.coneAngle) > 0 ? p.coneAngle : undefined,
    })
  }
  return el('feDistantLight', { azimuth: p.azimuth, elevation: p.elevation })
}

const IDENTITY_MATRIX = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'

const PRIMITIVES: TPrimitiveDef[] = [
  {
    tag: 'feTurbulence',
    label: 'Turbulência (ruído)',
    description: 'Gera ruído Perlin. Não usa entrada — cria a imagem do zero.',
    fields: [
      select('type', 'Tipo', ['fractalNoise', 'turbulence'], 'fractalNoise'),
      num('baseFrequency', 'Frequência X', 0.8, { min: 0, max: 5, step: 0.01 }),
      num('baseFrequencyY', 'Frequência Y (0 = igual ao X)', 0, { min: 0, max: 5, step: 0.01 }),
      num('numOctaves', 'Oitavas', 2, { min: 1, max: 8, step: 1 }),
      num('seed', 'Seed', 2, { step: 1 }),
      select('stitchTiles', 'stitchTiles', ['noStitch', 'stitch'], 'stitch'),
    ],
    build: (p) => {
      const fx = Number(p.baseFrequency)
      const fy = Number(p.baseFrequencyY)
      return el('feTurbulence', {
        type: p.type,
        baseFrequency: fy > 0 && fy !== fx ? `${fx} ${fy}` : fx,
        numOctaves: p.numOctaves,
        seed: p.seed,
        stitchTiles: p.stitchTiles,
      })
    },
  },
  {
    tag: 'feColorMatrix',
    label: 'Matriz de cor',
    description: 'Satura, gira o matiz, converte luminância em alpha ou aplica uma matriz 5×4.',
    fields: [
      IN,
      select('type', 'Tipo', ['saturate', 'hueRotate', 'luminanceToAlpha', 'matrix'], 'saturate'),
      num('saturate', 'Saturação (0 = cinza)', 0, { min: 0, max: 10, step: 0.1, showIf: (p) => p.type === 'saturate' }),
      num('hue', 'Graus', 90, { min: 0, max: 360, step: 1, showIf: (p) => p.type === 'hueRotate' }),
      text('matrix', '20 valores (R G B A, 5 colunas)', IDENTITY_MATRIX, { showIf: (p) => p.type === 'matrix' }),
    ],
    build: (p, resolve) => {
      const values = p.type === 'saturate' ? p.saturate : p.type === 'hueRotate' ? p.hue : p.type === 'matrix' ? p.matrix : undefined
      return el('feColorMatrix', { in: resolve(p.in), type: p.type, values })
    },
  },
  {
    tag: 'feComponentTransfer',
    label: 'Transferência por canal',
    description: 'Curva por canal (R, G, B, A): contraste, gamma, posterização, inversão.',
    fields: [IN, ...transferFields],
    build: (p, resolve) =>
      el('feComponentTransfer', { in: resolve(p.in) }, CHANNELS.map((ch) => transferChild(ch, p)).filter((c): c is TSvgElement => c !== null)),
  },
  {
    tag: 'feGaussianBlur',
    label: 'Desfoque gaussiano',
    description: 'Desfoca a entrada.',
    fields: [
      IN,
      num('stdDeviation', 'Desvio (stdDeviation)', 4, { min: 0, max: 100, step: 0.5 }),
      select('edgeMode', 'edgeMode', ['none', 'duplicate', 'wrap'], 'none'),
    ],
    build: (p, resolve) =>
      el('feGaussianBlur', { in: resolve(p.in), stdDeviation: p.stdDeviation, edgeMode: p.edgeMode === 'none' ? undefined : p.edgeMode }),
  },
  {
    tag: 'feOffset',
    label: 'Deslocamento',
    description: 'Move a entrada em dx/dy.',
    fields: [IN, num('dx', 'dx', 4, { step: 1 }), num('dy', 'dy', 4, { step: 1 })],
    build: (p, resolve) => el('feOffset', { in: resolve(p.in), dx: p.dx, dy: p.dy }),
  },
  {
    tag: 'feFlood',
    label: 'Cor sólida (flood)',
    description: 'Preenche a região com uma cor. Não usa entrada.',
    fields: [color('flood-color', 'Cor', '#ff3366'), num('flood-opacity', 'Opacidade', 1, { min: 0, max: 1, step: 0.05 })],
    build: (p) => el('feFlood', { 'flood-color': p['flood-color'], 'flood-opacity': p['flood-opacity'] }),
  },
  {
    tag: 'feImage',
    label: 'Imagem (feImage)',
    description: 'Insere uma imagem na cadeia — aqui gerada na hora (mapa de refração, disco) ou um endereço/data URI seu. Não usa entrada.',
    fields: [
      select('mode', 'Imagem', ['sphere-map', 'lens', 'liquid', 'glint', 'disc', 'dome', 'custom'], 'sphere-map'),
      num('cx', 'Centro X (na imagem)', 300, { step: 5, showIf: isRound }),
      num('cy', 'Centro Y (na imagem)', 180, { step: 5, showIf: isRound }),
      num('r', 'Raio', 110, { min: 1, step: 5, showIf: isRound }),
      num('falloff', 'Curva da borda (potência)', 2.5, { min: 0.5, max: 8, step: 0.25, showIf: (p) => p.mode === 'lens' }),
      num('inset', 'Margem da borda', 18, { min: 0, step: 2, showIf: (p) => p.mode === 'liquid' }),
      num('corner', 'Raio dos cantos', 50, { min: 0, step: 2, showIf: (p) => p.mode === 'liquid' }),
      num('soft', 'Suavidade do miolo (blur)', 18, { min: 0, step: 1, showIf: (p) => p.mode === 'liquid' }),
      text('href', 'href (data URI ou URL)', '', { pickFile: true, showIf: (p) => p.mode === 'custom' }),
      num('x', 'Região X', 0, { step: 10 }),
      num('y', 'Região Y', 0, { step: 10 }),
      num('width', 'Região largura', 600, { min: 1, step: 10 }),
      num('height', 'Região altura', 360, { min: 1, step: 10 }),
    ],
    build: (p) => {
      const [cx, cy, r, w, h] = [p.cx, p.cy, p.r, p.width, p.height].map(Number)
      const make =
        p.mode === 'disc' ? discUri
        : p.mode === 'dome' ? domeUri
        : p.mode === 'glint' ? glintUri
        : p.mode === 'lens' ? (...a: [number, number, number, number, number]) => lensMapUri(...a, Number(p.falloff))
        : p.mode === 'liquid' ? () => liquidMapUri(w, h, Number(p.inset), Number(p.corner), Number(p.soft))
        : sphereMapUri
      const href = p.mode === 'custom' ? p.href : make(cx, cy, r, w, h)
      return el('feImage', { href, x: p.x, y: p.y, width: p.width, height: p.height, preserveAspectRatio: 'none' })
    },
  },
  {
    tag: 'feBlend',
    label: 'Mistura (blend)',
    description: 'Mistura `in` sobre `in2` usando um modo de blend.',
    fields: [IN, IN2, select('mode', 'Modo', BLEND_MODES, 'multiply')],
    build: (p, resolve) => el('feBlend', { in: resolve(p.in), in2: resolve(p.in2), mode: p.mode }),
  },
  {
    tag: 'feComposite',
    label: 'Composição',
    description: 'Operações de Porter-Duff ou aritmética entre `in` e `in2`.',
    fields: [
      IN,
      IN2,
      select('operator', 'Operador', ['over', 'in', 'out', 'atop', 'xor', 'arithmetic'], 'in'),
      ...(['k1', 'k2', 'k3', 'k4'] as const).map((k) => num(k, k, k === 'k2' ? 1 : 0, { step: 0.1, showIf: (p) => p.operator === 'arithmetic' })),
    ],
    build: (p, resolve) => {
      const arithmetic = p.operator === 'arithmetic'
      return el('feComposite', {
        in: resolve(p.in),
        in2: resolve(p.in2),
        operator: p.operator,
        k1: arithmetic ? p.k1 : undefined,
        k2: arithmetic ? p.k2 : undefined,
        k3: arithmetic ? p.k3 : undefined,
        k4: arithmetic ? p.k4 : undefined,
      })
    },
  },
  {
    tag: 'feMorphology',
    label: 'Morfologia',
    description: 'Engrossa (dilate) ou afina (erode) as formas.',
    fields: [IN, select('operator', 'Operador', ['erode', 'dilate'], 'dilate'), num('radius', 'Raio', 2, { min: 0, max: 50, step: 0.5 })],
    build: (p, resolve) => el('feMorphology', { in: resolve(p.in), operator: p.operator, radius: p.radius }),
  },
  {
    tag: 'feDisplacementMap',
    label: 'Mapa de deslocamento',
    description: 'Distorce `in` usando os canais de cor de `in2` como mapa.',
    fields: [
      IN,
      IN2,
      num('scale', 'Escala', 30, { step: 1 }),
      select('xChannelSelector', 'Canal X', ['R', 'G', 'B', 'A'], 'R'),
      select('yChannelSelector', 'Canal Y', ['R', 'G', 'B', 'A'], 'G'),
    ],
    build: (p, resolve) =>
      el('feDisplacementMap', {
        in: resolve(p.in),
        in2: resolve(p.in2),
        scale: p.scale,
        xChannelSelector: p.xChannelSelector,
        yChannelSelector: p.yChannelSelector,
      }),
  },
  {
    tag: 'feDropShadow',
    label: 'Sombra (drop shadow)',
    description: 'Atalho para blur + offset + flood + merge.',
    fields: [
      IN,
      num('dx', 'dx', 4, { step: 1 }),
      num('dy', 'dy', 4, { step: 1 }),
      num('stdDeviation', 'Desvio', 4, { min: 0, max: 50, step: 0.5 }),
      color('flood-color', 'Cor', '#000000'),
      num('flood-opacity', 'Opacidade', 0.6, { min: 0, max: 1, step: 0.05 }),
    ],
    build: (p, resolve) =>
      el('feDropShadow', {
        in: resolve(p.in),
        dx: p.dx,
        dy: p.dy,
        stdDeviation: p.stdDeviation,
        'flood-color': p['flood-color'],
        'flood-opacity': p['flood-opacity'],
      }),
  },
  {
    tag: 'feDiffuseLighting',
    label: 'Iluminação difusa',
    description: 'Usa o alpha da entrada como relevo e ilumina com uma luz distante (papel, tecido, emboss).',
    fields: [
      IN,
      num('surfaceScale', 'surfaceScale', 2, { step: 0.1 }),
      num('diffuseConstant', 'diffuseConstant', 1, { min: 0, step: 0.1 }),
      color('lighting-color', 'Cor da luz', '#ffffff'),
      ...lightFields,
    ],
    build: (p, resolve) =>
      el(
        'feDiffuseLighting',
        { in: resolve(p.in), surfaceScale: p.surfaceScale, diffuseConstant: p.diffuseConstant, 'lighting-color': p['lighting-color'] },
        [lightElement(p)],
      ),
  },
  {
    tag: 'feSpecularLighting',
    label: 'Iluminação especular',
    description: 'Como a difusa, mas gera brilhos (specular).',
    fields: [
      IN,
      num('surfaceScale', 'surfaceScale', 2, { step: 0.1 }),
      num('specularConstant', 'specularConstant', 1, { min: 0, step: 0.1 }),
      num('specularExponent', 'specularExponent', 20, { min: 1, max: 128, step: 1 }),
      color('lighting-color', 'Cor da luz', '#ffffff'),
      ...lightFields,
    ],
    build: (p, resolve) =>
      el(
        'feSpecularLighting',
        {
          in: resolve(p.in),
          surfaceScale: p.surfaceScale,
          specularConstant: p.specularConstant,
          specularExponent: p.specularExponent,
          'lighting-color': p['lighting-color'],
        },
        [lightElement(p)],
      ),
  },
]

const BY_TAG = new Map(PRIMITIVES.map((d) => [d.tag, d]))

function getPrimitive(tag: string): TPrimitiveDef {
  const def = BY_TAG.get(tag)
  if (!def) throw new Error(`Primitiva desconhecida: ${tag}`)
  return def
}

function defaultParams(def: TPrimitiveDef): TParams {
  return Object.fromEntries(def.fields.map((f) => [f.key, f.default]))
}

export { PRIMITIVES, BLEND_MODES, getPrimitive, defaultParams }
