import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useReactive } from '@lotexiu/react'
import type { TPanelProps } from '../contract'
import { theme } from '../service'
import { ClockFace } from './clock-face'
import { LauncherIcon, ModeIcon } from './icons'
import { usePlasmaTokens } from './use-plasma-tokens'

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })

function useNow(): Date {
	const [now, setNow] = useState(() => new Date())
	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(interval)
	}, [])
	return now
}

function PanelButton({ children, title, active = false, dimmed = false, onSelect }: { children: ReactNode; title: string; active?: boolean; dimmed?: boolean; onSelect: () => void }) {
	const { panel, motion } = usePlasmaTokens()
	const [hovered, setHovered] = useState(false)
	const indicatorSide = panel.edge === 'bottom' ? -2 : 2

	return (
		<button
			type="button"
			title={title}
			onClick={onSelect}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			style={{
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				padding: '0 10px',
				border: 'none',
				borderRadius: panel.button.radius,
				background: active ? panel.button.pressed : hovered ? panel.button.hover : 'transparent',
				boxShadow: active ? `inset 0 ${indicatorSide}px 0 ${panel.button.indicator}` : 'none',
				color: 'inherit',
				font: 'inherit',
				opacity: dimmed ? 0.6 : 1,
				cursor: 'default',
				transition: `background ${motion.duration} ${motion.easing}`,
			}}
		>
			{children}
		</button>
	)
}

function Panel({ tasks, onTaskSelect, onLauncherSelect }: TPanelProps) {
	const { panel } = usePlasmaTokens()
	const mode = useReactive(theme.mode)
	const now = useNow()

	return (
		<nav
			style={{
				height: panel.height,
				boxSizing: 'border-box',
				display: 'flex',
				alignItems: 'stretch',
				gap: 4,
				padding: panel.padding,
				color: panel.color,
				background: panel.background,
				backdropFilter: panel.blur,
				border: panel.border,
				borderRadius: panel.radius,
				boxShadow: panel.shadow,
			}}
		>
			<PanelButton title="Aplicativos" onSelect={onLauncherSelect}>
				<LauncherIcon />
			</PanelButton>
			<div style={{ flexGrow: 1, display: 'flex', gap: 4, minWidth: 0 }}>
				{tasks.map((task) => (
					<PanelButton key={task.id} title={task.title} active={task.active} dimmed={task.minimized} onSelect={() => onTaskSelect(task.id)}>
						<span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
					</PanelButton>
				))}
			</div>
			<PanelButton title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'} onSelect={() => theme.mode.set(mode === 'dark' ? 'light' : 'dark')}>
				<ModeIcon dark={mode === 'dark'} />
			</PanelButton>
			<PanelButton title={dateFormatter.format(now)} onSelect={() => undefined}>
				<ClockFace date={now} />
				<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.15 }}>
					<span>{timeFormatter.format(now)}</span>
					<span style={{ fontSize: '0.75em', opacity: 0.8 }}>{dateFormatter.format(now)}</span>
				</span>
			</PanelButton>
		</nav>
	)
}

export { Panel }
