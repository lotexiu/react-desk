import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { StringUtils } from '@lotexiu/typescript'
import { TITLES } from '../catalog/mock-content'
import { Surface } from '../glass/Surface'
import { closeOverlay, overlay } from '../navigation/navigation'
import { useReactive } from '@lotexiu/react'
import { playTitle } from '../playback/playback'
import { showToast } from '../system/toast'
import { Art } from '../ui/Art'
import { AppearanceTab } from '../appearance/AppearanceTab'
import { Icon } from '../ui/Icon'
import { Segmented } from '../ui/controls'
import { SystemTab } from '../system/SystemTab'

const FOCUSABLE = '[data-pf]:not(:disabled)'

/** Setas movem o foco entre os `[data-pf]` do painel; sliders ficam com ←/→ nativos. */
function panelKeys(event: KeyboardEvent<HTMLElement>) {
	const items = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)]
	const focusedIndex = items.indexOf(document.activeElement as HTMLElement)
	const onRange =
		document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'range'
	const forward = event.key === 'ArrowDown' || (event.key === 'ArrowRight' && !onRange)
	const backward = event.key === 'ArrowUp' || (event.key === 'ArrowLeft' && !onRange)
	if (!forward && !backward) return
	event.preventDefault()
	items[(focusedIndex + (forward ? 1 : -1) + items.length) % items.length]?.focus()
}

function usePanelFocus() {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus(), [])
	return ref
}

type TTab = 'appearance' | 'system'

function SettingsPanel() {
	const [tab, setTab] = useState<TTab>('appearance')
	const ref = usePanelFocus()
	return (
		<Surface className="panel panel--settings">
			<div ref={ref} className="panel__inner" onKeyDown={panelKeys}>
				<header className="panel__header">
					<h2>Ajustes</h2>
					<Segmented
						value={tab}
						options={[
							{ value: 'appearance', label: 'Aparência', icon: 'sliders' },
							{ value: 'system', label: 'Sistema', icon: 'tv' },
						]}
						onChange={setTab}
					/>
					<button className="btn btn--round" onClick={closeOverlay} aria-label="Fechar" data-pf>
						<Icon name="close" size="1.2em" />
					</button>
				</header>
				<div className="panel__body">
					{tab === 'appearance' ? <AppearanceTab /> : <SystemTab />}
				</div>
			</div>
		</Surface>
	)
}

function DetailsPanel({ titleId }: { titleId: string }) {
	const title = TITLES.find((catalogTitle) => catalogTitle.id === titleId)
	const ref = usePanelFocus()
	if (title === undefined) return null
	return (
		<Surface className="panel panel--details">
			<div ref={ref} className="panel__inner details" onKeyDown={panelKeys}>
				<div className="details__poster">
					<Art seed={title.seed} variant={1} />
				</div>
				<div className="details__body">
					<div className="hero__meta">
						<span className="pill pill--accent">{title.kind}</span>
						<span>{title.year}</span>
						<span className="pill">{title.maturity === 'L' ? 'Livre' : `${title.maturity}+`}</span>
						<span>
							<Icon name="star" size="0.95em" /> {title.rating.toFixed(1)}
						</span>
					</div>
					<h2 className="details__title">{title.title}</h2>
					<p className="muted">{title.genres.join(' · ')}</p>
					<p>{StringUtils.truncate(title.synopsis, 220, true)}</p>
					<div className="hero__actions">
						<button
							className="btn btn--primary"
							onClick={() => {
								playTitle(title)
								showToast(`Reproduzindo ${title.title}`)
								closeOverlay()
							}}
							data-pf
						>
							<Icon name="play" size="1.2em" /> {title.progress ? 'Continuar' : 'Assistir'}
						</button>
						<button
							className="btn"
							onClick={() => showToast(`${title.title} adicionado à sua lista`)}
							data-pf
						>
							<Icon name="plus" size="1.2em" /> Minha lista
						</button>
						<button className="btn" onClick={closeOverlay} data-pf>
							Fechar
						</button>
					</div>
				</div>
			</div>
		</Surface>
	)
}

function Overlays() {
	const current = useReactive(overlay)
	if (current === null) return null
	return (
		<div className="overlay" data-kind={current.kind}>
			<div className="overlay__scrim" onClick={closeOverlay} />
			{current.kind === 'settings' ? <SettingsPanel /> : <DetailsPanel titleId={current.titleId} />}
		</div>
	)
}

export { Overlays }
