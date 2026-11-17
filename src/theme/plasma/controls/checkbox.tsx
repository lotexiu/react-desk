import { usePart, useReactive } from '@lotexiu/react'
import type { Checkbox as HeadlessCheckbox } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { CheckIcon, DashIcon } from '../icons'
import { usePlasmaTokens } from '../use-plasma-tokens'

const BOX_SIZE = 18

function Checkbox({ control, label }: TControlProps<HeadlessCheckbox>) {
	const { control: tokens, motion } = usePlasmaTokens()
	const root = usePart(() => control.parts.root(), [control])
	const state = useReactive(control.state)
	const marked = state !== 'unchecked'

	return (
		<div
			{...root}
			aria-label={label}
			className="plasma-focusable"
			onClick={control.toggle}
			onKeyDown={control.keydown}
			style={{
				width: BOX_SIZE,
				height: BOX_SIZE,
				boxSizing: 'border-box',
				display: 'grid',
				placeItems: 'center',
				borderRadius: tokens.radius,
				border: marked ? 'none' : tokens.border,
				background: marked ? tokens.accent : tokens.surface,
				color: tokens.onAccent,
				cursor: 'pointer',
				transition: `background ${motion.duration} ${motion.easing}`,
			}}
		>
			{state === 'checked' && <CheckIcon />}
			{state === 'indeterminate' && <DashIcon />}
		</div>
	)
}

export { Checkbox }
