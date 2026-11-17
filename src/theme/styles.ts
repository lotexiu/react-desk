import type { TDeskStyle } from './contract'
import { ClassicStyle } from './classic/style'
import { PlasmaStyle } from './plasma/style'

const DESK_STYLES: Readonly<Record<string, TDeskStyle>> = {
	plasma: PlasmaStyle,
	classic: ClassicStyle,
}

const DESK_STYLE_LABELS: Readonly<Record<string, string>> = {
	plasma: 'Plasma',
	classic: 'Clássico',
}

export { DESK_STYLES, DESK_STYLE_LABELS }
