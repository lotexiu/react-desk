import { ThemeStyle } from '@lotexiu/typescript'
import { plasmaComponents } from '../plasma/style'
import { classicAdjustments, classicPalettes, classicRoles } from './definitions'
import { classicTokens } from './tokens'

export const ClassicStyle = new ThemeStyle({
	name: 'Clássico',
	palettes: classicPalettes,
	roles: classicRoles,
	adjustments: classicAdjustments,
	tokens: classicTokens,
	components: plasmaComponents,
})
