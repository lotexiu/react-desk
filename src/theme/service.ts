import { Theme } from '@lotexiu/typescript';
import type { TDeskStyle } from './contract';
import { PlasmaStyle } from './plasma/style';

export const theme = new Theme<TDeskStyle>({
	style: PlasmaStyle,
	mode: 'dark',
})

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
