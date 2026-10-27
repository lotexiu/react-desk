import { defaultParams, getPrimitive } from './primitives'
import type { TFilterDoc, TFilterNode, TParamValue, TSvgElement } from './types'

type TMode = 'svg' | 'jsx'
type TPreviewSource = 'rect' | 'shapes' | 'text' | 'background'

const MAX_LINE = 90

const sanitizeId = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, '-') || 'filter'

const escapeAttr = (v: TParamValue) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const kebabToCamel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

const pascal = (id: string) => {
  const name = id.split(/[^A-Za-z0-9]+/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('')
  return /^[A-Za-z]/.test(name) ? name : `Filter${name}`
}

/** Nomes legíveis de `result` por nó: `turbulence`, `colormatrix`, `colormatrix2`… */
function resultNames(nodes: TFilterNode[]): Map<string, string> {
  const counts = new Map<string, number>()
  const names = new Map<string, string>()
  for (const node of nodes) {
    const base = node.tag.replace(/^fe/, '').toLowerCase()
    const n = (counts.get(base) ?? 0) + 1
    counts.set(base, n)
    names.set(node.id, n === 1 ? base : `${base}${n}`)
  }
  return names
}

/** Monta a árvore do `<filter>`. Nós desligados são ignorados e referências inválidas caem no "resultado anterior". */
function buildFilterElement(doc: TFilterDoc, idOverride?: string): TSvgElement {
  const { settings } = doc
  const nodes = doc.nodes.filter((n) => n.enabled)
  const names = resultNames(nodes)
  const referenced = new Set<string>()

  const children = nodes.map((node, index) => {
    const earlier = new Set(nodes.slice(0, index).map((n) => n.id))
    const resolve = (ref: TParamValue): string | undefined => {
      const value = String(ref ?? '')
      if (value === 'SourceGraphic' || value === 'SourceAlpha') return value
      if (earlier.has(value)) {
        referenced.add(value)
        return names.get(value)
      }
      return undefined
    }
    return { node, element: getPrimitive(node.tag).build(node.params, resolve) }
  })

  return {
    tag: 'filter',
    attrs: {
      id: idOverride ?? sanitizeId(settings.id),
      x: settings.x,
      y: settings.y,
      width: settings.width,
      height: settings.height,
      filterUnits: settings.filterUnits,
      primitiveUnits: settings.primitiveUnits,
      'color-interpolation-filters': settings.colorInterpolationFilters,
    },
    children: children.map(({ node, element }) =>
      referenced.has(node.id) ? { ...element, attrs: { ...element.attrs, result: names.get(node.id)! } } : element,
    ),
  }
}

function formatAttr(name: string, value: TParamValue, mode: TMode): string {
  return `${mode === 'jsx' ? kebabToCamel(name) : name}="${escapeAttr(value)}"`
}

/** Renderiza o elemento como linhas indentadas com 2 espaços. */
function renderElement(element: TSvgElement, mode: TMode): string[] {
  const attrs = Object.entries(element.attrs).map(([k, v]) => formatAttr(k, v, mode))
  const oneLine = `<${element.tag}${attrs.length ? ' ' : ''}${attrs.join(' ')}`
  const wrap = oneLine.length > MAX_LINE
  const selfClose = !element.children?.length

  const open = wrap ? [`<${element.tag}`, ...attrs.map((a) => `  ${a}`)] : [oneLine]
  if (selfClose) {
    if (wrap) return [...open, '/>']
    return [`${oneLine} />`]
  }
  const head = wrap ? [...open, '>'] : [`${oneLine}>`]
  const body = element.children!.flatMap((c) => renderElement(c, mode).map((l) => `  ${l}`))
  return [...head, ...body, `</${element.tag}>`]
}

const indent = (lines: string[], depth: number) => lines.map((l) => `${'  '.repeat(depth)}${l}`)

/** Só o `<filter>…</filter>`, em SVG puro ou JSX. */
function toFilterMarkup(doc: TFilterDoc, mode: TMode): string {
  return renderElement(buildFilterElement(doc), mode).join('\n')
}

/** Componente React completo (mesmo formato do `Grain.tsx`). */
function toComponent(doc: TFilterDoc): string {
  const { layer } = doc
  const id = sanitizeId(doc.settings.id)
  const name = pascal(id)

  const style: string[] = []
  if (layer.fixedOverlay) style.push("position: 'fixed'", 'inset: 0')
  style.push("width: '100%'", "height: '100%'")
  if (layer.fixedOverlay) style.push("pointerEvents: 'none'")
  if (layer.blendMode !== 'normal') style.push(`mixBlendMode: '${layer.blendMode}'`)
  if (layer.opacity !== 1) style.push(`opacity: ${layer.opacity}`)

  const lines = [
    `/** Gerado no Filter Lab. */`,
    `function ${name}() {`,
    `  return (`,
    `    <svg`,
    `      xmlns="http://www.w3.org/2000/svg"`,
    `      style={{`,
    ...style.map((s) => `        ${s},`),
    `      }}`,
    `    >`,
    ...indent(renderElement(buildFilterElement(doc), 'jsx'), 3),
    `      <rect width="100%" height="100%" fill="${escapeAttr(layer.fill)}" filter="url(#${id})" />`,
    `    </svg>`,
    `  )`,
    `}`,
    ``,
    `export default ${name}`,
    ``,
  ]
  return lines.join('\n')
}

/** Markup de um único nó (para a seção "Sintaxe" da referência). */
function toNodeMarkup(node: TFilterNode, mode: TMode): string {
  return renderElement(getPrimitive(node.tag).build(node.params, (ref) => (ref === 'SourceGraphic' || ref === 'SourceAlpha' ? String(ref) : undefined)), mode).join('\n')
}

type TFlowStep = { tag: string; result?: string; inputs: string[] }

/** Descreve o que cada etapa recebe — alimenta o painel "Como o navegador executa". */
function describeFlow(doc: TFilterDoc): TFlowStep[] {
  const steps = buildFilterElement(doc).children ?? []
  return steps.map((step, i) => {
    const previous = i === 0 ? 'SourceGraphic' : `etapa ${i} (${steps[i - 1].tag})`
    const ref = (v: TParamValue | undefined) => (v === undefined ? previous : String(v))
    const inputs: string[] = []
    if (!['feTurbulence', 'feFlood', 'feImage'].includes(step.tag)) inputs.push(ref(step.attrs.in))
    if ('in2' in step.attrs) inputs.push(ref(step.attrs.in2))
    return { tag: step.tag, result: step.attrs.result as string | undefined, inputs }
  })
}

const toJson = (doc: TFilterDoc) => JSON.stringify(doc, null, 2)

/** A arte passa 100px da área visível para o `feDisplacementMap` ter o que amostrar perto das bordas. */
const BACKGROUND_ART = `
    <rect x="-100" y="-100" width="800" height="560" fill="#14204f"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${(i - 2) * 50}" y="-100" width="25" height="560" fill="${i % 2 ? '#ff5d8f' : '#ffd166'}" opacity="0.9"/>`).join('')}
    ${Array.from({ length: 18 }, (_, i) => `<rect x="-100" y="${(i - 3) * 30}" width="800" height="3" fill="#fff" opacity="0.7"/>`).join('')}
    <text x="300" y="215" text-anchor="middle" font-size="110" font-weight="800" font-family="sans-serif" fill="#fff">GLASS</text>`

const SOURCES: Record<TPreviewSource, string> = {
  rect: '',
  background: BACKGROUND_ART,
  shapes: `
    <circle cx="170" cy="150" r="80" fill="#ff5d8f"/>
    <rect x="270" y="90" width="190" height="130" rx="24" fill="#3ddc97"/>
    <polygon points="140,300 250,230 360,310" fill="#ffd166"/>
    <text x="400" y="320" font-size="54" font-weight="700" font-family="sans-serif" fill="#ffffff">Aa</text>`,
  text: `
    <text x="300" y="150" text-anchor="middle" font-size="96" font-weight="800" font-family="sans-serif" fill="#ffffff">Filtro</text>
    <text x="300" y="230" text-anchor="middle" font-size="44" font-family="sans-serif" fill="#ffffffcc">SVG lab 123</text>`,
}

/** Marcação do preview — usa o mesmo `<filter>` do export, com id próprio da instância para não colidir com outros previews/filtros da página. */
function buildPreviewSvg(doc: TFilterDoc, source: TPreviewSource, instanceId: string): string {
  const previewId = `preview-${sanitizeId(instanceId)}`
  const filter = renderElement(buildFilterElement(doc, previewId), 'svg').join('\n')
  const { layer } = doc
  const style = `mix-blend-mode: ${layer.blendMode}`
  const content = source === 'rect' ? `<rect width="100%" height="100%" fill="${escapeAttr(layer.fill)}"/>` : SOURCES[source]
  return `<defs>${filter}</defs><g filter="url(#${previewId})" opacity="${layer.opacity}" style="${style}">${content}</g>`
}

/** Lê um JSON exportado, completando parâmetros ausentes e descartando primitivas desconhecidas. */
function parseDoc(json: string, makeId: () => string): TFilterDoc {
  const raw = JSON.parse(json)
  if (!raw || typeof raw !== 'object' || !raw.settings || !raw.layer || !Array.isArray(raw.nodes)) {
    throw new Error('JSON inválido: esperado { settings, layer, nodes }')
  }
  const nodes: TFilterNode[] = []
  for (const n of raw.nodes) {
    try {
      const def = getPrimitive(n.tag)
      nodes.push({ id: typeof n.id === 'string' ? n.id : makeId(), tag: def.tag, enabled: n.enabled !== false, params: { ...defaultParams(def), ...n.params } })
    } catch {
      // primitiva desconhecida: ignora
    }
  }
  return { settings: raw.settings, layer: raw.layer, nodes }
}

export { toFilterMarkup, toNodeMarkup, toComponent, toJson, describeFlow, buildPreviewSvg, parseDoc, sanitizeId, resultNames }
export type { TPreviewSource, TFlowStep }
