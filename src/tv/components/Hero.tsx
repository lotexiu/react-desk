import type { Ref } from 'react'
import { HERO_IDS, TITLES } from '../mocks/content'
import { activateHero, heroIndex } from '../state/navigation'
import type { TRow } from '../state/rows'
import { useReactive } from '@lotexiu/react'
import { Surface } from '../glass/Surface'
import { Art } from './Art'
import { Icon } from './Icon'

type THeroProps = {
	ref: Ref<HTMLElement>
	row: Extract<TRow, { kind: 'hero' }>
	/** Índice do botão com foco, ou -1 quando o foco está em outra linha. */
	focusedCol: number
	onFocus: (col: number) => void
}

const ACTION_ICONS = { play: 'play', list: 'plus', info: 'info' } as const

function Hero({ ref, row, focusedCol, onFocus }: THeroProps) {
	const current = useReactive(heroIndex)
	const title = TITLES.find((t) => t.id === HERO_IDS[current]) ?? TITLES[0]

	return (
		<section ref={ref} className="hero" data-focused={focusedCol >= 0}>
			<div className="hero__art" key={title.id}>
				<Art seed={title.seed} variant={current} />
				<span className="hero__ghost" aria-hidden>
					{title.title}
				</span>
			</div>

			<Surface className="hero__info">
				<div className="hero__meta">
					<span className="pill pill--accent">{title.kind}</span>
					<span>{title.year}</span>
					<span className="pill">{title.maturity === 'L' ? 'Livre' : `${title.maturity}+`}</span>
					<span>
						<Icon name="star" size="0.95em" /> {title.rating.toFixed(1)}
					</span>
					<span>{title.kind === 'Filme' ? `${Math.floor(title.minutes / 60)}h ${title.minutes % 60}min` : `${title.minutes} min/ep.`}</span>
				</div>
				<h1 className="hero__title">{title.title}</h1>
				<p className="hero__synopsis">{title.synopsis}</p>
				<div className="hero__actions">
					{row.items.map((action, i) => (
						<button
							key={action.id}
							className={`btn ${action.id === 'play' ? 'btn--primary' : ''}`}
							data-focused={focusedCol === i}
							onMouseEnter={() => onFocus(i)}
							onClick={() => {
								onFocus(i)
								activateHero(action)
							}}
							tabIndex={-1}
						>
							<Icon name={ACTION_ICONS[action.id]} size="1.2em" /> {action.label}
						</button>
					))}
				</div>
			</Surface>

			<div className="hero__dots" role="tablist" aria-label="Destaques">
				{HERO_IDS.map((id, i) => (
					<button key={id} className="dot" data-on={i === current} onClick={() => heroIndex.set(i)} tabIndex={-1} aria-label={`Destaque ${i + 1}`} />
				))}
			</div>
		</section>
	)
}

export { Hero }
