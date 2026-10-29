import type { TRoleRules } from '@lotexiu/typescript'
import type { TPaletteId } from './palettes'

/**
 * Os papéis de cor do app. O nome de cada papel já é o nome da variável CSS (`--<papel>`), então
 * `toCssVars` não traduz nada. `palette` é um dos ids que o estilo declara (`TPaletteId`:
 * `primary`, `secondary`, `tertiary`, `neutral`, `error`); `on` + `min` dizem sobre qual papel ele
 * fica e o contraste mínimo (WCAG 2.1).
 */

/**
 * Os cinco papéis de um acento: cor, texto sobre ela, contêiner, texto sobre o contêiner e a versão
 * viva.
 */
function accent(slot: 'primary' | 'secondary' | 'tertiary'): TRoleRules<TPaletteId> {
	return {
		[slot]: { palette: slot, tone: { dark: 80, light: 40 } },
		[`on-${slot}`]: { palette: slot, tone: { dark: 10, light: 100 }, on: slot, min: 4.5 },
		[`${slot}-container`]: { palette: slot, tone: { dark: 30, light: 90 } },
		[`on-${slot}-container`]: {
			palette: slot,
			tone: { dark: 100, light: 10 },
			on: `${slot}-container`,
			min: 4.5,
		},
		[`${slot}-bright`]: { palette: slot, tone: 70 },
	}
}

const APP_ROLES: TRoleRules<TPaletteId> = {
	// fundo, superfícies empilhadas, texto e linhas
	bg: { palette: 'neutral', tone: { dark: 10, light: 98 } },
	'surface-1': { palette: 'neutral', tone: { dark: 15, light: 97 } },
	'surface-2': { palette: 'neutral', tone: { dark: 20, light: 94 } },
	'surface-3': { palette: 'neutral', tone: { dark: 26, light: 91 } },
	'on-surface': { palette: 'neutral', tone: { dark: 94, light: 10 }, on: 'bg', min: 4.5 },
	'on-muted': { palette: 'neutral', tone: { dark: 74, light: 38 }, on: 'bg', min: 3 },
	outline: { palette: 'neutral', tone: { dark: 52, light: 60 } },
	'outline-soft': { palette: 'neutral', tone: { dark: 32, light: 86 } },
	// os estilos brutalist e neumorphism
	ink: { palette: 'neutral', tone: { dark: 100, light: 0 } },
	'neu-hi': { palette: 'neutral', tone: { dark: 30, light: 100 } },
	'neu-lo': { palette: 'neutral', tone: { dark: 9, light: 80 } },
	'wp-base': { palette: 'neutral', tone: { dark: 8, light: 98 } },
	// acentos
	...accent('primary'),
	...accent('secondary'),
	...accent('tertiary'),
	error: { palette: 'error', tone: { dark: 80, light: 40 } },
	// os tons do papel de parede
	'mesh-1': { palette: 'primary', tone: { dark: 38, light: 84 } },
	'mesh-2': { palette: 'secondary', tone: { dark: 34, light: 88 } },
	'mesh-3': { palette: 'tertiary', tone: { dark: 40, light: 90 } },
	'mesh-4': { palette: 'primary', tone: { dark: 26, light: 92 } },
}

export { APP_ROLES }
