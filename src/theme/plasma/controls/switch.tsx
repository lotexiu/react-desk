import { usePart, useReactive } from '@lotexiu/react'
import type { Switch as HeadlessSwitch } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

const TRACK_WIDTH = 36
const TRACK_HEIGHT = 20
const KNOB_INSET = 3
const KNOB_SIZE = TRACK_HEIGHT - KNOB_INSET * 2

function Switch({ control, label }: TControlProps<HeadlessSwitch>) {
	const { control: tokens, motion } = usePlasmaTokens()
	const root = usePart(() => control.parts.root(), [control])
	const on = useReactive(control.value)
	const transition = `${motion.duration} ${motion.easing}`

	return (
		<div
			{...root}
			aria-label={label}
			className="plasma-focusable"
			onClick={control.toggle}
			onKeyDown={control.keydown}
			style={{
				position: 'relative',
				width: TRACK_WIDTH,
				height: TRACK_HEIGHT,
				boxSizing: 'border-box',
				borderRadius: TRACK_HEIGHT,
				background: on ? tokens.accent : tokens.track,
				cursor: 'pointer',
				transition: `background ${transition}`,
			}}
		>
			<span
				style={{
					position: 'absolute',
					top: KNOB_INSET,
					left: on ? TRACK_WIDTH - KNOB_SIZE - KNOB_INSET : KNOB_INSET,
					width: KNOB_SIZE,
					height: KNOB_SIZE,
					borderRadius: '50%',
					background: on ? tokens.onAccent : tokens.surface,
					transition: `left ${transition}`,
				}}
			/>
		</div>
	)
}

export { Switch }
