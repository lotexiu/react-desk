import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactive } from '@lotexiu/react'
import { Spring } from '@lotexiu/typescript'
import type { PointerEvent, ReactNode } from 'react'
import type { TWindowFrame, TWindowProps } from '../contract'
import { CloseIcon, MaximizeIcon, MinimizeIcon } from './icons'
import { usePlasmaTokens } from './use-plasma-tokens'

type TDragStart = {
	readonly pointerLeft: number
	readonly pointerTop: number
	readonly frame: TWindowFrame
}

function WindowButton({ children, title, closing = false, onSelect }: { children: ReactNode; title: string; closing?: boolean; onSelect: () => void }) {
	const { window: windowTokens, motion } = usePlasmaTokens()
	const [hovered, setHovered] = useState(false)
	const { button } = windowTokens

	return (
		<button
			type="button"
			title={title}
			onPointerDown={(event) => event.stopPropagation()}
			onClick={onSelect}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			style={{
				width: button.size,
				height: button.size,
				display: 'grid',
				placeItems: 'center',
				padding: 0,
				border: 'none',
				borderRadius: button.radius,
				background: hovered ? (closing ? button.closeHover : button.hover) : 'transparent',
				color: hovered && closing ? button.closeHoverColor : 'inherit',
				transition: `background ${motion.duration} ${motion.easing}`,
			}}
		>
			{children}
		</button>
	)
}

const OPENING_SCALE = 0.92
const OPENING_SPRING = { stiffness: 260, damping: 22 }

function useOpeningScale(): number {
	const spring = useMemo(() => new Spring(OPENING_SCALE, OPENING_SPRING), [])
	useEffect(() => {
		spring.set(1)
		return () => spring.dispose()
	}, [spring])
	return useReactive(spring.value)
}

function Window({ title, active, maximized, frame, layer, children, onFocus, onMove, onMinimize, onMaximize, onClose }: TWindowProps) {
	const { window: windowTokens, motion } = usePlasmaTokens()
	const scale = useOpeningScale()
	const opening = Math.min(1, Math.max(0, (scale - OPENING_SCALE) / (1 - OPENING_SCALE)))
	const dragStart = useRef<TDragStart | null>(null)

	const startDrag = (event: PointerEvent<HTMLElement>) => {
		onFocus()
		if (maximized) return
		event.currentTarget.setPointerCapture(event.pointerId)
		dragStart.current = { pointerLeft: event.clientX, pointerTop: event.clientY, frame }
	}

	const drag = (event: PointerEvent<HTMLElement>) => {
		const start = dragStart.current
		if (!start) return
		onMove({
			...start.frame,
			left: start.frame.left + event.clientX - start.pointerLeft,
			top: Math.max(0, start.frame.top + event.clientY - start.pointerTop),
		})
	}

	const stopDrag = () => {
		dragStart.current = null
	}

	const placement = maximized ? { inset: 0 } : { left: frame.left, top: frame.top, width: frame.width, height: frame.height }

	return (
		<section
			onPointerDown={onFocus}
			style={{
				position: 'absolute',
				...placement,
				zIndex: layer,
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
				color: windowTokens.color,
				background: windowTokens.background,
				border: windowTokens.border,
				borderRadius: maximized ? 0 : windowTokens.radius,
				boxShadow: active ? windowTokens.activeShadow : windowTokens.inactiveShadow,
				transition: `box-shadow ${motion.duration} ${motion.easing}`,
				transform: scale === 1 ? undefined : `scale(${scale})`,
				opacity: opening,
			}}
		>
			<header
				onPointerDown={startDrag}
				onPointerMove={drag}
				onPointerUp={stopDrag}
				onPointerCancel={stopDrag}
				onDoubleClick={onMaximize}
				style={{
					height: windowTokens.titleHeight,
					flexShrink: 0,
					display: 'grid',
					gridTemplateColumns: '1fr auto 1fr',
					alignItems: 'center',
					padding: '0 8px',
					background: windowTokens.header,
					color: windowTokens.headerColor,
					userSelect: 'none',
				}}
			>
				<span />
				<strong style={{ fontWeight: 600, opacity: active ? 1 : 0.65 }}>{title}</strong>
				<span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
					<WindowButton title="Minimizar" onSelect={onMinimize}>
						<MinimizeIcon />
					</WindowButton>
					<WindowButton title={maximized ? 'Restaurar' : 'Maximizar'} onSelect={onMaximize}>
						<MaximizeIcon />
					</WindowButton>
					<WindowButton title="Fechar" closing onSelect={onClose}>
						<CloseIcon />
					</WindowButton>
				</span>
			</header>
			<div style={{ flexGrow: 1, overflow: 'auto', padding: 16 }}>{children}</div>
		</section>
	)
}

export { Window }
