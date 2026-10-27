import { defaultParams, getPrimitive } from './primitives'
import type { TFilterDoc, TFilterNode, TFilterSettings, TLayerSettings, TParams } from './types'
import type { TPreviewSource } from './serialize'

let seq = 0

/** Id único para nós criados no Lab (os exemplos usam ids explícitos como `noise`). */
const newId = () => `n${++seq}`

const DEFAULT_SETTINGS: TFilterSettings = {
  id: 'my-filter',
  x: '-20%',
  y: '-20%',
  width: '140%',
  height: '140%',
  filterUnits: 'objectBoundingBox',
  primitiveUnits: 'userSpaceOnUse',
  colorInterpolationFilters: 'sRGB',
}

const DEFAULT_LAYER: TLayerSettings = {
  fill: 'transparent',
  opacity: 1,
  blendMode: 'normal',
  fixedOverlay: true,
}

/** Cria um nó com os parâmetros padrão da primitiva, sobrescritos por `params`. */
function node(tag: string, params: TParams = {}, id: string = newId()): TFilterNode {
  return { id, tag, enabled: true, params: { ...defaultParams(getPrimitive(tag)), ...params } }
}

function makeDoc(nodes: TFilterNode[], opts: { settings?: Partial<TFilterSettings>; layer?: Partial<TLayerSettings> } = {}): TFilterDoc {
  return {
    settings: { ...DEFAULT_SETTINGS, ...opts.settings },
    layer: { ...DEFAULT_LAYER, ...opts.layer },
    nodes,
  }
}

const emptyDoc = (): TFilterDoc => makeDoc([])

type TPreset = { slug: string; name: string; description: string; source: TPreviewSource; make: () => TFilterDoc }

const CHANNEL_MATRIX = {
  R: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
  G: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
  B: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
}

/** Aberração cromática: desloca o fundo uma vez por canal (escalas diferentes), isola cada canal e soma com `screen`. Termina no resultado `refracted`. */
function chromaticDisplacement(map: string, [r, g, b]: [number, number, number]) {
  const channel = (ch: 'R' | 'G' | 'B', scale: number) => [
    node('feDisplacementMap', { in: 'SourceGraphic', in2: map, scale }, `displaced${ch}`),
    node('feColorMatrix', { in: `displaced${ch}`, type: 'matrix', matrix: CHANNEL_MATRIX[ch] }, `only${ch}`),
  ]
  return [
    ...channel('R', r),
    ...channel('G', g),
    ...channel('B', b),
    node('feBlend', { in: 'onlyR', in2: 'onlyG', mode: 'screen' }, 'rg'),
    node('feBlend', { in: 'rg', in2: 'onlyB', mode: 'screen' }, 'refracted'),
  ]
}

