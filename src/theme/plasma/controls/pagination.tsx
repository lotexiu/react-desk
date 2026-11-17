import { usePart, useReactive } from '@lotexiu/react'
import type { Pagination as HeadlessPagination } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { ChevronIcon } from '../icons'
import { usePlasmaTokens } from '../use-plasma-tokens'

function PageButton({ control, page }: { control: HeadlessPagination; page: number }) {
	const { control: tokens } = usePlasmaTokens()
	const part = usePart(() => control.parts.page(page), [control, page])
	const current = part['aria-current'] === 'page'
	return (
		<button
			type="button"
			{...part}
			className="plasma-focusable"
			onClick={() => control.goTo(page)}
			style={{ minWidth: 28, height: 28, border: 'none', borderRadius: tokens.radius, background: current ? tokens.accent : 'transparent', color: current ? tokens.onAccent : 'inherit', font: 'inherit', cursor: 'pointer' }}
		>
			{page}
		</button>
	)
}

function Pagination({ control, label }: TControlProps<HeadlessPagination>) {
	const { control: tokens } = usePlasmaTokens()
	const items = useReactive(control.items)
	const previous = usePart(() => control.parts.previous(), [control])
	const next = usePart(() => control.parts.next(), [control])
	const arrow = { width: 28, height: 28, display: 'grid', placeItems: 'center', border: 'none', borderRadius: tokens.radius, background: 'transparent', color: 'inherit', cursor: 'pointer' } as const
	return (
		<nav aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			<button type="button" {...previous} aria-label="Página anterior" className="plasma-focusable" onClick={control.previous} style={{ ...arrow, transform: 'rotate(90deg)', opacity: previous['data-disabled'] === undefined ? 1 : 0.35 }}>
				<ChevronIcon />
			</button>
			{items.map((item) => (item.type === 'page' ? <PageButton key={item.page} control={control} page={item.page} /> : <span key={item.position} style={{ width: 20, textAlign: 'center', color: tokens.muted }}>…</span>))}
			<button type="button" {...next} aria-label="Próxima página" className="plasma-focusable" onClick={control.next} style={{ ...arrow, transform: 'rotate(-90deg)', opacity: next['data-disabled'] === undefined ? 1 : 0.35 }}>
				<ChevronIcon />
			</button>
		</nav>
	)
}

export { Pagination }
