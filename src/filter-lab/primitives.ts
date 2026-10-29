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

const isRound = (params: TParams) => params.mode !== 'custom' && params.mode !== 'liquid'
const INPUT_FIELD: TField = input('in', 'Entrada (in)')
const SECOND_INPUT_FIELD: TField = input('in2', 'Entrada 2 (in2)', 'SourceGraphic')

type TAttrs = Record<string, TParamValue | undefined>

/** Cria o elemento descartando atributos `undefined`. */
function svgElement(tag: string, attrs: TAttrs, children?: TSvgElement[]): TSvgElement {
  const clean: Record<string, TParamValue> = {}
  for (const [key, value] of Object.entries(attrs)) if (value !== undefined) clean[key] = value
  return children?.length ? { tag, attrs: clean, children } : { tag, attrs: clean }
}

const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

const CHANNELS = ['R', 'G', 'B', 'A'] as const
const FUNC_TYPES = ['identity', 'linear', 'gamma', 'table', 'discrete']

const transferFields: TField[] = CHANNELS.flatMap((channel) => {
  const group = `Canal ${channel}`
  const is = (...types: string[]) => (params: TParams) => types.includes(String(params[`${channel}_type`]))
  return [
    select(`${channel}_type`, 'Tipo', FUNC_TYPES, channel === 'A' ? 'identity' : 'linear', { group }),
    num(`${channel}_slope`, 'slope', 1, { step: 0.1, group, showIf: is('linear') }),
    num(`${channel}_intercept`, 'intercept', 0, { step: 0.05, group, showIf: is('linear') }),
    num(`${channel}_amplitude`, 'amplitude', 1, { step: 0.1, group, showIf: is('gamma') }),
    num(`${channel}_exponent`, 'exponent', 1, { step: 0.1, group, showIf: is('gamma') }),
    num(`${channel}_offset`, 'offset', 0, { step: 0.05, group, showIf: is('gamma') }),
    text(`${channel}_tableValues`, 'tableValues', '0 1', { group, showIf: is('table', 'discrete') }),
  ]
})

function transferChild(channel: string, params: TParams): TSvgElement | null {
  const type = String(params[`${channel}_type`])
  if (type === 'identity') return null
  const attrs: TAttrs = { type }
  if (type === 'linear') {
    attrs.slope = params[`${channel}_slope`]
    attrs.intercept = params[`${channel}_intercept`]
  } else if (type === 'gamma') {
    attrs.amplitude = params[`${channel}_amplitude`]
    attrs.exponent = params[`${channel}_exponent`]
    attrs.offset = params[`${channel}_offset`]
  } else {
    attrs.tableValues = params[`${channel}_tableValues`]
  }
  return svgElement(`feFunc${channel}`, attrs)
}

