import { PALETTES_TYPES, Theme, ThemeStyle } from '@lotexiu/typescript'

const template = new ThemeStyle({
	name: 'Neutral',
	palettes: { primary: PALETTES_TYPES.Basic.NEUTRAL },
	roles: {
		background: { palette: 'primary', tone: { dark: 12, light: 90 } },
		foreground: { palette: 'primary', tone: { dark: 90, light: 12 }, on: 'background', min: 4.5 },
	},
	components: {},
})

export const theme = new Theme({
	style: template,
	mode: 'dark',
})

/**
 * Liga o tema ao documento: cada role vira uma variável CSS em `:root` (`--background`, `--foreground`, ...)
 * e `color-scheme` acompanha o modo. Reaplica a cada mudança. Retorna a função que cancela a ligação.
 */
export function bindThemeToDocument() {
	const root = document.documentElement
	const apply = () => {
		for (const [name, color] of Object.entries(theme.roles())) {
			root.style.setProperty(`--${name}`, color.toString())
		}
		root.style.colorScheme = theme.mode()
	}
	apply()
	return theme.roles.subscribe(apply)
}
