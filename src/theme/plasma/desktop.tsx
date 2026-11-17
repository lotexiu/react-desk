import type { TDesktopProps } from '../contract'
import { Grain } from './grain'
import { usePlasmaTokens } from './use-plasma-tokens'

function Desktop({ panel, children }: TDesktopProps) {
	const { desktop, panel: panelTokens, font } = usePlasmaTokens()

	return (
		<div
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: panelTokens.edge === 'bottom' ? 'column' : 'column-reverse',
				background: desktop.background,
				color: desktop.color,
				fontFamily: font.family,
				fontSize: font.size,
			}}
		>
			<div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
				<Grain opacity={desktop.grain} />
				{children}
			</div>
			<div
				style={{
					paddingLeft: panelTokens.margin,
					paddingRight: panelTokens.margin,
					paddingTop: panelTokens.edge === 'bottom' ? 0 : panelTokens.margin,
					paddingBottom: panelTokens.edge === 'top' ? 0 : panelTokens.margin,
				}}
			>
				{panel}
			</div>
		</div>
	)
}

export { Desktop }
