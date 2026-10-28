import { ColorUtils } from '@lotexiu/typescript'
import type { TRoleScheme, TRoles } from '@lotexiu/typescript'
import type { TGlassParams } from './types'

/**
 * Papéis extras que só este app usa, somados aos padrões de `ThemeStyle.resolve`.
 * `mesh*` são os tons do papel de parede; `ink`/`neu*`/`base` servem aos estilos brutalist/neumorphism.
 */
const APP_SCHEMES: Record<string, TRoleScheme> = {
	primary: { mesh1: { dark: 38, light: 84 }, mesh4: { dark: 26, light: 92 } },
	secondary: { mesh2: { dark: 34, light: 88 } },
	tertiary: { mesh3: { dark: 40, light: 90 } },
	neutral: {
		ink: { dark: 100, light: 0 },
		neuHi: { dark: 30, light: 100 },
		neuLo: { dark: 9, light: 80 },
		base: { dark: 8, light: 98 },
	},
}

/** papel da lib → nome da variável CSS (o resto é derivado do nome do slot). */
const NEUTRAL_VARS: Record<string, string> = {
	background: 'bg',
	surface1: 'surface-1',
	surface2: 'surface-2',
	surface3: 'surface-3',
	onSurface: 'on-surface',
	muted: 'on-muted',
	outline: 'outline',
	outlineSoft: 'outline-soft',
	ink: 'ink',
	neuHi: 'neu-hi',
	neuLo: 'neu-lo',
	base: 'wp-base',
}

const ACCENT_SLOTS = ['primary', 'secondary', 'tertiary']
const hex = (color: Parameters<typeof ColorUtils.toHex>[0]) => ColorUtils.toHex(color)

function accentVars(slot: string, roles: TRoles): Record<string, string> {
	return {
		[`--${slot}`]: hex(roles.main),
		[`--on-${slot}`]: hex(roles.onMain),
		[`--${slot}-container`]: hex(roles.container),
		[`--on-${slot}-container`]: hex(roles.onContainer),
		[`--${slot}-bright`]: hex(roles.bright),
	}
}

/** Malha de gradientes radiais — o "papel de parede" que o vidro vai refratar. */
function wallpaper(all: Record<string, TRoles>): string {
	const [a, b, c, d] = [all.primary.mesh1, all.secondary.mesh2, all.tertiary.mesh3, all.primary.mesh4].map(hex)
	return [
		`radial-gradient(at 12% 18%, ${a}, transparent 62%)`,
		`radial-gradient(at 88% 12%, ${b}, transparent 60%)`,
		`radial-gradient(at 78% 92%, ${c}, transparent 62%)`,
		`radial-gradient(at 6% 96%, ${d}, transparent 58%)`,
	].join(', ')
}

/** Papéis resolvidos pelo `Theme` + parâmetros de vidro + `ThemeStyle.components` → variáveis CSS. */
function toCssVars(roles: Record<string, TRoles>, components: Readonly<Record<string, unknown>>, glass: TGlassParams): Record<string, string> {
	const vars: Record<string, string> = { '--error': hex(roles.error.main), '--wp-mesh': wallpaper(roles) }
	for (const slot of ACCENT_SLOTS) Object.assign(vars, accentVars(slot, roles[slot]))
	for (const [role, name] of Object.entries(NEUTRAL_VARS)) vars[`--${name}`] = hex(roles.neutral[role])
	return {
		...vars,
		'--scrim': ColorUtils.toHex(roles.neutral.background, 0.7),
		'--glass-blur': String(glass.blur),
		'--glass-tint': String(glass.tint),
		'--glass-sat': String(glass.saturation),
		'--glass-spec': String(glass.specular),
		...Object.fromEntries(Object.entries(components).map(([key, value]) => [`--${key}`, String(value)])),
	}
}

export { APP_SCHEMES, toCssVars }
