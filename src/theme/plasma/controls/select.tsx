import { usePart, useReactive } from '@lotexiu/react'
import type { Select as HeadlessSelect } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { ChevronIcon } from '../icons'
import { usePlasmaTokens } from '../use-plasma-tokens'

function SelectOption({ control, optionKey, label }: { control: HeadlessSelect<string, string>; optionKey: string; label: string }) {
	const { control: tokens } = usePlasmaTokens()
	const option = usePart(() => control.parts.option(optionKey), [control, optionKey])
	const highlighted = option['data-highlighted'] !== undefined
	const selected = option['aria-selected'] === 'true'

	return (
		<div
			{...option}
			onPointerDown={(event) => event.preventDefault()}
			onPointerEnter={() => control.hover(optionKey)}
			onClick={() => control.choose(optionKey)}
			style={{
				padding: '6px 10px',
				borderRadius: tokens.radius,
				background: highlighted ? tokens.hover : 'transparent',
				color: selected ? tokens.accent : 'inherit',
				fontWeight: selected ? 600 : 400,
				cursor: 'pointer',
			}}
		>
			{label}
		</div>
	)
}

function Select({ control, label }: TControlProps<HeadlessSelect<string, string>>) {
	const { control: tokens } = usePlasmaTokens()
	const labelPart = usePart(() => control.parts.label(), [control])
	const trigger = usePart(() => control.parts.trigger(), [control])
	const listbox = usePart(() => control.parts.listbox(), [control])
	const entries = useReactive(control.collection.entries)
	const selectedLabel = useReactive(control.selectedLabel)

	return (
		<div style={{ position: 'relative' }}>
			<span {...labelPart} hidden>
				{label}
			</span>
			<div
				{...trigger}
				className="plasma-focusable"
				onClick={control.toggleOpen}
				onKeyDown={control.keydown}
				onBlur={control.hide}
				style={{
					height: tokens.height,
					boxSizing: 'border-box',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 8,
					padding: '0 10px',
					border: tokens.border,
					borderRadius: tokens.radius,
					background: tokens.surface,
					cursor: 'pointer',
					userSelect: 'none',
				}}
			>
				<span>{selectedLabel ?? 'Selecione…'}</span>
				<ChevronIcon />
			</div>
			<div
				{...listbox}
				style={{
					position: 'absolute',
					zIndex: 1,
					top: `calc(100% + 4px)`,
					left: 0,
					right: 0,
					padding: 4,
					border: tokens.border,
					borderRadius: tokens.radius + 2,
					background: tokens.surface,
					boxShadow: tokens.popupShadow,
				}}
			>
				{entries.map((entry) => (
					<SelectOption key={entry.key} control={control} optionKey={entry.key} label={entry.label} />
				))}
			</div>
		</div>
	)
}

export { Select }
