import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { MathUtils, StringUtils } from '@lotexiu/typescript'
import { programAt } from '../mocks/content'
import type { TApp, TChannel, TTitle } from '../mocks/content'
import { activateItem, columnOf, focusAt, rowIndex, zone } from '../state/navigation'
import type { TRow } from '../state/rows'
import { useReactive } from '@lotexiu/react'
import { genres, minuteOfDay, sorter } from '../state/system'
import { Art } from './Art'
import { Hero } from './Hero'
import { Icon } from './Icon'

type TFocusable = { focused: boolean; onFocus: () => void; onActivate: () => void }

function PosterCard({ title, index, focused, onFocus, onActivate }: TFocusable & { title: TTitle; index: number }) {
	return (
		<button className="card card--poster" data-focused={focused} onMouseEnter={onFocus} onClick={onActivate} tabIndex={-1}>
			<Art seed={title.seed} variant={index} />
			{title.badge && <span className="badge">{title.badge}</span>}
			<span className="card__label">
				<strong>{title.title}</strong>
				<small>
					<Icon name="star" size="0.9em" /> {title.rating.toFixed(1)} · {title.genres[0]}
				</small>
			</span>
		</button>
	)
}

function WideCard({ title, index, focused, onFocus, onActivate }: TFocusable & { title: TTitle; index: number }) {
	const left = Math.round(title.minutes * (1 - (title.progress ?? 0)))
	return (
		<button className="card card--wide" data-focused={focused} onMouseEnter={onFocus} onClick={onActivate} tabIndex={-1}>
			<Art seed={title.seed} variant={index + 1} />
			<span className="card__label">
				<strong>{title.title}</strong>
				<small>{title.kind === 'Série' ? 'Continuar' : `Faltam ${left} min`}</small>
				<span className="bar" style={{ '--p': title.progress ?? 0 } as CSSProperties}>
					<i />
				</span>
			</span>
		</button>
	)
}

function AppCard({ app, focused, onFocus, onActivate }: TFocusable & { app: TApp }) {
	return (
		<button className="card card--app" data-focused={focused} onMouseEnter={onFocus} onClick={onActivate} tabIndex={-1}>
			<Art seed={app.seed} variant={1} />
			<span className="card__glyph">{app.glyph}</span>
			<span className="card__label card__label--center">{app.name}</span>
		</button>
	)
}

function LiveCard({ channel, focused, onFocus, onActivate }: TFocusable & { channel: TChannel }) {
	const { program, progress, next } = programAt(channel, useReactive(minuteOfDay))
	return (
		<button className="card card--live" data-focused={focused} onMouseEnter={onFocus} onClick={onActivate} tabIndex={-1}>
			<Art seed={channel.seed} variant={2} />
			<span className="live-tag">
				<i /> {StringUtils.padLeft(String(channel.number), '0', 2)} · {channel.name}
			</span>
			<span className="card__label">
				<strong>{program.title}</strong>
				<small>A seguir: {next.title}</small>
				<span className="bar" style={{ '--p': progress } as CSSProperties}>
					<i />
				</span>
			</span>
		</button>
	)
}

function Chip({ label, sortable, focused, onFocus, onActivate }: TFocusable & { label: string; sortable: boolean }) {
	const selected = useReactive(genres).includes(label)
	const sortKey = useReactive(sorter.key)
	const direction = useReactive(sorter.direction)
	const on = sortable ? sortKey === label : selected
	return (
		<button className="chip" data-focused={focused} data-on={on} onMouseEnter={onFocus} onClick={onActivate} tabIndex={-1}>
			{on && !sortable && <Icon name="check" size="1em" />} {label}
			{on && sortable && <span aria-label={direction === 'ASC' ? 'crescente' : 'decrescente'}>{direction === 'ASC' ? '↑' : '↓'}</span>}
		</button>
	)
}

function renderItem(row: TRow, i: number, focus: (col: number) => TFocusable): ReactNode {
	const common = focus(i)
	switch (row.kind) {
		case 'poster':
			return <PosterCard key={row.items[i].id} title={row.items[i]} index={i} {...common} />
		case 'wide':
			return <WideCard key={row.items[i].id} title={row.items[i]} index={i} {...common} />
		case 'apps':
			return <AppCard key={row.items[i].id} app={row.items[i]} {...common} />
		case 'live':
			return <LiveCard key={row.items[i].id} channel={row.items[i]} {...common} />
		case 'chips':
			return <Chip key={row.items[i]} label={row.items[i]} sortable={row.id === 'sort'} {...common} />
		case 'hero':
			return null
	}
}

function scrollRowIntoView(row: HTMLElement, first: boolean) {
	const container = row.closest<HTMLElement>('.tv-content')
	if (container === null) return
	const target = first ? 0 : row.offsetTop - (container.clientHeight - row.offsetHeight) / 2
	container.scrollTo({ top: MathUtils.clamp(target, 0, container.scrollHeight), behavior: 'smooth' })
}

function scrollItemIntoView(track: HTMLElement, col: number) {
	const item = track.children[col] as HTMLElement | undefined
	if (item === undefined) return
	const left = item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2
	track.scrollTo({ left: MathUtils.clamp(left, 0, track.scrollWidth), behavior: 'smooth' })
}

type TRowProps = { row: TRow; index: number }

function Row({ row, index }: TRowProps) {
	const activeRow = useReactive(rowIndex)
	const activeZone = useReactive(zone)
	const focusedRow = activeZone === 'content' && activeRow === index
	const column = columnOf(row.id)
	const col = useReactive(column)
	const rowRef = useRef<HTMLElement>(null)
	const trackRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (focusedRow && rowRef.current) scrollRowIntoView(rowRef.current, index === 0)
	}, [focusedRow, index])
	useEffect(() => {
		if (focusedRow && trackRef.current) scrollItemIntoView(trackRef.current, col)
	}, [focusedRow, col])

	if (row.kind === 'hero') return <Hero ref={rowRef} focusedCol={focusedRow ? col : -1} row={row} onFocus={(c) => focusAt(row.id, c)} />

	const focus = (c: number): TFocusable => ({
		focused: focusedRow && col === c,
		onFocus: () => focusAt(row.id, c),
		onActivate: () => {
			focusAt(row.id, c)
			activateItem(row, c)
		},
	})

	return (
		<section ref={rowRef} className={`row row--${row.kind}`}>
			<h2 className="row__title">{row.title}</h2>
			<div ref={trackRef} className="row__track">
				{row.items.map((_, i) => renderItem(row, i, focus))}
			</div>
		</section>
	)
}

export { Row }
