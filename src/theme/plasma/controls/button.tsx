import { useState } from 'react'
import type { TButtonProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

function Button({ children, onPress, tone = 'default', disabled = false }: TButtonProps) {
	const { control: tokens, motion } = usePlasmaTokens()
	const [hovered, setHovered] = useState(false)
	const filled = tone !== 'default'
	const fill = tone === 'danger' ? tokens.danger : tokens.accent
	return (
		<button
			type="button"
			disabled={disabled}
			className="plasma-focusable"
			onClick={onPress}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			style={{
				height: tokens.height,
				padding: '0 14px',
				border: filled ? 'none' : tokens.border,
				borderRadius: tokens.radius,
				background: filled ? fill : hovered ? tokens.hover : tokens.surface,
				color: filled ? tokens.onAccent : 'inherit',
				font: 'inherit',
				opacity: disabled ? 0.45 : hovered && filled ? 0.9 : 1,
				cursor: disabled ? 'default' : 'pointer',
				transition: `background ${motion.duration} ${motion.easing}`,
			}}
		>
			{children}
		</button>
	)
}

export { Button }
