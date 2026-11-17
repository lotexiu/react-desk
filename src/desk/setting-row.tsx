import type { ReactNode } from 'react'

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: 12, minHeight: 36 }}>
			<span>{label}</span>
			{children}
		</div>
	)
}

export { SettingRow }
