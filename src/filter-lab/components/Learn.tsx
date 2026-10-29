import { useState } from 'react'
import { GUIDES, REFERENCE } from '../docs'
import type { TExample } from '../docs'
import { PRIMITIVES, defaultParams, getPrimitive } from '../primitives'
import { toFilterMarkup, toNodeMarkup } from '../serialize'
import type { TPreviewSource } from '../serialize'
import type { TField, TFilterDoc } from '../types'
import CodeBlock from './CodeBlock'
import Preview from './Preview'

type TTopic = { kind: 'guide' | 'ref'; key: string }

type TProps = {
  topic: TTopic
  setTopic: (topic: TTopic) => void
  onOpenInLab: (doc: TFilterDoc, source: TPreviewSource) => void
}

type TDemoProps = {
  title?: string
  caption: string
  source: TPreviewSource
  make: () => TFilterDoc
  onOpenInLab: TProps['onOpenInLab']
}

/** Exemplo vivo: preview + código + botão para abrir a mesma receita no Laboratório. */
function Demo({ title, caption, source, make, onOpenInLab }: TDemoProps) {
  const [doc] = useState(make)
  return (
    <figure className="fl-demo">
      {title && <h4>{title}</h4>}
      <Preview doc={doc} source={source} />
      <figcaption>{caption}</figcaption>
      <div className="fl-bar">
        <button type="button" onClick={() => onOpenInLab(make(), source)}>Abrir no Laboratório</button>
      </div>
      <details className="fl-panel">
        <summary>Ver código</summary>
        <CodeBlock code={toFilterMarkup(doc, 'jsx')} label="JSX" />
      </details>
    </figure>
  )
}

const kindLabel = (field: TField) => {
  switch (field.kind) {
    case 'number': return field.min !== undefined && field.max !== undefined ? `número (${field.min}–${field.max})` : 'número'
    case 'select': return field.options.join(' | ')
    case 'color': return 'cor'
    case 'input': return 'referência (in)'
    default: return 'texto'
  }
}

const defaultLabel = (field: TField) => (field.kind === 'input' && field.default === '' ? 'resultado anterior' : String(field.default))

function Reference({ tag, onOpenInLab }: { tag: string; onOpenInLab: TProps['onOpenInLab'] }) {
  const def = getPrimitive(tag)
  const docs = REFERENCE[tag]
  // componentTransfer repete os mesmos campos para R/G/B/A: documenta só um canal.
  const fields = def.fields.filter((field) => !field.group?.startsWith('Canal ') || field.group === 'Canal R')
  const syntax = toNodeMarkup({ id: 'example', tag, enabled: true, params: defaultParams(def) }, 'svg')

  return (
    <article className="fl-article">
      <h2>{def.label} <code>&lt;{tag}&gt;</code></h2>
      <p className="fl-lead">{docs.summary}</p>

      <h3>Como funciona</h3>
      {docs.how.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

      <h3>Sintaxe</h3>
      <CodeBlock code={syntax} label="SVG (valores padrão do Laboratório)" />

      <h3>Atributos</h3>
      <div className="fl-table-wrap">
        <table className="fl-table">
          <thead><tr><th>Campo</th><th>Valores</th><th>Padrão</th><th>O que faz</th></tr></thead>
          <tbody>
            {fields.map((field) => {
              const key = field.key.replace(/^R_/, '')
              return (
                <tr key={field.key}>
                  <td><code>{key}</code></td>
                  <td>{kindLabel(field)}</td>
                  <td>{defaultLabel(field)}</td>
                  <td>{docs.help[key] ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h3>Exemplos</h3>
      {docs.examples.map((example: TExample) => (
        <Demo key={example.title} title={example.title} caption={example.text} source={example.source} make={example.make} onOpenInLab={onOpenInLab} />
      ))}

      {docs.tips.length > 0 && (
        <>
          <h3>Dicas e armadilhas</h3>
          <ul>{docs.tips.map((tip, index) => <li key={index}>{tip}</li>)}</ul>
        </>
      )}

      <p className="fl-hint">
        Referência completa:{' '}
        <a href={`https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/${tag}`} target="_blank" rel="noreferrer">MDN — {tag}</a>
      </p>
    </article>
  )
}

function Guide({ slug, onOpenInLab }: { slug: string; onOpenInLab: TProps['onOpenInLab'] }) {
  const guide = GUIDES.find((candidate) => candidate.slug === slug) ?? GUIDES[0]
  return (
    <article className="fl-article">
      <h2>{guide.title}</h2>
      {guide.blocks.map((block, index) => {
        if (block.type === 'p') return <p key={index}>{block.text}</p>
        if (block.type === 'code') return <CodeBlock key={index} code={block.code} />
        if (block.type === 'note') return <aside key={index} className="fl-note">{block.text}</aside>
        return <Demo key={index} caption={block.caption} source={block.source} make={block.make} onOpenInLab={onOpenInLab} />
      })}
    </article>
  )
}

function Learn({ topic, setTopic, onOpenInLab }: TProps) {
  return (
    <div className="fl-learn">
      <nav className="fl-nav" aria-label="Tópicos">
        <h3>Guias</h3>
        {GUIDES.map((guideEntry) => (
          <button key={guideEntry.slug} type="button" aria-current={topic.kind === 'guide' && topic.key === guideEntry.slug} onClick={() => setTopic({ kind: 'guide', key: guideEntry.slug })}>
            {guideEntry.title}
          </button>
        ))}
        <h3>Primitivas</h3>
        {PRIMITIVES.map((primitive) => (
          <button key={primitive.tag} type="button" aria-current={topic.kind === 'ref' && topic.key === primitive.tag} onClick={() => setTopic({ kind: 'ref', key: primitive.tag })}>
            {primitive.tag}
          </button>
        ))}
      </nav>
      {topic.kind === 'ref' ? <Reference key={topic.key} tag={topic.key} onOpenInLab={onOpenInLab} /> : <Guide key={topic.key} slug={topic.key} onOpenInLab={onOpenInLab} />}
    </div>
  )
}

export default Learn
export type { TTopic }
