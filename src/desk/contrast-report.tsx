import { useReactive } from '@lotexiu/react'
import { theme } from '../theme/service'

function ContrastReport() {
	const checks = useReactive(theme.checks)
	const roles = useReactive(theme.roles)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
			{checks.map((check) => (
				<div
					key={check.role}
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr auto auto',
						alignItems: 'center',
						gap: 12,
						padding: '6px 10px',
						borderRadius: 6,
						background: roles[check.on].toString(),
						color: roles[check.role].toString(),
					}}
				>
					<span>
						{check.role} sobre {check.on}
					</span>
					<span>
						{check.ratio.toFixed(2)} / {check.min}
					</span>
					<span>{check.passed ? 'ok' : `ajustado para tom ${check.suggestion?.tone ?? '-'}`}</span>
				</div>
			))}
		</div>
	)
}

export { ContrastReport }
