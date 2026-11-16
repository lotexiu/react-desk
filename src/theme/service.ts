import { PALETTES_TYPES, Theme, ThemeStyle } from '@lotexiu/typescript';

const template = new ThemeStyle({
	name: 'Neutral',
	palettes: { primary: PALETTES_TYPES.Basic.NEUTRAL },
	roles: {
		background: { palette: 'primary', tone: { dark: 10, light: 90 } },
		foreground: { palette: 'primary', tone: { dark: 90, light: 10 }, on: 'background', min: 4.5 },
	},
	components: {},
})

export function themeProvider() {
	const theme = new Theme({
		style: template,
		mode: 'dark',
	})

	theme.roles.subscribe(()=> {
		const {style} = document.documentElement
		const {roles} = theme
		style.background = roles().background.toString()
		style.color = roles().foreground.toString()
	})
}