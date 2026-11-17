import { useRef } from 'react'
import { useFocusTrap, usePart, useReactive } from '@lotexiu/react'
import type { TDialogProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

function Dialog({ control, title, description, actions }: TDialogProps) {
	const { window: windowTokens, control: tokens } = usePlasmaTokens()
	const backdrop = usePart(() => control.parts.backdrop(), [control])
	const content = usePart(() => control.parts.content(), [control])
	const titlePart = usePart(() => control.parts.title(), [control])
	const descriptionPart = usePart(() => control.parts.description(), [control])
	const open = useReactive(control.value)
	const panel = useRef<HTMLDivElement>(null)
	useFocusTrap(panel, open)
	if (!open) return null

	return (
		<div
			{...backdrop}
			onPointerDown={(event) => {
				if (event.target === event.currentTarget) control.interactOutside()
			}}
			style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgb(0 0 0 / 0.35)' }}
		>
			<div
				{...content}
				ref={panel}
				onKeyDown={control.keydown}
				style={{ width: 360, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderRadius: windowTokens.radius, border: windowTokens.border, background: windowTokens.background, color: windowTokens.color, boxShadow: windowTokens.activeShadow, outline: 'none' }}
			>
				<strong {...titlePart} style={{ fontSize: '1.1em' }}>
					{title}
				</strong>
				{description !== undefined && (
					<span {...descriptionPart} style={{ color: tokens.muted }}>
						{description}
					</span>
				)}
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{actions}</div>
			</div>
		</div>
	)
}

export { Dialog }
