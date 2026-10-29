import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import Grain from '../components/Grain'
import { NowPlaying, RemoteHud, Sidebar, Toast, TopBar } from './layout/Chrome'
import { Overlays } from './layout/Overlays'
import { Row } from './catalog/Row'
import { appearance } from './appearance/appearance'
import { onBlur, onKeyDown, onKeyUp } from './input/keys'
import { heroIndex, retryCatalog, rows, zone } from './navigation/navigation'
import { bindPointer } from './input/pointer'
import { useReactive } from '@lotexiu/react'
import { catalog, normalizedQuery } from './catalog/catalog'
import { nightLight } from './system/settings'
import { startClock } from './system/clock'
import { startPlayback } from './playback/playback'
import { Icon } from './ui/Icon'
import './styles/base.css'
import './appearance/styles/liquid-glass.css'
import './appearance/styles/acrylic.css'
import './appearance/styles/material.css'
import './appearance/styles/neumorphism.css'
import './appearance/styles/brutalist.css'
import './appearance/styles/neon.css'
import './appearance/styles/minimal.css'

const HERO_ROTATE_MS = 9000

function Wallpaper() {
	return (
		<div className="tv-wallpaper" aria-hidden>
			<div className="wp-mesh" />
			<i className="wp-orb wp-orb--1" />
			<i className="wp-orb wp-orb--2" />
			<i className="wp-orb wp-orb--3" />
			<div className="wp-grid" />
		</div>
	)
}

const SKELETON_ROWS = 3

function Skeleton() {
	return (
		<div className="skeleton" aria-busy>
			<div className="skeleton__hero" />
			{Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
				<div key={rowIndex} className="skeleton__row">
					{Array.from({ length: 6 }, (_, cardIndex) => (
						<i key={cardIndex} />
					))}
				</div>
			))}
		</div>
	)
}

function CatalogError({ message }: { message: string }) {
	return (
		<div className="empty">
			<p>Não foi possível carregar o catálogo.</p>
			<small>{message}</small>
			<button className="btn btn--primary" onClick={retryCatalog}>
				<Icon name="redo" size="1.2em" /> Tentar de novo
			</button>
		</div>
	)
}

function Content() {
	const list = useReactive(rows)
	const query = useReactive(normalizedQuery)
	const data = useReactive(catalog.data)
	const loading = useReactive(catalog.loading)
	const error = useReactive(catalog.error)
	const empty = list.length === 0
	return (
		<main className="tv-content">
			{list.map((row, rowIndex) => (
				<Row key={row.id} row={row} index={rowIndex} />
			))}
			{empty && data === undefined && error === undefined && <Skeleton />}
			{empty && error !== undefined && data === undefined && (
				<CatalogError message={error.message} />
			)}
			{empty && data !== undefined && <p className="empty">Nada encontrado para “{query}”.</p>}
			{loading && data !== undefined && <span className="refreshing">Atualizando catálogo…</span>}
			{error !== undefined && data !== undefined && (
				<span className="refreshing refreshing--error">Falha ao atualizar: {error.message}</span>
			)}
		</main>
	)
}

/** Efeitos de ciclo de vida do app: teclado, relógio, reprodução e rotação do destaque. */
function useTvLifecycle(stage: RefObject<HTMLDivElement | null>) {
	useEffect(() => {
		catalog.run()
		const unbindPointer = stage.current ? bindPointer(stage.current) : () => {}
		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('blur', onBlur)
		const stopClock = startClock()
		const stopPlayback = startPlayback()
		const rotate = window.setInterval(() => heroIndex.next(), HERO_ROTATE_MS)
		return () => {
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
			window.removeEventListener('blur', onBlur)
			unbindPointer()
			stopClock()
			stopPlayback()
			window.clearInterval(rotate)
		}
	}, [stage])
}

function TvApp() {
	const stage = useRef<HTMLDivElement>(null)
	useTvLifecycle(stage)
	const vars = useReactive(appearance.cssVars)
	const style = useReactive(appearance.styleId)
	const mode = useReactive(appearance.theme.mode)
	const inNav = useReactive(zone) === 'nav'
	const night = useReactive(nightLight)
	const ambient = useReactive(appearance.ambient)

	return (
		<div className="tv-root" style={vars}>
			<div
				ref={stage}
				className="tv-stage"
				data-style={style.id}
				data-mode={mode}
				data-zone={inNav ? 'nav' : 'content'}
				data-ambient={ambient ? 'on' : 'off'}
			>
				<Wallpaper />
				{(style.glassy || style.id === 'neon') && <Grain />}
				<Content />
				<TopBar />
				<Sidebar />
				<NowPlaying />
				<RemoteHud />
				<Toast />
				<Overlays />
				{night && <div className="nightlight" aria-hidden />}
			</div>
		</div>
	)
}

export { TvApp }
