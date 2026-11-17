import { usePart, useReactive } from '@lotexiu/react'
import type { Listbox as HeadlessListbox } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { CheckIcon } from '../icons'
import { usePlasmaTokens } from '../use-plasma-tokens'

function ListboxOption({ control, optionKey, label }: { control: HeadlessListbox<unknown, string>; optionKey: string; label: string }) {
	const { control: tokens } = usePlasmaTokens()
	const option = usePart(() => control.parts.option(optionKey), [control, optionKey])
	const selected = option['aria-selected'] === 'true'
	return (
		<div
			{...option}
			onPointerEnter={() => control.hover(optionKey)}
			onClick={() => control.press(optionKey)}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				padding: '5px 10px',
				borderRadius: tokens.radius,
				background: selected ? tokens.accent : option['data-highlighted'] !== undefined ? tokens.hover : 'transparent',
				color: selected ? tokens.onAccent : 'inherit',
				cursor: 'pointer',
				userSelect: 'none',
			}}
		>
			<span style={{ width: 12, display: 'grid', placeItems: 'center' }}>{selected && <CheckIcon />}</span>
			{label}
		</div>
	)
}

function Listbox({ control, label }: TControlProps<HeadlessListbox<unknown, string>>) {
	const { control: tokens } = usePlasmaTokens()
	const root = usePart(() => control.parts.root(), [control])
	const entries = useReactive(control.collection.entries)
	return (
		<div {...root} aria-label={label} className="plasma-focusable" onKeyDown={control.keydown} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 4, border: tokens.border, borderRadius: tokens.radius + 2, minHeight: 120 }}>
			{entries.length === 0 && <span style={{ padding: 8, color: tokens.muted }}>Nada por aqui.</span>}
			{entries.map((entry) => (
				<ListboxOption key={entry.key} control={control} optionKey={entry.key} label={entry.label} />
			))}
		</div>
	)
}

export { Listbox }
