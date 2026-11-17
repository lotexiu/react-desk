import { ColorUtils } from '@lotexiu/typescript'
import type { TColor } from '@lotexiu/typescript'
import type { TPlasmaContext } from './definitions'

const MOTION_DURATIONS = { off: '0ms', reduced: '80ms', normal: '160ms' } as const

function cssColor(color: TColor, alpha = 1): string {
	return ColorUtils.withAlpha(color, alpha).toString()
}

function plasmaTokens({ mode, roles, palettes, adjustments }: TPlasmaContext) {
	const { roundness, translucency, blur, floatingPanel, panelEdge, motion } = adjustments
	const dark = mode === 'dark'
	const rounded = (base: number) => Math.round(base * roundness)
	const surfaceAlpha = 1 - translucency
	const shadow = palettes.neutral.get(0)
	const glow = palettes.accent.get(dark ? 55 : 75)
	const deep = palettes.depth.get(dark ? 30 : 65)
	const horizon = palettes.depth.get(dark ? 6 : 92)

	return {
		font: {
			family: '"Noto Sans", "Inter", "Segoe UI", system-ui, sans-serif',
			size: 14,
		},
		desktop: {
			color: cssColor(roles.onDesktop),
			background: [
				`radial-gradient(ellipse farthest-side at 18% 14%, ${cssColor(glow, 0.55)}, ${cssColor(glow, 0)})`,
				`radial-gradient(ellipse farthest-side at 86% 88%, ${cssColor(deep, 0.7)}, ${cssColor(deep, 0)})`,
				`linear-gradient(160deg, ${cssColor(roles.desktop)}, ${cssColor(horizon)})`,
			].join(', '),
			grain: 0,
		},
		panel: {
			edge: panelEdge,
			height: 44,
			margin: floatingPanel ? 8 : 0,
			radius: floatingPanel ? rounded(12) : 0,
			padding: 4,
			color: cssColor(roles.onPanel),
			background: cssColor(roles.panel, surfaceAlpha),
			border: floatingPanel ? `1px solid ${cssColor(roles.outline, 0.6)}` : 'none',
			blur: blur ? 'blur(24px) saturate(140%)' : 'none',
			shadow: floatingPanel ? `0 6px 24px ${cssColor(shadow, dark ? 0.5 : 0.18)}` : 'none',
			button: {
				radius: rounded(6),
				hover: cssColor(roles.onPanel, 0.1),
				pressed: cssColor(roles.onPanel, 0.16),
				indicator: cssColor(roles.accent),
			},
		},
		window: {
			radius: rounded(10),
			titleHeight: 36,
			color: cssColor(roles.onWindow),
			mutedColor: cssColor(roles.onWindowMuted),
			background: cssColor(roles.window),
			header: cssColor(roles.header),
			headerColor: cssColor(roles.onHeader),
			border: `1px solid ${cssColor(roles.outline, dark ? 0.9 : 0.7)}`,
			activeShadow: `0 12px 36px ${cssColor(shadow, dark ? 0.55 : 0.22)}, 0 0 0 1px ${cssColor(roles.accent, 0.35)}`,
			inactiveShadow: `0 6px 18px ${cssColor(shadow, dark ? 0.35 : 0.12)}`,
			button: {
				size: 22,
				radius: rounded(11),
				hover: cssColor(roles.onHeader, 0.12),
				closeHover: cssColor(roles.danger),
				closeHoverColor: cssColor(roles.onDanger),
			},
		},
		control: {
			radius: rounded(4),
			height: 28,
			accent: cssColor(roles.accent),
			onAccent: cssColor(roles.onAccent),
			color: cssColor(roles.onWindow),
			muted: cssColor(roles.onWindowMuted),
			danger: cssColor(roles.danger),
			surface: cssColor(roles.header),
			hover: cssColor(roles.onWindow, 0.08),
			track: cssColor(roles.outline, dark ? 0.9 : 0.6),
			border: `1px solid ${cssColor(roles.outline, dark ? 0.9 : 0.7)}`,
			popupShadow: `0 8px 24px ${cssColor(shadow, dark ? 0.5 : 0.18)}`,
		},
		motion: {
			duration: MOTION_DURATIONS[motion],
			easing: 'cubic-bezier(0.2, 0, 0, 1)',
		},
	}
}

type TPlasmaTokens = ReturnType<typeof plasmaTokens>

export { plasmaTokens }
export type { TPlasmaTokens }
