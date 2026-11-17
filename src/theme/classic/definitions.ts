import { PALETTES_TYPES, PaletteFactory } from '@lotexiu/typescript'
import type { TAdjustmentDefinitions, TRoleRules, TRoleTone, TStyleContext } from '@lotexiu/typescript'

function surfaceTone(dark: number, light: number): TRoleTone {
	return ({ mode, contrast }) => (mode === 'dark' ? dark - contrast * 6 : light + contrast * 4)
}

const classicPaletteFactory = new PaletteFactory({
	seeds: {
		accent: { label: 'Destaque', default: '#1f4fa8' },
	},
	palettes: {
		accent: ({ seeds }) => seeds.accent,
		neutral: ({ seeds }) => seeds.accent.neutral(0.008, 'neutral'),
		depth: () => PALETTES_TYPES.Basic.TEAL,
		danger: () => PALETTES_TYPES.Basic.CRIMSON,
	},
})

const classicPalettes = classicPaletteFactory.build()

type TClassicPaletteId = keyof typeof classicPalettes & string

const classicRoles = {
	desktop: { palette: 'depth', tone: { dark: 30, light: 50 } },
	window: { palette: 'neutral', tone: surfaceTone(28, 82) },
	header: { palette: 'accent', tone: { dark: 30, light: 35 } },
	panel: { palette: 'neutral', tone: surfaceTone(24, 80) },
	outline: { palette: 'neutral', tone: { dark: 10, light: 30 } },
	accent: { palette: 'accent', tone: { dark: 60, light: 40 } },
	danger: { palette: 'danger', tone: { dark: 55, light: 45 } },
	onDesktop: { palette: 'neutral', tone: 100, on: 'desktop', min: 4.5 },
	onWindow: { palette: 'neutral', tone: { dark: 95, light: 5 }, on: 'window', min: 4.5 },
	onWindowMuted: { palette: 'neutral', tone: { dark: 72, light: 35 }, on: 'window', min: 3 },
	onHeader: { palette: 'neutral', tone: 100, on: 'header', min: 4.5 },
	onPanel: { palette: 'neutral', tone: { dark: 95, light: 5 }, on: 'panel', min: 4.5 },
	onAccent: { palette: 'accent', tone: { dark: 5, light: 100 }, on: 'accent', min: 4.5 },
	onDanger: { palette: 'danger', tone: 100, on: 'danger', min: 3 },
} as const satisfies TRoleRules<TClassicPaletteId>

type TClassicRole = keyof typeof classicRoles & string

const classicAdjustments = {
	bevel: { kind: 'range', label: 'Relevo', default: 2, min: 0, max: 3, step: 1 },
	texture: {
		kind: 'choice',
		label: 'Textura do fundo',
		default: 'fine',
		options: ['none', 'fine', 'heavy'],
		optionLabels: { none: 'Lisa', fine: 'Fina', heavy: 'Grossa' },
		control: 'radio',
	},
	titleGradient: { kind: 'toggle', label: 'Título em degradê', default: true },
	motion: {
		kind: 'choice',
		label: 'Animações',
		default: 'reduced',
		options: ['off', 'reduced', 'normal'],
		optionLabels: { off: 'Desligadas', reduced: 'Reduzidas', normal: 'Normais' },
	},
} as const satisfies TAdjustmentDefinitions

type TClassicContext = TStyleContext<TClassicPaletteId, TClassicRole, typeof classicAdjustments>

export { classicPaletteFactory, classicPalettes, classicRoles, classicAdjustments }
export type { TClassicContext }
