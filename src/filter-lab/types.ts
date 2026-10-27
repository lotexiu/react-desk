type TParamValue = string | number

type TParams = Record<string, TParamValue>

/** Elemento SVG em forma de árvore — os atributos usam o nome SVG (`flood-color`, `baseFrequency`). */
type TSvgElement = {
  tag: string
  attrs: Record<string, TParamValue>
  children?: TSvgElement[]
}

type TFieldBase = {
  key: string
  label: string
  /** Agrupa visualmente campos (ex.: canal R/G/B/A do componentTransfer). */
  group?: string
  /** O campo só aparece quando o predicado retorna true. */
  showIf?: (params: TParams) => boolean
}

type TField = TFieldBase &
  (
    | { kind: 'number'; default: number; min?: number; max?: number; step?: number }
    | { kind: 'select'; default: string; options: string[] }
    | { kind: 'text'; default: string; placeholder?: string; /** Mostra um seletor de arquivo que preenche o campo com um data URI. */ pickFile?: boolean }
    | { kind: 'color'; default: string }
    /** Referência a outro resultado: '' = resultado anterior, 'SourceGraphic', 'SourceAlpha' ou o id de um nó anterior. */
    | { kind: 'input'; default: string }
  )

type TPrimitiveDef = {
  /** Nome do elemento SVG, ex.: `feTurbulence`. */
  tag: string
  label: string
  description: string
  fields: TField[]
  /** `resolve` converte uma referência de input (`in`/`in2`) no valor SVG final (ou `undefined` para omitir). */
  build: (params: TParams, resolve: (ref: TParamValue) => string | undefined) => TSvgElement
}

type TFilterNode = {
  id: string
  tag: string
  enabled: boolean
  params: TParams
}

type TFilterSettings = {
  id: string
  x: string
  y: string
  width: string
  height: string
  filterUnits: 'objectBoundingBox' | 'userSpaceOnUse'
  primitiveUnits: 'userSpaceOnUse' | 'objectBoundingBox'
  colorInterpolationFilters: 'sRGB' | 'linearRGB'
}

type TLayerSettings = {
  /** Preenchimento do retângulo do overlay (`transparent` para ruído puro). */
  fill: string
  opacity: number
  blendMode: string
  /** Só afeta o componente exportado: cobre a tela inteira sem capturar cliques. */
  fixedOverlay: boolean
}

type TFilterDoc = {
  settings: TFilterSettings
  layer: TLayerSettings
  nodes: TFilterNode[]
}

type TPreset = {
  name: string
  doc: TFilterDoc
}

export type {
  TParamValue,
  TParams,
  TSvgElement,
  TField,
  TPrimitiveDef,
  TFilterNode,
  TFilterSettings,
  TLayerSettings,
  TFilterDoc,
  TPreset,
}
