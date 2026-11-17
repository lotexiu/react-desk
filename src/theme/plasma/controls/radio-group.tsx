import { useEffect, useRef } from 'react'
import { usePart, useReactive } from '@lotexiu/react'
import type { RadioGroup as HeadlessRadioGroup } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

function RadioItem({ control, itemKey, label }: { control: HeadlessRadioGroup<string, string>; itemKey: string; label: string }) {
	const { control: tokens, motion } = usePlasmaTokens()
	const item = usePart(() => control.parts.item(itemKey), [control, itemKey])
	const active = useReactive(control.navigation.active)
	const element = useRef<HTMLDivElement>(null)
	const checked = item['aria-checked'] === 'true'

	useEffect(() => {
		const group = element.current?.parentElement
		if (active === itemKey && group?.contains(document.activeElement)) element.current?.focus()
	}, [active, itemKey])

	return (
		<div
			{...item}
			ref={element}
			className="plasma-focusable"
			onClick={() => control.choose(itemKey)}
			style={{
				padding: '4px 12px',
				borderRadius: tokens.radius,
				background: checked ? tokens.accent : 'transparent',
				color: checked ? tokens.onAccent : 'inherit',
				cursor: 'pointer',
				userSelect: 'none',
				transition: `background ${motion.duration} ${motion.easing}`,
			}}
		>
			{label}
		</div>
	)
}

function RadioGroup({ control, label }: TControlProps<HeadlessRadioGroup<string, string>>) {
	const { control: tokens } = usePlasmaTokens()
	const root = usePart(() => control.parts.root(), [control])
	const entries = useReactive(control.collection.entries)

	return (
		<div
			{...root}
			aria-label={label}
			onKeyDown={control.keydown}
			style={{ display: 'inline-flex', justifySelf: 'start', gap: 2, padding: 2, border: tokens.border, borderRadius: tokens.radius + 2 }}
		>
			{entries.map((entry) => (
				<RadioItem key={entry.key} control={control} itemKey={entry.key} label={entry.label} />
			))}
		</div>
	)
}

export { RadioGroup }