const LIGHT_GROUP = 'Fonte de luz'
const isLight = (...kinds: string[]) => (params: TParams) => kinds.includes(String(params.light))

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
function lightElement(params: TParams): TSvgElement {
  if (params.light === 'point') return svgElement('fePointLight', { x: params.lx, y: params.ly, z: params.lz })
  if (params.light === 'spot') {
    return svgElement('feSpotLight', {
      x: params.lx,
      y: params.ly,
      z: params.lz,
      pointsAtX: params.px,
      pointsAtY: params.py,
      pointsAtZ: params.pz,
      specularExponent: params.spotExponent,
      limitingConeAngle: Number(params.coneAngle) > 0 ? params.coneAngle : undefined,
    })
  }
  return svgElement('feDistantLight', { azimuth: params.azimuth, elevation: params.elevation })
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
    build: (params) => {
      const frequencyX = Number(params.baseFrequency)
      const frequencyY = Number(params.baseFrequencyY)
      return svgElement('feTurbulence', {
        type: params.type,
        baseFrequency: frequencyY > 0 && frequencyY !== frequencyX ? `${frequencyX} ${frequencyY}` : frequencyX,
        numOctaves: params.numOctaves,
        seed: params.seed,
        stitchTiles: params.stitchTiles,
      })
    },
  },
  {
    tag: 'feColorMatrix',
    label: 'Matriz de cor',
    description: 'Satura, gira o matiz, converte luminância em alpha ou aplica uma matriz 5×4.',
    fields: [
      INPUT_FIELD,
      select('type', 'Tipo', ['saturate', 'hueRotate', 'luminanceToAlpha', 'matrix'], 'saturate'),
      num('saturate', 'Saturação (0 = cinza)', 0, { min: 0, max: 10, step: 0.1, showIf: (params) => params.type === 'saturate' }),
      num('hue', 'Graus', 90, { min: 0, max: 360, step: 1, showIf: (params) => params.type === 'hueRotate' }),
      text('matrix', '20 valores (R G B A, 5 colunas)', IDENTITY_MATRIX, { showIf: (params) => params.type === 'matrix' }),
    ],
    build: (params, resolve) => {
      const values = params.type === 'saturate' ? params.saturate : params.type === 'hueRotate' ? params.hue : params.type === 'matrix' ? params.matrix : undefined
      return svgElement('feColorMatrix', { in: resolve(params.in), type: params.type, values })
    },
  },
  {
    tag: 'feComponentTransfer',
    label: 'Transferência por canal',
    description: 'Curva por canal (R, G, B, A): contraste, gamma, posterização, inversão.',
    fields: [INPUT_FIELD, ...transferFields],
    build: (params, resolve) =>
      svgElement('feComponentTransfer', { in: resolve(params.in) }, CHANNELS.map((channel) => transferChild(channel, params)).filter((element): element is TSvgElement => element !== null)),
  },
  {
    tag: 'feGaussianBlur',
    label: 'Desfoque gaussiano',
    description: 'Desfoca a entrada.',
    fields: [
      INPUT_FIELD,
      num('stdDeviation', 'Desvio (stdDeviation)', 4, { min: 0, max: 100, step: 0.5 }),
      select('edgeMode', 'edgeMode', ['none', 'duplicate', 'wrap'], 'none'),
    ],
    build: (params, resolve) =>
      svgElement('feGaussianBlur', { in: resolve(params.in), stdDeviation: params.stdDeviation, edgeMode: params.edgeMode === 'none' ? undefined : params.edgeMode }),
  },
  {
    tag: 'feOffset',
    label: 'Deslocamento',
    description: 'Move a entrada em dx/dy.',
    fields: [INPUT_FIELD, num('dx', 'dx', 4, { step: 1 }), num('dy', 'dy', 4, { step: 1 })],
    build: (params, resolve) => svgElement('feOffset', { in: resolve(params.in), dx: params.dx, dy: params.dy }),
  },
  {
    tag: 'feFlood',
    label: 'Cor sólida (flood)',
    description: 'Preenche a região com uma cor. Não usa entrada.',
    fields: [color('flood-color', 'Cor', '#ff3366'), num('flood-opacity', 'Opacidade', 1, { min: 0, max: 1, step: 0.05 })],
    build: (params) => svgElement('feFlood', { 'flood-color': params['flood-color'], 'flood-opacity': params['flood-opacity'] }),
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
      num('falloff', 'Curva da borda (potência)', 2.5, { min: 0.5, max: 8, step: 0.25, showIf: (params) => params.mode === 'lens' }),
      num('inset', 'Margem da borda', 18, { min: 0, step: 2, showIf: (params) => params.mode === 'liquid' }),
      num('corner', 'Raio dos cantos', 50, { min: 0, step: 2, showIf: (params) => params.mode === 'liquid' }),
      num('soft', 'Suavidade do miolo (blur)', 18, { min: 0, step: 1, showIf: (params) => params.mode === 'liquid' }),
      text('href', 'href (data URI ou URL)', '', { pickFile: true, showIf: (params) => params.mode === 'custom' }),
      num('x', 'Região X', 0, { step: 10 }),
      num('y', 'Região Y', 0, { step: 10 }),
      num('width', 'Região largura', 600, { min: 1, step: 10 }),
      num('height', 'Região altura', 360, { min: 1, step: 10 }),
    ],
    build: (params) => {
      const [cx, cy, radius, width, height] = [params.cx, params.cy, params.r, params.width, params.height].map(Number)
      const make =
        params.mode === 'disc' ? discUri
        : params.mode === 'dome' ? domeUri
        : params.mode === 'glint' ? glintUri
        : params.mode === 'lens' ? (...args: [number, number, number, number, number]) => lensMapUri(...args, Number(params.falloff))
        : params.mode === 'liquid' ? () => liquidMapUri(width, height, Number(params.inset), Number(params.corner), Number(params.soft))
        : sphereMapUri
      const href = params.mode === 'custom' ? params.href : make(cx, cy, radius, width, height)
      return svgElement('feImage', { href, x: params.x, y: params.y, width: params.width, height: params.height, preserveAspectRatio: 'none' })
    },
  },
  {
    tag: 'feBlend',
    label: 'Mistura (blend)',
    description: 'Mistura `in` sobre `in2` usando um modo de blend.',
    fields: [INPUT_FIELD, SECOND_INPUT_FIELD, select('mode', 'Modo', BLEND_MODES, 'multiply')],
    build: (params, resolve) => svgElement('feBlend', { in: resolve(params.in), in2: resolve(params.in2), mode: params.mode }),
  },
  {
    tag: 'feComposite',
    label: 'Composição',
    description: 'Operações de Porter-Duff ou aritmética entre `in` e `in2`.',
    fields: [
      INPUT_FIELD,
      SECOND_INPUT_FIELD,
      select('operator', 'Operador', ['over', 'in', 'out', 'atop', 'xor', 'arithmetic'], 'in'),
      ...(['k1', 'k2', 'k3', 'k4'] as const).map((inputKey) => num(inputKey, inputKey, inputKey === 'k2' ? 1 : 0, { step: 0.1, showIf: (params) => params.operator === 'arithmetic' })),
    ],
    build: (params, resolve) => {
      const arithmetic = params.operator === 'arithmetic'
      return svgElement('feComposite', {
        in: resolve(params.in),
        in2: resolve(params.in2),
        operator: params.operator,
        k1: arithmetic ? params.k1 : undefined,
        k2: arithmetic ? params.k2 : undefined,
        k3: arithmetic ? params.k3 : undefined,
        k4: arithmetic ? params.k4 : undefined,
      })
    },
  },
  {
    tag: 'feMorphology',
    label: 'Morfologia',
    description: 'Engrossa (dilate) ou afina (erode) as formas.',
    fields: [INPUT_FIELD, select('operator', 'Operador', ['erode', 'dilate'], 'dilate'), num('radius', 'Raio', 2, { min: 0, max: 50, step: 0.5 })],
    build: (params, resolve) => svgElement('feMorphology', { in: resolve(params.in), operator: params.operator, radius: params.radius }),
  },
  {
    tag: 'feDisplacementMap',
    label: 'Mapa de deslocamento',
    description: 'Distorce `in` usando os canais de cor de `in2` como mapa.',
    fields: [
      INPUT_FIELD,
      SECOND_INPUT_FIELD,
      num('scale', 'Escala', 30, { step: 1 }),
      select('xChannelSelector', 'Canal X', ['R', 'G', 'B', 'A'], 'R'),
      select('yChannelSelector', 'Canal Y', ['R', 'G', 'B', 'A'], 'G'),
    ],
    build: (params, resolve) =>
      svgElement('feDisplacementMap', {
        in: resolve(params.in),
        in2: resolve(params.in2),
        scale: params.scale,
        xChannelSelector: params.xChannelSelector,
        yChannelSelector: params.yChannelSelector,
      }),
  },
  {
    tag: 'feDropShadow',
    label: 'Sombra (drop shadow)',
    description: 'Atalho para blur + offset + flood + merge.',
    fields: [
      INPUT_FIELD,
      num('dx', 'dx', 4, { step: 1 }),
      num('dy', 'dy', 4, { step: 1 }),
      num('stdDeviation', 'Desvio', 4, { min: 0, max: 50, step: 0.5 }),
      color('flood-color', 'Cor', '#000000'),
      num('flood-opacity', 'Opacidade', 0.6, { min: 0, max: 1, step: 0.05 }),
    ],
    build: (params, resolve) =>
      svgElement('feDropShadow', {
        in: resolve(params.in),
        dx: params.dx,
        dy: params.dy,
        stdDeviation: params.stdDeviation,
        'flood-color': params['flood-color'],
        'flood-opacity': params['flood-opacity'],
      }),
  },
  {
    tag: 'feDiffuseLighting',
    label: 'Iluminação difusa',
    description: 'Usa o alpha da entrada como relevo e ilumina com uma luz distante (papel, tecido, emboss).',
    fields: [
      INPUT_FIELD,
      num('surfaceScale', 'surfaceScale', 2, { step: 0.1 }),
      num('diffuseConstant', 'diffuseConstant', 1, { min: 0, step: 0.1 }),
      color('lighting-color', 'Cor da luz', '#ffffff'),
      ...lightFields,
    ],
    build: (params, resolve) =>
      svgElement(
        'feDiffuseLighting',
        { in: resolve(params.in), surfaceScale: params.surfaceScale, diffuseConstant: params.diffuseConstant, 'lighting-color': params['lighting-color'] },
        [lightElement(params)],
      ),
  },
  {
    tag: 'feSpecularLighting',
    label: 'Iluminação especular',
    description: 'Como a difusa, mas gera brilhos (specular).',
    fields: [
      INPUT_FIELD,
      num('surfaceScale', 'surfaceScale', 2, { step: 0.1 }),
      num('specularConstant', 'specularConstant', 1, { min: 0, step: 0.1 }),
      num('specularExponent', 'specularExponent', 20, { min: 1, max: 128, step: 1 }),
      color('lighting-color', 'Cor da luz', '#ffffff'),
      ...lightFields,
    ],
    build: (params, resolve) =>
      svgElement(
        'feSpecularLighting',
        {
          in: resolve(params.in),
          surfaceScale: params.surfaceScale,
          specularConstant: params.specularConstant,
          specularExponent: params.specularExponent,
          'lighting-color': params['lighting-color'],
        },
        [lightElement(params)],
      ),
  },
]

const BY_TAG = new Map(PRIMITIVES.map((definition) => [definition.tag, definition]))

function getPrimitive(tag: string): TPrimitiveDef {
  const def = BY_TAG.get(tag)
  if (!def) throw new Error(`Primitiva desconhecida: ${tag}`)
  return def
}

function defaultParams(def: TPrimitiveDef): TParams {
  return Object.fromEntries(def.fields.map((field) => [field.key, field.default]))
}

export { PRIMITIVES, BLEND_MODES, getPrimitive, defaultParams }
