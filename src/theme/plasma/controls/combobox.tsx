import { useRef } from 'react'
import { useOutsidePointer, usePart, useReactive } from '@lotexiu/react'
import type { Combobox as HeadlessCombobox } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

function ComboboxOption({ control, optionKey, label }: { control: HeadlessCombobox<unknown, string>; optionKey: string; label: string }) {
	const { control: tokens } = usePlasmaTokens()
	const option = usePart(() => control.parts.option(optionKey), [control, optionKey])
	return (
		<div
			{...option}
			onPointerDown={(event) => event.preventDefault()}
			onPointerEnter={() => control.hover(optionKey)}
			onClick={() => control.choose(optionKey)}
			style={{ padding: '6px 10px', borderRadius: tokens.radius, background: option['data-highlighted'] !== undefined ? tokens.hover : 'transparent', fontWeight: option['aria-selected'] === 'true' ? 600 : 400, cursor: 'pointer' }}
		>
			{label}
		</div>
	)
}

function Combobox({ control, label }: TControlProps<HeadlessCombobox<unknown, string>>) {
	const { control: tokens } = usePlasmaTokens()
	const input = usePart(() => control.parts.input(), [control])
	const listbox = usePart(() => control.parts.listbox(), [control])
	const text = useReactive(control.inputValue)
	const entries = useReactive(control.collection.entries)
	const empty = useReactive(control.empty)
	const open = useReactive(control.open)
	const root = useRef<HTMLDivElement>(null)
	useOutsidePointer([root], control.interactOutside, open)

	return (
		<div ref={root} style={{ position: 'relative' }}>
			<input
				{...input}
				aria-label={label}
				value={text}
				placeholder="Digite para buscar…"
				onChange={(event) => control.input(event.target.value)}
				onKeyDown={control.keydown}
				onBlur={control.commit}
				onClick={control.show}
				style={{ width: '100%', boxSizing: 'border-box', height: tokens.height, padding: '0 10px', border: tokens.border, borderRadius: tokens.radius, background: tokens.surface, color: tokens.color, font: 'inherit', outlineColor: tokens.accent }}
			/>
			<div {...listbox} style={{ position: 'absolute', zIndex: 2, top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: 220, overflow: 'auto', padding: 4, border: tokens.border, borderRadius: tokens.radius + 2, background: tokens.surface, boxShadow: tokens.popupShadow }}>
				{empty && <div style={{ padding: 8, color: tokens.muted }}>Nenhum resultado.</div>}
				{entries.map((entry) => (
					<ComboboxOption key={entry.key} control={control} optionKey={entry.key} label={entry.label} />
				))}
			</div>
		</div>
	)
}

export { Combobox }
