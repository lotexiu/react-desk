import { useState } from 'react'
import { REFERENCE } from '../docs'
import { BLEND_MODES, PRIMITIVES, getPrimitive } from '../primitives'
import { emptyDoc, newId, node, PRESETS } from '../presets'
import { describeFlow, parseDoc, resultNames, toComponent, toFilterMarkup, toJson, sanitizeId } from '../serialize'
import type { TPreviewSource } from '../serialize'
import type { TField, TFilterDoc, TFilterNode, TFilterSettings, TLayerSettings, TParamValue } from '../types'
import CodeBlock from './CodeBlock'
import Preview from './Preview'
import type { TBackground } from './Preview'

type TProps = {
  doc: TFilterDoc
  setDoc: (update: (doc: TFilterDoc) => TFilterDoc) => void
  source: TPreviewSource
  setSource: (source: TPreviewSource) => void
  onLearn: (tag: string) => void
}

type TOutputTab = 'jsx' | 'svg' | 'component' | 'json'

const OUTPUT_TABS: { key: TOutputTab; label: string }[] = [
  { key: 'jsx', label: 'JSX' },
  { key: 'svg', label: 'SVG' },
  { key: 'component', label: 'Componente React' },
  { key: 'json', label: 'JSON' },
]

const SOURCES: { key: TPreviewSource; label: string }[] = [
  { key: 'rect', label: 'Retângulo (overlay)' },
  { key: 'shapes', label: 'Formas' },
  { key: 'text', label: 'Texto' },
  { key: 'background', label: 'Fundo para distorcer (vidro)' },
]

const BACKGROUNDS: { key: TBackground; label: string }[] = [
  { key: 'vivid', label: 'Vívido (teal · violeta · laranja)' },
  { key: 'sunset', label: 'Pôr do sol (rosa · âmbar · azul)' },
  { key: 'aurora', label: 'Aurora (verde · ciano · magenta)' },
  { key: 'page', label: 'Fundo da página' },
  { key: 'dark', label: 'Escuro' },
  { key: 'light', label: 'Claro' },
  { key: 'checker', label: 'Xadrez' },
]

const fieldHelp = (tag: string, key: string) => {
  const help = REFERENCE[tag]?.help ?? {}
  return help[key] ?? help[key.replace(/^[RGBA]_/, '')]
}

type TFieldProps = {
  field: TField
  value: TParamValue
  inputOptions: { value: string; label: string }[]
  hint?: string
  onChange: (value: TParamValue) => void
}

