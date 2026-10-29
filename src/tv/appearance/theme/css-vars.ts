import { ColorUtils } from '@lotexiu/typescript'
import type { TColor } from '@lotexiu/typescript'
import type { TGlassParams } from './types'

const hex = (color: TColor) => ColorUtils.toHex(color)

/** Malha de gradientes radiais — o "papel de parede" que o vidro vai refratar. */
function wallpaper(roles: Record<string, TColor>): string {
	const [topLeft, topRight, bottomRight, bottomLeft] = ['mesh-1', 'mesh-2', 'mesh-3', 'mesh-4'].map(
		(name) => hex(roles[name])
	)
	return [
		`radial-gradient(at 12% 18%, ${topLeft}, transparent 62%)`,
		`radial-gradient(at 88% 12%, ${topRight}, transparent 60%)`,
		`radial-gradient(at 78% 92%, ${bottomRight}, transparent 62%)`,
		`radial-gradient(at 6% 96%, ${bottomLeft}, transparent 58%)`,
	].join(', ')
}

/**
 * Papéis do `Theme` (o nome do papel é o da variável) + parâmetros de vidro +
 * `ThemeStyle.components` → variáveis CSS.
 */
function toCssVars(
	roles: Record<string, TColor>,
	components: Readonly<Record<string, unknown>>,
	glass: TGlassParams
): Record<string, string> {
	return {
		...Object.fromEntries(Object.entries(roles).map(([name, color]) => [`--${name}`, hex(color)])),
		'--wp-mesh': wallpaper(roles),
		'--scrim': ColorUtils.toHex(roles.bg, 0.7),
		'--glass-blur': String(glass.blur),
		'--glass-tint': String(glass.tint),
		'--glass-sat': String(glass.saturation),
		'--glass-spec': String(glass.specular),
		...Object.fromEntries(
			Object.entries(components).map(([key, value]) => [`--${key}`, String(value)])
		),
	}
}

export { toCssVars }
