import { ColorUtils } from '@lotexiu/typescript'
import type { TColor } from '@lotexiu/typescript'
import type { TPlasmaTokens } from '../plasma/tokens'
import type { TClassicContext } from './definitions'

const MOTION_DURATIONS = { off: '0ms', reduced: '80ms', normal: '160ms' } as const
const TEXTURE_GRAIN = { none: 0, fine: 0.12, heavy: 0.3 } as const

function cssColor(color: TColor, alpha = 1): string {
	return ColorUtils.withAlpha(color, alpha).toString()
}

function bevelBorder(width: number, light: TColor, shadow: TColor): string {
	return width === 0 ? `1px solid ${cssColor(shadow)}` : `${width}px outset ${cssColor(light)}`
}

function classicTokens({ roles, palettes, adjustments, mode }: TClassicContext): TPlasmaTokens {
	const { bevel, texture, titleGradient, motion } = adjustments
	const dark = mode === 'dark'
	const light = palettes.neutral.get(dark ? 45 : 92)
	const header = titleGradient ? `linear-gradient(90deg, ${cssColor(roles.header)}, ${cssColor(palettes.depth.get(dark ? 40 : 45))})` : cssColor(roles.header)
	const border = bevelBorder(bevel, light, roles.outline)

	return {
		font: { family: '"DejaVu Sans", "Tahoma", system-ui, sans-serif', size: 13 },
		desktop: { color: cssColor(roles.onDesktop), background: cssColor(roles.desktop), grain: TEXTURE_GRAIN[texture] },
		panel: {
			edge: 'bottom',
			height: 40,
			margin: 0,
			radius: 0,
			padding: 3,
			color: cssColor(roles.onPanel),
			background: cssColor(roles.panel),
			border,
			blur: 'none',
			shadow: 'none',
			button: { radius: 0, hover: cssColor(roles.onPanel, 0.08), pressed: cssColor(roles.onPanel, 0.16), indicator: cssColor(roles.accent) },
		},
		window: {
			radius: 0,
			titleHeight: 28,
			color: cssColor(roles.onWindow),
			mutedColor: cssColor(roles.onWindowMuted),
			background: cssColor(roles.window),
			header,
			headerColor: cssColor(roles.onHeader),
			border,
			activeShadow: `4px 4px 0 ${cssColor(roles.outline, 0.5)}`,
			inactiveShadow: 'none',
			button: { size: 20, radius: 0, hover: cssColor(roles.onHeader, 0.2), closeHover: cssColor(roles.danger), closeHoverColor: cssColor(roles.onDanger) },
		},
		control: {
			radius: 0,
			height: 26,
			accent: cssColor(roles.accent),
			onAccent: cssColor(roles.onAccent),
			color: cssColor(roles.onWindow),
			muted: cssColor(roles.onWindowMuted),
			danger: cssColor(roles.danger),
			surface: cssColor(palettes.neutral.get(dark ? 22 : 97)),
			hover: cssColor(roles.accent, 0.18),
			track: cssColor(roles.outline, 0.5),
			border: bevel === 0 ? `1px solid ${cssColor(roles.outline)}` : `${Math.max(1, bevel - 1)}px inset ${cssColor(light)}`,
			popupShadow: `3px 3px 0 ${cssColor(roles.outline, 0.45)}`,
		},
		motion: { duration: MOTION_DURATIONS[motion], easing: 'linear' },
	}
}

export { classicTokens }