const PRESETS: TPreset[] = [
  {
    slug: 'grain',
    name: 'Grão (film grain)',
    description: 'Ruído fino em escala de cinza, misturado por cima do fundo com soft-light.',
    source: 'rect',
    make: () =>
      makeDoc(
        [
          node('feTurbulence', { baseFrequency: 1.25, numOctaves: 2, seed: 2 }),
          node('feColorMatrix', { type: 'saturate', saturate: 0 }),
          node('feComponentTransfer', { R_slope: 3, G_slope: 3, B_slope: 3 }),
          node('feColorMatrix', { type: 'matrix', matrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -16' }),
        ],
        { settings: { id: 'grain-filter' }, layer: { opacity: 0.22, blendMode: 'soft-light' } },
      ),
  },
  {
    slug: 'glow',
    name: 'Brilho (glow)',
    description: 'Desfoque misturado com screen sobre o original: as cores claras "vazam" para fora da forma.',
    source: 'shapes',
    make: () =>
      makeDoc(
        [
          node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 12 }),
          node('feBlend', { mode: 'screen', in2: 'SourceGraphic' }),
        ],
        { settings: { id: 'glow' } },
      ),
  },
  {
    slug: 'paper',
    name: 'Papel texturizado',
    description: 'Ruído de baixa frequência usado como relevo de uma luz difusa.',
    source: 'rect',
    make: () =>
      makeDoc(
        [
          node('feTurbulence', { baseFrequency: 0.04, numOctaves: 5, seed: 7 }),
          node('feDiffuseLighting', { surfaceScale: 2, azimuth: 45, elevation: 60 }),
        ],
        { settings: { id: 'paper' }, layer: { opacity: 0.5, blendMode: 'overlay' } },
      ),
  },
  {
    slug: 'water',
    name: 'Água (distorção)',
    description: 'Um mapa de turbulência desloca os pixels da imagem original.',
    source: 'shapes',
    make: () =>
      makeDoc(
        [
          node('feTurbulence', { type: 'turbulence', baseFrequency: 0.012, baseFrequencyY: 0.05, numOctaves: 2 }, 'noise'),
          node('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: 28 }),
        ],
        { settings: { id: 'water' } },
      ),
  },
  {
    slug: 'glass',
    name: 'Esfera de vidro (refração + aberração cromática)',
    description: 'Mapa de lente (miolo neutro, borda forte) deslocando o fundo 3× com escalas diferentes por canal, mais um brilho em gradiente.',
    source: 'background',
    make: () =>
      makeDoc(
        [
          node('feImage', { mode: 'lens', r: 150, falloff: 2.2 }, 'map'),
          ...chromaticDisplacement('map', [126, 120, 114]),
          node('feImage', { mode: 'glint', r: 150 }, 'glint'),
          node('feComposite', { in: 'glint', in2: 'refracted', operator: 'over' }),
        ],
        { settings: { id: 'glass-sphere' } },
      ),
  },
  {
    slug: 'glass-liquid',
    name: 'Vidro líquido retangular (trecho colado)',
    description: 'Mapa R/G com borda forte e miolo neutro (retângulo arredondado desfocado) + deslocamento separado por canal, como no trecho "lg-filter".',
    source: 'background',
    make: () =>
      makeDoc(
        [
          node('feImage', { mode: 'liquid', x: 0, y: 0, width: 600, height: 360, inset: 18, corner: 50, soft: 18 }, 'map'),
          ...chromaticDisplacement('map', [196, 194, 192]),
        ],
        { settings: { id: 'lg-filter', x: '0%', y: '0%', width: '100%', height: '100%' } },
      ),
  },
  {
    slug: 'normal-map-glass',
    name: 'Mapa de normais (PNG) → lente',
    description: 'Usa uma imagem de mapa de normais (azul no centro, preto fora) como mapa de deslocamento: carregue o arquivo no campo href da primeira etapa.',
    source: 'background',
    make: () =>
      makeDoc(
        [
          node('feImage', { mode: 'custom', href: '', x: 150, y: 30, width: 300, height: 300 }, 'raw'),
          node('feColorMatrix', { in: 'raw', type: 'matrix', matrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 50 0 -1' }, 'masked'),
          node('feFlood', { 'flood-color': '#808080' }, 'gray'),
          node('feComposite', { in: 'masked', in2: 'gray', operator: 'over' }, 'neutral'),
          node('feColorMatrix', { in: 'neutral', type: 'matrix', matrix: '1 0 0 0 0  0 -1 0 0 1  0 0 1 0 0  0 0 0 1 0' }, 'flipped'),
          node('feGaussianBlur', { in: 'flipped', stdDeviation: 3 }, 'map'),
          node('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: -70 }),
        ],
        { settings: { id: 'normal-map-glass' } },
      ),
  },
  {
    slug: 'bevel',
    name: 'Relevo plástico (versão enxuta)',
    description: 'Blur do alpha como mapa de altura → luz difusa tingida + brilho especular + sombra. 7 etapas.',
    source: 'shapes',
    make: () =>
      makeDoc(
        [
          node('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 5 }, 'height'),
          node('feDiffuseLighting', { in: 'height', surfaceScale: 4, azimuth: 225, elevation: 55 }, 'shade'),
          node('feBlend', { in: 'shade', in2: 'SourceGraphic', mode: 'multiply' }, 'tinted'),
          node('feSpecularLighting', { in: 'height', surfaceScale: 5, specularConstant: 1, specularExponent: 30, azimuth: 225, elevation: 55 }, 'spec'),
          node('feComposite', { in: 'tinted', in2: 'spec', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0 }, 'lit'),
          node('feComposite', { in: 'lit', in2: 'SourceAlpha', operator: 'in' }, 'clipped'),
          node('feDropShadow', { in: 'clipped', dx: -5, dy: 7, stdDeviation: 4.5, 'flood-opacity': 0.6 }),
        ],
        { settings: { id: 'bevel' } },
      ),
  },
  {
    slug: 'tray',
    name: 'Bandeja em relevo (receita de 12 etapas)',
    description: 'Borda em anel (blur − blur do erode) iluminada, texturizada com ruído hard-light.',
    source: 'shapes',
    make: () =>
      makeDoc(
        [
          node('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 4 }, 'a'),
          node('feMorphology', { in: 'SourceGraphic', operator: 'erode', radius: 10.5 }, 'eroded'),
          node('feGaussianBlur', { in: 'eroded', stdDeviation: 7.5 }, 'eroded-blur'),
          node('feComposite', { in: 'a', in2: 'eroded-blur', operator: 'out' }, 'ring'),
          node('feSpecularLighting', { in: 'ring', surfaceScale: -4, specularExponent: 128, azimuth: 140, elevation: 65 }, 'spec'),
          node('feDiffuseLighting', { in: 'ring', surfaceScale: 2.5, azimuth: 319, elevation: 55 }, 'diffuse'),
          node('feComposite', { in: 'spec', in2: 'diffuse', operator: 'over' }, 'lit'),
          node('feTurbulence', { baseFrequency: 0.51, numOctaves: 3 }, 'noise'),
          node('feBlend', { in: 'lit', in2: 'noise', mode: 'hard-light' }, 'textured'),
          node('feComposite', { in: 'textured', in2: 'SourceGraphic', operator: 'in' }, 'clipped'),
          node('feBlend', { in: 'clipped', in2: 'SourceGraphic', mode: 'multiply' }, 'tinted'),
          node('feDropShadow', { in: 'tinted', dx: -5, dy: 7, stdDeviation: 4.5, 'flood-opacity': 0.6 }),
        ],
        { settings: { id: 'tray' } },
      ),
  },
  {
    slug: 'invert',
    name: 'Inverter cores',
    description: 'feComponentTransfer com tabela "1 0" em R, G e B.',
    source: 'shapes',
    make: () =>
      makeDoc(
        [
          node('feComponentTransfer', {
            R_type: 'table', R_tableValues: '1 0',
            G_type: 'table', G_tableValues: '1 0',
            B_type: 'table', B_tableValues: '1 0',
          }),
        ],
        { settings: { id: 'invert' } },
      ),
  },
]

export { newId, node, makeDoc, emptyDoc, PRESETS, DEFAULT_SETTINGS, DEFAULT_LAYER }
export type { TPreset }
