/** Os estilos visuais disponíveis. O CSS de cada um vive em `styles/<id>.css`; aqui só o que o TS precisa saber. */
type TVisualStyleId = 'liquid-glass' | 'acrylic' | 'material' | 'neumorphism' | 'brutalist' | 'neon' | 'minimal'

type TVisualStyle = Readonly<{
	id: TVisualStyleId
	label: string
	tagline: string
	/** Usa `backdrop-filter` (os sliders de vidro só fazem sentido nesses). */
	glassy: boolean
	/** Aplica o filtro SVG de refração (só Chromium aceita `url()` em `backdrop-filter`). */
	refractive: boolean
	/** Vira `ThemeStyle.components` → variáveis CSS `--<chave>`. */
	components: Readonly<Record<string, string>>
}>

const SYSTEM_FONT = `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
const MONO_FONT = `ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace`

const VISUAL_STYLES: Readonly<Record<TVisualStyleId, TVisualStyle>> = {
	'liquid-glass': {
		id: 'liquid-glass',
		label: 'Liquid Glass',
		tagline: 'Vidro com refração, distorção e aberração cromática',
		glassy: true,
		refractive: true,
		components: { 'r-surface': '2.2em', 'r-card': '1.5em', 'r-btn': '999px', 'border-w': '1px', 'font-body': SYSTEM_FONT, 'font-display': SYSTEM_FONT },
	},
	acrylic: {
		id: 'acrylic',
		label: 'Acrylic',
		tagline: 'Glassmorphism clássico: blur, tinta e ruído',
		glassy: true,
		refractive: false,
		components: { 'r-surface': '1.2em', 'r-card': '.9em', 'r-btn': '.7em', 'border-w': '1px', 'font-body': SYSTEM_FONT, 'font-display': SYSTEM_FONT },
	},
	material: {
		id: 'material',
		label: 'Material You',
		tagline: 'Superfícies tonais, elevação e state layers',
		glassy: false,
		refractive: false,
		components: { 'r-surface': '1.8em', 'r-card': '1.3em', 'r-btn': '999px', 'border-w': '0px', 'font-body': SYSTEM_FONT, 'font-display': SYSTEM_FONT },
	},
	neumorphism: {
		id: 'neumorphism',
		label: 'Neumorphism',
		tagline: 'Relevo suave extrudado da própria superfície',
		glassy: false,
		refractive: false,
		components: { 'r-surface': '2em', 'r-card': '1.5em', 'r-btn': '1.2em', 'border-w': '0px', 'font-body': SYSTEM_FONT, 'font-display': SYSTEM_FONT },
	},
	brutalist: {
		id: 'brutalist',
		label: 'Neo-brutalist',
		tagline: 'Bordas grossas, sombra dura e cor chapada',
		glassy: false,
		refractive: false,
		components: { 'r-surface': '.3em', 'r-card': '.25em', 'r-btn': '.25em', 'border-w': '3px', 'font-body': MONO_FONT, 'font-display': MONO_FONT },
	},
	neon: {
		id: 'neon',
		label: 'Neon / Cyber',
		tagline: 'Contornos luminosos sobre fundo escuro',
		glassy: false,
		refractive: false,
		components: { 'r-surface': '.8em', 'r-card': '.6em', 'r-btn': '.5em', 'border-w': '1px', 'font-body': MONO_FONT, 'font-display': MONO_FONT },
	},
	minimal: {
		id: 'minimal',
		label: 'Minimal Flat',
		tagline: 'Plano, limpo, bordas finas e muito respiro',
		glassy: false,
		refractive: false,
		components: { 'r-surface': '1em', 'r-card': '.8em', 'r-btn': '.6em', 'border-w': '1px', 'font-body': SYSTEM_FONT, 'font-display': SYSTEM_FONT },
	},
}

const VISUAL_STYLE_LIST: readonly TVisualStyle[] = Object.values(VISUAL_STYLES)

export { VISUAL_STYLES, VISUAL_STYLE_LIST }
export type { TVisualStyle, TVisualStyleId }
