import { useLayoutEffect, useRef } from 'react'
import { usePart, useReactive } from '@lotexiu/react'
import type { TextField as HeadlessTextField } from '@lotexiu/typescript'
import type { TControlProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
	required: 'Obrigatório',
	pattern: 'Formato incompleto',
	tooLong: 'Texto longo demais',
}

function TextField({ control, label }: TControlProps<HeadlessTextField>) {
	const { control: tokens, motion } = usePlasmaTokens()
	const input = usePart(() => control.parts.input(), [control])
	const errorPart = usePart(() => control.parts.error(), [control])
	const value = useReactive(control.value)
	const error = useReactive(control.error)
	const invalid = useReactive(control.showError)
	const element = useRef<HTMLInputElement>(null)
	const pendingCaret = useRef<number | null>(null)

	useLayoutEffect(() => {
		if (pendingCaret.current === null || element.current === null) return
		element.current.setSelectionRange(pendingCaret.current, pendingCaret.current)
		pendingCaret.current = null
	})

	return (
		<span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<input
				{...input}
				ref={element}
				aria-label={label}
				value={value}
				onChange={(event) => {
					pendingCaret.current = control.input(event.target.value, event.target.selectionStart ?? undefined).caret
				}}
				onFocus={control.focus}
				onBlur={control.blur}
				style={{
					height: tokens.height,
					boxSizing: 'border-box',
					padding: '0 10px',
					border: invalid ? `1px solid ${tokens.danger}` : tokens.border,
					borderRadius: tokens.radius,
					background: tokens.surface,
					color: tokens.color,
					font: 'inherit',
					outlineColor: tokens.accent,
					transition: `border-color ${motion.duration} ${motion.easing}`,
				}}
			/>
			<span {...errorPart} style={{ color: tokens.danger, fontSize: '0.85em' }}>
				{error === undefined ? '' : (ERROR_MESSAGES[error] ?? error)}
			</span>
		</span>
	)
}

export { TextField }
