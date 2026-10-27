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

const kindLabel = (f: TField) => {
  switch (f.kind) {
    case 'number': return f.min !== undefined && f.max !== undefined ? `número (${f.min}–${f.max})` : 'número'
    case 'select': return f.options.join(' | ')
    case 'color': return 'cor'
    case 'input': return 'referência (in)'
    default: return 'texto'
  }
}

const defaultLabel = (f: TField) => (f.kind === 'input' && f.default === '' ? 'resultado anterior' : String(f.default))

function Reference({ tag, onOpenInLab }: { tag: string; onOpenInLab: TProps['onOpenInLab'] }) {
  const def = getPrimitive(tag)
  const docs = REFERENCE[tag]
  // componentTransfer repete os mesmos campos para R/G/B/A: documenta só um canal.
  const fields = def.fields.filter((f) => !f.group?.startsWith('Canal ') || f.group === 'Canal R')
  const syntax = toNodeMarkup({ id: 'example', tag, enabled: true, params: defaultParams(def) }, 'svg')

  return (
    <article className="fl-article">
      <h2>{def.label} <code>&lt;{tag}&gt;</code></h2>
      <p className="fl-lead">{docs.summary}</p>

      <h3>Como funciona</h3>
      {docs.how.map((p, i) => <p key={i}>{p}</p>)}

      <h3>Sintaxe</h3>
      <CodeBlock code={syntax} label="SVG (valores padrão do Laboratório)" />

      <h3>Atributos</h3>
      <div className="fl-table-wrap">
        <table className="fl-table">
          <thead><tr><th>Campo</th><th>Valores</th><th>Padrão</th><th>O que faz</th></tr></thead>
          <tbody>
            {fields.map((f) => {
              const key = f.key.replace(/^R_/, '')
              return (
                <tr key={f.key}>
                  <td><code>{key}</code></td>
                  <td>{kindLabel(f)}</td>
                  <td>{defaultLabel(f)}</td>
                  <td>{docs.help[key] ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h3>Exemplos</h3>
      {docs.examples.map((ex: TExample) => (
        <Demo key={ex.title} title={ex.title} caption={ex.text} source={ex.source} make={ex.make} onOpenInLab={onOpenInLab} />
      ))}

      {docs.tips.length > 0 && (
        <>
          <h3>Dicas e armadilhas</h3>
          <ul>{docs.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
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
  const guide = GUIDES.find((g) => g.slug === slug) ?? GUIDES[0]
  return (
    <article className="fl-article">
      <h2>{guide.title}</h2>
      {guide.blocks.map((b, i) => {
        if (b.type === 'p') return <p key={i}>{b.text}</p>
        if (b.type === 'code') return <CodeBlock key={i} code={b.code} />
        if (b.type === 'note') return <aside key={i} className="fl-note">{b.text}</aside>
        return <Demo key={i} caption={b.caption} source={b.source} make={b.make} onOpenInLab={onOpenInLab} />
      })}
    </article>
  )
}

function Learn({ topic, setTopic, onOpenInLab }: TProps) {
  return (
    <div className="fl-learn">
      <nav className="fl-nav" aria-label="Tópicos">
        <h3>Guias</h3>
        {GUIDES.map((g) => (
          <button key={g.slug} type="button" aria-current={topic.kind === 'guide' && topic.key === g.slug} onClick={() => setTopic({ kind: 'guide', key: g.slug })}>
            {g.title}
          </button>
        ))}
        <h3>Primitivas</h3>
        {PRIMITIVES.map((p) => (
          <button key={p.tag} type="button" aria-current={topic.kind === 'ref' && topic.key === p.tag} onClick={() => setTopic({ kind: 'ref', key: p.tag })}>
            {p.tag}
          </button>
        ))}
      </nav>
      {topic.kind === 'ref' ? <Reference key={topic.key} tag={topic.key} onOpenInLab={onOpenInLab} /> : <Guide key={topic.key} slug={topic.key} onOpenInLab={onOpenInLab} />}
    </div>
  )
}

export default Learn
export type { TTopic }
