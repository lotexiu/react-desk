import { useState } from 'react'
import Lab from './components/Lab'
import Learn from './components/Learn'
import type { TTopic } from './components/Learn'
import { PRESETS } from './presets'
import type { TPreviewSource } from './serialize'
import type { TFilterDoc } from './types'
import './FilterLab.css'

type TTab = 'lab' | 'learn'

/** Laboratório de filtros SVG: monte, teste, copie o resultado e aprenda como cada peça funciona. */
function FilterLab() {
  const [tab, setTab] = useState<TTab>('lab')
  const [doc, setDoc] = useState<TFilterDoc>(() => PRESETS[0].make())
  const [source, setSource] = useState<TPreviewSource>(PRESETS[0].source)
  const [topic, setTopic] = useState<TTopic>({ kind: 'guide', key: 'o-que-e' })

  const learn = (tag: string) => {
    setTopic({ kind: 'ref', key: tag })
    setTab('learn')
  }

  const openInLab = (next: TFilterDoc, nextSource: TPreviewSource) => {
    setDoc(next)
    setSource(nextSource)
    setTab('lab')
  }

  return (
    <div className="fl-root">
      <header className="fl-header">
        <h1>SVG Filter Lab</h1>
        <div className="fl-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'lab'} onClick={() => setTab('lab')}>Laboratório</button>
          <button type="button" role="tab" aria-selected={tab === 'learn'} onClick={() => setTab('learn')}>Aprender</button>
        </div>
      </header>
      {tab === 'lab' ? (
        <Lab doc={doc} setDoc={(update) => setDoc(update)} source={source} setSource={setSource} onLearn={learn} />
      ) : (
        <Learn topic={topic} setTopic={setTopic} onOpenInLab={openInLab} />
      )}
    </div>
  )
}

export default FilterLab
