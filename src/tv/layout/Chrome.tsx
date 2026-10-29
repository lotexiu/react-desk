import type { CSSProperties } from 'react'
import { BitwiseUtils, Mask } from '@lotexiu/typescript'
import { NOTIFICATIONS, WEATHER } from '../catalog/mock-content'
import { Surface } from '../glass/Surface'
import { NAV_ITEMS, activateNav, navIndex, section, zone } from '../navigation/navigation'
import { useMutableReactive, useReactive } from '@lotexiu/react'
import { dateLabel, timeLabel } from '../system/clock'
import { isPlaying, playbackProgress, playing, position } from '../playback/playback'
import { keyboard, remoteUi } from '../input/remote'
import { query } from '../catalog/catalog'
import { showRemote } from '../system/settings'
import { toast } from '../system/toast'
import { Art } from '../ui/Art'
import { Icon } from '../ui/Icon'

function TopBar() {
	const time = useReactive(timeLabel)
	const date = useReactive(dateLabel)
	const text = useReactive(query)
	return (
		<Surface className="topbar" refract={false}>
			<label className="search">
				<Icon name="search" size="1.3em" />
				<input
					id="tv-search"
					type="text"
					value={text}
					placeholder="Buscar filmes, séries, canais e apps"
					onChange={(event) => query.set(event.target.value)}
					autoComplete="off"
				/>
			</label>
			<div className="topbar__spacer" />
			<span className="topbar__item" title={WEATHER.label}>
				<Icon name="sun" size="1.3em" /> {WEATHER.temp}° <small>{WEATHER.city}</small>
			</span>
			<span className="topbar__item topbar__bell">
				<Icon name="bell" size="1.3em" />
				<b className="count">{NOTIFICATIONS}</b>
			</span>
			<span className="topbar__clock">
				<strong>{time}</strong>
				<small>{date}</small>
			</span>
			<span className="avatar">
				<Icon name="user" size="1.3em" />
			</span>
		</Surface>
	)
}

function Sidebar() {
	const active = useReactive(section)
	const focused = useReactive(navIndex)
	const inNav = useReactive(zone) === 'nav'
	return (
		<Surface className="sidebar" role="navigation" refract={false}>
			<span className="sidebar__logo" aria-hidden>
				A
			</span>
			{NAV_ITEMS.map((item, index) => (
				<button
					key={item.id}
					className="nav-item"
					data-active={item.id === active}
					data-focused={inNav && focused === index}
					onMouseEnter={() => {
						zone.set('nav')
						navIndex.set(index)
					}}
					onClick={() => activateNav(item)}
					tabIndex={-1}
				>
					<Icon name={item.icon} size="1.7em" />
					<span>{item.label}</span>
				</button>
			))}
		</Surface>
	)
}

/**
 * `h:mm:ss` / `m:ss` — o preset neutro de duração da `Mask`: tipado em milissegundos, texto
 * alinhado à direita.
 */
const CLOCK = Mask.of<number>('duration-clock')

function NowPlaying() {
	const track = useReactive(playing)
	const progress = useReactive(playbackProgress)
	const ms = useReactive(position)
	const running = useReactive(isPlaying)
	return (
		<Surface className="nowplaying">
			<div className="nowplaying__art">
				<Art seed={track.seed} variant={1} />
			</div>
			<div className="nowplaying__info">
				<strong>{track.title}</strong>
				<small>{track.subtitle}</small>
				<span className="bar" style={{ '--p': progress } as CSSProperties}>
					<i />
				</span>
				<small className="nowplaying__time">
					{CLOCK.format(ms)} / {CLOCK.format(track.totalMs)}
				</small>
			</div>
			<button
				className="btn btn--round btn--primary"
				onClick={() => isPlaying.toggle()}
				aria-label={running ? 'Pausar' : 'Reproduzir'}
				tabIndex={-1}
			>
				<Icon name={running ? 'pause' : 'play'} size="1.4em" />
			</button>
		</Surface>
	)
}

const KEYS = [
	{ code: 'ArrowUp', glyph: '▲' },
	{ code: 'ArrowLeft', glyph: '◀' },
	{ code: 'ArrowDown', glyph: '▼' },
	{ code: 'ArrowRight', glyph: '▶' },
]

/**
 * Simula o controle remoto: acende conforme as teclas pressionadas (`KeyboardState` +
 * `uiInteraction`).
 */
function RemoteHud() {
	const pressed = useMutableReactive(keyboard.keys)
	const uiState = useReactive(remoteUi.state)
	const visible = useReactive(showRemote)
	if (!visible) return null
	const okPressed = BitwiseUtils.isEnabled(uiState, remoteUi.state.flags.active)
	return (
		<Surface className="remote" refract={false}>
			<div className="remote__pad">
				{KEYS.map((key) => (
					<kbd key={key.code} data-down={pressed.has(key.code)} data-pos={key.code}>
						{key.glyph}
					</kbd>
				))}
				<kbd data-down={okPressed} data-pos="Enter" className="remote__ok">
					OK
				</kbd>
			</div>
			<p>
				<b>1–7</b> estilo · <b>T</b> claro/escuro · <b>M</b> ajustes · <b>Z/Y</b> desfazer/refazer ·{' '}
				<b>[ ]</b> destaque
			</p>
		</Surface>
	)
}

function Toast() {
	const message = useReactive(toast)
	if (message === null) return null
	return (
		<Surface className="toast" role="status" key={message} refract={false}>
			{message}
		</Surface>
	)
}

export { TopBar, Sidebar, NowPlaying, RemoteHud, Toast }
