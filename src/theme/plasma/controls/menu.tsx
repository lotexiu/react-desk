import { useRef } from 'react'
import { useOutsidePointer, usePart, useReactive } from '@lotexiu/react'
import type { Menu as HeadlessMenu } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { ChevronIcon } from '../icons'
import { usePlasmaTokens } from '../use-plasma-tokens'

function MenuItem({ control, itemKey, label }: { control: HeadlessMenu<unknown, string>; itemKey: string; label: string }) {
	const { control: tokens } = usePlasmaTokens()
	const item = usePart(() => control.parts.item(itemKey), [control, itemKey])
	const disabled = item['aria-disabled'] === 'true'
	return (
		<div
			{...item}
			onPointerEnter={() => control.hover(itemKey)}
			onClick={() => control.activate(itemKey)}
			style={{
				padding: '6px 12px',
				borderRadius: tokens.radius,
				background: item['data-highlighted'] !== undefined ? tokens.hover : 'transparent',
				opacity: disabled ? 0.45 : 1,
				cursor: disabled ? 'default' : 'pointer',
				whiteSpace: 'nowrap',
			}}
		>
			{label}
		</div>
	)
}

function Menu({ control, label }: TControlProps<HeadlessMenu<unknown, string>>) {
	const { control: tokens } = usePlasmaTokens()
	const trigger = usePart(() => control.parts.trigger(), [control])
	const menu = usePart(() => control.parts.menu(), [control])
	const entries = useReactive(control.collection.entries)
	const open = useReactive(control.value)
	const root = useRef<HTMLDivElement>(null)
	const list = useRef<HTMLDivElement>(null)
	useOutsidePointer([root], control.interactOutside, open)

	return (
		<div ref={root} style={{ position: 'relative', display: 'inline-block' }}>
			<button
				type="button"
				{...trigger}
				className="plasma-focusable"
				onClick={() => {
					control.toggle()
					list.current?.focus()
				}}
				onKeyDown={(event) => {
					if (control.keydown(event)) list.current?.focus()
				}}
				style={{ display: 'flex', alignItems: 'center', gap: 6, height: tokens.height, padding: '0 10px', border: tokens.border, borderRadius: tokens.radius, background: tokens.surface, color: 'inherit', font: 'inherit' }}
			>
				{label}
				<ChevronIcon />
			</button>
			<div
				{...menu}
				ref={list}
				className="plasma-focusable"
				onKeyDown={control.keydown}
				style={{ position: 'absolute', zIndex: 2, top: 'calc(100% + 4px)', left: 0, minWidth: 160, padding: 4, border: tokens.border, borderRadius: tokens.radius + 2, background: tokens.surface, boxShadow: tokens.popupShadow }}
			>
				{entries.map((entry) => (
					<MenuItem key={entry.key} control={control} itemKey={entry.key} label={entry.label} />
				))}
			</div>
		</div>
	)
}

export { Menu }
