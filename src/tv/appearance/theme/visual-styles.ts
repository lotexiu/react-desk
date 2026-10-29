import { ThemeStyle } from '@lotexiu/typescript'
import { DEFAULT_PALETTES } from './palettes'
import { APP_ROLES } from './roles'

/**
 * Os estilos visuais disponíveis. O CSS de cada um vive em `appearance/styles/<id>.css`; aqui só o
 * que o TS precisa saber.
 */
type TVisualStyleId =
	'liquid-glass' | 'acrylic' | 'material' | 'neumorphism' | 'brutalist' | 'neon' | 'minimal'

type TVisualStyle = Readonly<{
	id: TVisualStyleId
	label: string
	tagline: string
	/** Usa `backdrop-filter` (os sliders de vidro só fazem sentido nesses). */
	glassy: boolean
	/** Aplica o filtro SVG de refração (só Chromium aceita `url()` em `backdrop-filter`). */
	refractive: boolean
	/**
	 * O que o `Theme` consome: os papéis de cor e os `components` (hoje, tokens que viram variáveis
	 * CSS `--<chave>`).
	 */
	theme: ThemeStyle
}>

const SYSTEM_FONT = `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
const MONO_FONT = `ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace`

/**
 * Todos os estilos usam os mesmos papéis por enquanto; cada um pode trocar tons (ou papéis) quando
 * precisar.
 */
const style = (id: TVisualStyleId, components: Record<string, string>): ThemeStyle =>
	new ThemeStyle({ name: id, palettes: DEFAULT_PALETTES, roles: APP_ROLES, components })

const VISUAL_STYLES: Readonly<Record<TVisualStyleId, TVisualStyle>> = {
	'liquid-glass': {
		id: 'liquid-glass',
		label: 'Liquid Glass',
		tagline: 'Vidro com refração, distorção e aberração cromática',
		glassy: true,
		refractive: true,
		theme: style('liquid-glass', {
			'r-surface': '2.2em',
			'r-card': '1.5em',
			'r-btn': '999px',
			'border-w': '1px',
			'font-body': SYSTEM_FONT,
			'font-display': SYSTEM_FONT,
		}),
	},
	acrylic: {
		id: 'acrylic',
		label: 'Acrylic',
		tagline: 'Glassmorphism clássico: blur, tinta e ruído',
		glassy: true,
		refractive: false,
		theme: style('acrylic', {
			'r-surface': '1.2em',
			'r-card': '.9em',
			'r-btn': '.7em',
			'border-w': '1px',
			'font-body': SYSTEM_FONT,
			'font-display': SYSTEM_FONT,
		}),
	},
	material: {
		id: 'material',
		label: 'Material You',
		tagline: 'Superfícies tonais, elevação e state layers',
		glassy: false,
		refractive: false,
		theme: style('material', {
			'r-surface': '1.8em',
			'r-card': '1.3em',
			'r-btn': '999px',
			'border-w': '0px',
			'font-body': SYSTEM_FONT,
			'font-display': SYSTEM_FONT,
		}),
	},
	neumorphism: {
		id: 'neumorphism',
		label: 'Neumorphism',
		tagline: 'Relevo suave extrudado da própria superfície',
		glassy: false,
		refractive: false,
		theme: style('neumorphism', {
			'r-surface': '2em',
			'r-card': '1.5em',
			'r-btn': '1.2em',
			'border-w': '0px',
			'font-body': SYSTEM_FONT,
			'font-display': SYSTEM_FONT,
		}),
	},
	brutalist: {
		id: 'brutalist',
		label: 'Neo-brutalist',
		tagline: 'Bordas grossas, sombra dura e cor chapada',
		glassy: false,
		refractive: false,
		theme: style('brutalist', {
			'r-surface': '.3em',
			'r-card': '.25em',
			'r-btn': '.25em',
			'border-w': '3px',
			'font-body': MONO_FONT,
			'font-display': MONO_FONT,
		}),
	},
	neon: {
		id: 'neon',
		label: 'Neon / Cyber',
		tagline: 'Contornos luminosos sobre fundo escuro',
		glassy: false,
		refractive: false,
		theme: style('neon', {
			'r-surface': '.8em',
			'r-card': '.6em',
			'r-btn': '.5em',
			'border-w': '1px',
			'font-body': MONO_FONT,
			'font-display': MONO_FONT,
		}),
	},
	minimal: {
		id: 'minimal',
		label: 'Minimal Flat',
		tagline: 'Plano, limpo, bordas finas e muito respiro',
		glassy: false,
		refractive: false,
		theme: style('minimal', {
			'r-surface': '1em',
			'r-card': '.8em',
			'r-btn': '.6em',
			'border-w': '1px',
			'font-body': SYSTEM_FONT,
			'font-display': SYSTEM_FONT,
		}),
	},
}

const VISUAL_STYLE_LIST: readonly TVisualStyle[] = Object.values(VISUAL_STYLES)

export { VISUAL_STYLES, VISUAL_STYLE_LIST }
export type { TVisualStyle, TVisualStyleId }