function FieldControl({ field, value, inputOptions, hint, onChange }: TFieldProps) {
  let control
  if (field.kind === 'number') {
    const hasRange = field.min !== undefined && field.max !== undefined
    const set = (raw: string) => {
      const parsedNumber = Number(raw)
      if (raw !== '' && Number.isFinite(parsedNumber)) onChange(parsedNumber)
    }
    control = (
      <div className="fl-number">
        {hasRange && (
          <input type="range" min={field.min} max={field.max} step={field.step} value={Number(value)} onChange={(event) => set(event.target.value)} />
        )}
        <input type="number" min={field.min} max={field.max} step={field.step} value={Number(value)} onChange={(event) => set(event.target.value)} />
      </div>
    )
  } else if (field.kind === 'select') {
    control = (
      <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  } else if (field.kind === 'color') {
    control = (
      <div className="fl-color">
        <input type="color" value={String(value)} onChange={(event) => onChange(event.target.value)} />
        <input type="text" value={String(value)} onChange={(event) => onChange(event.target.value)} />
      </div>
    )
  } else if (field.kind === 'input') {
    const current = inputOptions.some((option) => option.value === value) ? String(value) : ''
    control = (
      <select value={current} onChange={(event) => onChange(event.target.value)}>
        {inputOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    )
  } else {
    const readFile = (file: File | undefined) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => onChange(String(reader.result))
      reader.readAsDataURL(file)
    }
    control = (
      <>
        <input type="text" value={String(value)} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
        {field.pickFile && (
          <input type="file" accept="image/*" onChange={(event) => { readFile(event.target.files?.[0]); event.target.value = '' }} />
        )}
      </>
    )
  }

  return (
    <label className="fl-field">
      <span className="fl-field-label">{field.label}</span>
      {control}
      {hint && <small className="fl-hint">{hint}</small>}
    </label>
  )
}

type TNodeCardProps = {
  doc: TFilterDoc
  index: number
  item: TFilterNode
  hints: boolean
  open: boolean
  onToggle: () => void
  setDoc: TProps['setDoc']
  onLearn: (tag: string) => void
}

function NodeCard({ doc, index, item, hints, open, onToggle, setDoc, onLearn }: TNodeCardProps) {
  const def = getPrimitive(item.tag)

  const enabled = doc.nodes.filter((node) => node.enabled)
  const names = resultNames(enabled)
  const earlier = doc.nodes.slice(0, index).filter((node) => node.enabled)
  const inputOptions = [
    { value: '', label: index === 0 ? '(SourceGraphic — primeira etapa)' : '(resultado anterior)' },
    { value: 'SourceGraphic', label: 'SourceGraphic' },
    { value: 'SourceAlpha', label: 'SourceAlpha' },
    ...earlier.map((node) => ({ value: node.id, label: `${names.get(node.id)} — ${getPrimitive(node.tag).label}` })),
  ]

  const patch = (fn: (node: TFilterNode) => TFilterNode) =>
    setDoc((previousDoc) => ({ ...previousDoc, nodes: previousDoc.nodes.map((node) => (node.id === item.id ? fn(node) : node)) }))
  const move = (dir: -1 | 1) =>
    setDoc((previousDoc) => {
      const nodes = [...previousDoc.nodes]
      const targetIndex = index + dir
      if (targetIndex < 0 || targetIndex >= nodes.length) return previousDoc
      ;[nodes[index], nodes[targetIndex]] = [nodes[targetIndex], nodes[index]]
      return { ...previousDoc, nodes }
    })
  const remove = () => setDoc((previousDoc) => ({ ...previousDoc, nodes: previousDoc.nodes.filter((node) => node.id !== item.id) }))
  const duplicate = () =>
    setDoc((previousDoc) => {
      const nodes = [...previousDoc.nodes]
      nodes.splice(index + 1, 0, { ...item, id: newId(), params: { ...item.params } })
      return { ...previousDoc, nodes }
    })

  const visibleFields = def.fields.filter((field) => !field.showIf || field.showIf(item.params))

  return (
    <section className={`fl-node${item.enabled ? '' : ' fl-node-off'}`}>
      <header>
        <button type="button" className="fl-fold" onClick={onToggle} aria-expanded={open} title="Recolher/expandir">
          {open ? '▾' : '▸'}
        </button>
        <label className="fl-toggle" title="Ligar/desligar esta etapa">
          <input type="checkbox" checked={item.enabled} onChange={(event) => patch((node) => ({ ...node, enabled: event.target.checked }))} />
          <strong>{index + 1}. {def.label}</strong>
        </label>
        <code>{def.tag}</code>
        <span className="fl-actions">
          <button type="button" onClick={() => move(-1)} disabled={index === 0} title="Subir">↑</button>
          <button type="button" onClick={() => move(1)} disabled={index === doc.nodes.length - 1} title="Descer">↓</button>
          <button type="button" onClick={duplicate} title="Duplicar">⧉</button>
          <button type="button" onClick={remove} title="Remover">✕</button>
        </span>
      </header>
      {open && (
        <div className="fl-node-body">
          <p className="fl-desc">
            {def.description}{' '}
            <button type="button" className="fl-link" onClick={() => onLearn(item.tag)}>Como funciona →</button>
          </p>
          {visibleFields.map((field, index) => {
            const heading = field.group !== visibleFields[index - 1]?.group ? field.group : undefined
            return (
              <div key={field.key}>
                {heading && <h4 className="fl-group">{heading}</h4>}
                <FieldControl
                  field={field}
                  value={item.params[field.key] ?? field.default}
                  inputOptions={inputOptions}
                  hint={hints ? fieldHelp(item.tag, field.key) : undefined}
                  onChange={(newValue) => patch((node) => ({ ...node, params: { ...node.params, [field.key]: newValue } }))}
                />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Lab({ doc, setDoc, source, setSource, onLearn }: TProps) {
  const [background, setBackground] = useState<TBackground>('vivid')
  const [outputTab, setOutputTab] = useState<TOutputTab>('jsx')
  const [hints, setHints] = useState(true)
  // Etapas começam recolhidas; só as ids neste conjunto aparecem expandidas.
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [addTag, setAddTag] = useState(PRIMITIVES[0].tag)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')

  const setSettings = <K extends keyof TFilterSettings>(key: K, value: TFilterSettings[K]) =>
    setDoc((previousDoc) => ({ ...previousDoc, settings: { ...previousDoc.settings, [key]: value } }))
  const setLayer = <K extends keyof TLayerSettings>(key: K, value: TLayerSettings[K]) =>
    setDoc((previousDoc) => ({ ...previousDoc, layer: { ...previousDoc.layer, [key]: value } }))

  const toggleOpen = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  // A etapa recém-criada já nasce expandida para você ajustar.
  const addNode = () => {
    const created = node(addTag)
    setDoc((previousDoc) => ({ ...previousDoc, nodes: [...previousDoc.nodes, created] }))
    setOpenIds((prev) => new Set(prev).add(created.id))
  }

  const loadPreset = (slug: string) => {
    const preset = PRESETS.find((candidate) => candidate.slug === slug)
    if (!preset) return
    setDoc(() => preset.make())
    setSource(preset.source)
  }

  const applyImport = () => {
    try {
      const parsed = parseDoc(importText, newId)
      setDoc(() => parsed)
      setImportError('')
      setImportText('')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Não foi possível importar.')
    }
  }

  const output: Record<TOutputTab, string> = {
    jsx: toFilterMarkup(doc, 'jsx'),
    svg: toFilterMarkup(doc, 'svg'),
    component: toComponent(doc),
    json: toJson(doc),
  }
  const id = sanitizeId(doc.settings.id)
  const usage = outputTab === 'jsx' || outputTab === 'svg' ? `<rect filter="url(#${id})" … />` : ''
  const flow = describeFlow(doc)

  return (
    <div className="fl-lab">
      <div className="fl-col">
        <div className="fl-bar">
          <select value="" onChange={(event) => loadPreset(event.target.value)} aria-label="Carregar receita">
            <option value="" disabled>Carregar receita…</option>
            {PRESETS.map((presetItem) => <option key={presetItem.slug} value={presetItem.slug}>{presetItem.name}</option>)}
          </select>
          <button type="button" onClick={() => setDoc(() => emptyDoc())}>Limpar</button>
          <label className="fl-inline"><input type="checkbox" checked={hints} onChange={(event) => setHints(event.target.checked)} /> Dicas</label>
        </div>

        <details className="fl-panel">
          <summary>Importar JSON</summary>
          <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={5} placeholder="Cole aqui o JSON exportado" />
          <button type="button" onClick={applyImport} disabled={!importText.trim()}>Aplicar</button>
          {importError && <p className="fl-error">{importError}</p>}
        </details>

        <details className="fl-panel">
          <summary>Filtro (id, região, espaço de cor)</summary>
          <label className="fl-field">
            <span className="fl-field-label">id</span>
            <input type="text" value={doc.settings.id} onChange={(event) => setSettings('id', event.target.value)} />
            {hints && <small className="fl-hint">Identificador usado em filter="url(#id)". Precisa ser único no documento.</small>}
          </label>
          <div className="fl-grid4">
            {(['x', 'y', 'width', 'height'] as const).map((settingKey) => (
              <label key={settingKey} className="fl-field">
                <span className="fl-field-label">{settingKey}</span>
                <input type="text" value={doc.settings[settingKey]} onChange={(event) => setSettings(settingKey, event.target.value)} />
              </label>
            ))}
          </div>
          {hints && <small className="fl-hint">Região onde o filtro desenha. Efeitos que se espalham (blur, sombra) são cortados fora dela.</small>}
          <label className="fl-field">
            <span className="fl-field-label">filterUnits</span>
            <select value={doc.settings.filterUnits} onChange={(event) => setSettings('filterUnits', event.target.value as TFilterSettings['filterUnits'])}>
              <option>objectBoundingBox</option>
              <option>userSpaceOnUse</option>
            </select>
          </label>
          <label className="fl-field">
            <span className="fl-field-label">primitiveUnits</span>
            <select value={doc.settings.primitiveUnits} onChange={(event) => setSettings('primitiveUnits', event.target.value as TFilterSettings['primitiveUnits'])}>
              <option>userSpaceOnUse</option>
              <option>objectBoundingBox</option>
            </select>
          </label>
          <label className="fl-field">
            <span className="fl-field-label">color-interpolation-filters</span>
            <select value={doc.settings.colorInterpolationFilters} onChange={(event) => setSettings('colorInterpolationFilters', event.target.value as TFilterSettings['colorInterpolationFilters'])}>
              <option>sRGB</option>
              <option>linearRGB</option>
            </select>
            {hints && <small className="fl-hint">Espaço de cor da matemática do filtro. sRGB costuma casar melhor com o que se vê em CSS.</small>}
          </label>
        </details>

        <details className="fl-panel">
          <summary>Camada (como o resultado é aplicado)</summary>
          {hints && <small className="fl-hint">Estes valores afetam o preview e o <em>Componente React</em> exportado — não fazem parte do &lt;filter&gt;.</small>}
          <label className="fl-field">
            <span className="fl-field-label">Preenchimento do retângulo</span>
            <input type="text" value={doc.layer.fill} onChange={(event) => setLayer('fill', event.target.value)} />
          </label>
          <label className="fl-field">
            <span className="fl-field-label">Opacidade</span>
            <div className="fl-number">
              <input type="range" min={0} max={1} step={0.01} value={doc.layer.opacity} onChange={(event) => setLayer('opacity', Number(event.target.value))} />
              <input type="number" min={0} max={1} step={0.01} value={doc.layer.opacity} onChange={(event) => setLayer('opacity', Number(event.target.value))} />
            </div>
          </label>
          <label className="fl-field">
            <span className="fl-field-label">mix-blend-mode</span>
            <select value={doc.layer.blendMode} onChange={(event) => setLayer('blendMode', event.target.value)}>
              {BLEND_MODES.map((blendMode) => <option key={blendMode}>{blendMode}</option>)}
            </select>
          </label>
          <label className="fl-inline">
            <input type="checkbox" checked={doc.layer.fixedOverlay} onChange={(event) => setLayer('fixedOverlay', event.target.checked)} />
            Overlay fixo em tela cheia (componente exportado)
          </label>
        </details>

        <div className="fl-bar fl-steps-bar">
          <h3 className="fl-h">Etapas ({doc.nodes.length})</h3>
          <button type="button" onClick={() => setOpenIds(new Set(doc.nodes.map((node) => node.id)))} disabled={doc.nodes.length === 0}>Expandir tudo</button>
          <button type="button" onClick={() => setOpenIds(new Set())} disabled={openIds.size === 0}>Recolher tudo</button>
        </div>
        {doc.nodes.length === 0 && <p className="fl-empty">Nenhuma etapa. Adicione uma primitiva abaixo ou carregue uma receita.</p>}
        {doc.nodes.map((item, index) => (
          <NodeCard key={item.id} doc={doc} index={index} item={item} hints={hints} open={openIds.has(item.id)} onToggle={() => toggleOpen(item.id)} setDoc={setDoc} onLearn={onLearn} />
        ))}

        <div className="fl-bar fl-add">
          <select value={addTag} onChange={(event) => setAddTag(event.target.value)} aria-label="Primitiva a adicionar">
            {PRIMITIVES.map((primitive) => <option key={primitive.tag} value={primitive.tag}>{primitive.label} ({primitive.tag})</option>)}
          </select>
          <button type="button" onClick={addNode}>+ Adicionar etapa</button>
        </div>
      </div>

      <div className="fl-col fl-sticky">
        <div className="fl-bar">
          <select value={source} onChange={(event) => setSource(event.target.value as TPreviewSource)} aria-label="Amostra">
            {SOURCES.map((sampleOption) => <option key={sampleOption.key} value={sampleOption.key}>{sampleOption.label}</option>)}
          </select>
          <select value={background} onChange={(event) => setBackground(event.target.value as TBackground)} aria-label="Fundo">
            {BACKGROUNDS.map((backgroundOption) => <option key={backgroundOption.key} value={backgroundOption.key}>{backgroundOption.label}</option>)}
          </select>
        </div>
        <Preview doc={doc} source={source} background={background} />

        <details className="fl-panel" open>
          <summary>Como o navegador executa</summary>
          {flow.length === 0 ? (
            <p className="fl-empty">Sem etapas: o elemento aparece sem filtro.</p>
          ) : (
            <ol className="fl-flow">
              {flow.map((flowStep, index) => (
                <li key={index}>
                  <code>{flowStep.tag}</code>
                  {flowStep.inputs.length ? <> recebe <em>{flowStep.inputs.join(' + ')}</em></> : <> cria a imagem do zero</>}
                  {flowStep.result && <> e guarda como <code>{flowStep.result}</code></>}
                </li>
              ))}
              <li>O último resultado é o que aparece na tela.</li>
            </ol>
          )}
        </details>

        <div className="fl-tabs" role="tablist">
          {OUTPUT_TABS.map((tab) => (
            <button key={tab.key} type="button" role="tab" aria-selected={outputTab === tab.key} onClick={() => setOutputTab(tab.key)}>{tab.label}</button>
          ))}
        </div>
        <CodeBlock code={output[outputTab]} label={OUTPUT_TABS.find((tab) => tab.key === outputTab)?.label} />
        {usage && <p className="fl-hint">Para aplicar: {usage}</p>}
      </div>
    </div>
  )
}

export default Lab
