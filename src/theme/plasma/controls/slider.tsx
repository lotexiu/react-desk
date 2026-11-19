import { useRef } from 'react'
import type { PointerEvent } from 'react'
import { usePart, useReactive } from '@lotexiu/react'
import { PointerUtils } from '@lotexiu/dom'
import type { Slider as HeadlessSlider } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

const THUMB_SIZE = 16
const TRACK_THICKNESS = 4

function Slider({ control, label }: TControlProps<HeadlessSlider>) {
	const { control: tokens, motion } = usePlasmaTokens()
	const root = usePart(() => control.parts.root(), [control])
	const thumb = usePart(() => control.parts.thumb(), [control])
	const ratio = useReactive(control.ratio)
	const text = useReactive(control.text)
	const dragging = useReactive(control.dragging)
	const thumbElement = useRef<HTMLDivElement>(null)
	const percent = `${ratio * 100}%`
	const transition = dragging ? 'none' : `left ${motion.duration} ${motion.easing}, width ${motion.duration} ${motion.easing}`

	const startDrag = (event: PointerEvent<HTMLDivElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId)
		control.pointerDown(...PointerUtils.offset(event, event.currentTarget))
		thumbElement.current?.focus()
	}

	return (
		<span {...root} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
			<div
				onPointerDown={startDrag}
				onPointerMove={(event) => control.pointerMove(...PointerUtils.offset(event, event.currentTarget))}
				onPointerUp={control.pointerUp}
				onPointerCancel={control.pointerUp}
				style={{ position: 'relative', flexGrow: 1, height: THUMB_SIZE + 4, touchAction: 'none', cursor: 'pointer' }}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: '50%',
						height: TRACK_THICKNESS,
						marginTop: -TRACK_THICKNESS / 2,
						borderRadius: TRACK_THICKNESS,
						background: tokens.track,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: 0,
						width: percent,
						top: '50%',
						height: TRACK_THICKNESS,
						marginTop: -TRACK_THICKNESS / 2,
						borderRadius: TRACK_THICKNESS,
						background: tokens.accent,
						transition,
					}}
				/>
				<div
					{...thumb}
					ref={thumbElement}
					aria-label={label}
					className="plasma-focusable"
					onKeyDown={control.keydown}
					style={{
						position: 'absolute',
						left: `calc(${percent} - ${THUMB_SIZE / 2}px)`,
						top: '50%',
						width: THUMB_SIZE,
						height: THUMB_SIZE,
						marginTop: -THUMB_SIZE / 2,
						boxSizing: 'border-box',
						borderRadius: '50%',
						background: tokens.surface,
						border: `2px solid ${tokens.accent}`,
						transition,
					}}
				/>
			</div>
			<output style={{ minWidth: 40, textAlign: 'right', color: tokens.muted, fontVariantNumeric: 'tabular-nums' }}>{text}</output>
		</span>
	)
}

export { Slider }
