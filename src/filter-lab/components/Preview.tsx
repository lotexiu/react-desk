import { useId } from 'react'
import { buildPreviewSvg } from '../serialize'
import type { TPreviewSource } from '../serialize'
import type { TFilterDoc } from '../types'

type TBackground = 'vivid' | 'sunset' | 'aurora' | 'page' | 'dark' | 'light' | 'checker'

type TProps = { doc: TFilterDoc; source: TPreviewSource; background?: TBackground }

/** Renderiza o filtro sobre uma amostra. Usa o mesmo markup do export, com id próprio para não colidir com outros previews. */
function Preview({ doc, source, background = 'vivid' }: TProps) {
  const uid = useId()
  return (
    <div className={`fl-stage fl-bg-${background}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 360"
        preserveAspectRatio="xMidYMid slice"
        dangerouslySetInnerHTML={{ __html: buildPreviewSvg(doc, source, uid) }}
      />
    </div>
  )
}

export default Preview
export type { TBackground }
