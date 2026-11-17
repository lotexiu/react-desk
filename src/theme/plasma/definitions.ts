import { PALETTES_TYPES, PaletteFactory } from '@lotexiu/typescript'
import type { TAdjustmentDefinitions, TRoleRules, TRoleTone, TStyleContext } from '@lotexiu/typescript'

function surfaceTone(dark: number, light: number, reach = 8): TRoleTone {
	return ({ mode, contrast }) => (mode === 'dark' ? dark - contrast * reach : light + contrast * reach)
}

function contentTone(dark: number, light: number, reach = 28): TRoleTone {
	return ({ mode, contrast }) => (mode === 'dark' ? dark + contrast * reach : light - contrast * reach)
}

const plasmaPaletteFactory = new PaletteFactory({
	seeds: {
		accent: { label: 'Destaque', default: '#3daee9' },
	},
	palettes: {
		accent: ({ seeds }) => seeds.accent,
		neutral: ({ seeds }) => seeds.accent.neutral(0.012, 'neutral'),
		depth: ({ seeds }) => seeds.accent.derive({ hueShift: 25, chromaScale: 0.9, name: 'depth' }),
		danger: () => PALETTES_TYPES.Basic.CRIMSON,
	},
})

const plasmaPalettes = plasmaPaletteFactory.build()

type TPlasmaPaletteId = keyof typeof plasmaPalettes & string

const plasmaRoles = {
	desktop: { palette: 'depth', tone: surfaceTone(14, 82, 12) },
	window: { palette: 'neutral', tone: surfaceTone(17, 97) },
	header: { palette: 'neutral', tone: surfaceTone(21, 92) },
	panel: { palette: 'neutral', tone: surfaceTone(13, 96) },
	outline: { palette: 'neutral', tone: contentTone(30, 80, 36) },
	accent: { palette: 'accent', tone: { dark: 68, light: 52 } },
	danger: { palette: 'danger', tone: { dark: 58, light: 50 } },
	onDesktop: { palette: 'neutral', tone: contentTone(96, 12), on: 'desktop', min: 4.5 },
	onWindow: { palette: 'neutral', tone: contentTone(92, 15), on: 'window', min: 4.5 },
	onWindowMuted: { palette: 'neutral', tone: contentTone(68, 42, 18), on: 'window', min: 3 },
	onHeader: { palette: 'neutral', tone: contentTone(92, 15), on: 'header', min: 4.5 },
	onPanel: { palette: 'neutral', tone: contentTone(92, 15), on: 'panel', min: 4.5 },
	onAccent: { palette: 'accent', tone: { dark: 10, light: 100 }, on: 'accent', min: 4.5 },
	onDanger: { palette: 'danger', tone: 100, on: 'danger', min: 3 },
} as const satisfies TRoleRules<TPlasmaPaletteId>

type TPlasmaRole = keyof typeof plasmaRoles & string

const plasmaAdjustments = {
	roundness: { kind: 'range', label: 'Arredondamento', default: 1, min: 0, max: 2, step: 0.25 },
	translucency: { kind: 'range', label: 'Transparência', default: 0.2, min: 0, max: 0.6, step: 0.05 },
	blur: { kind: 'toggle', label: 'Desfoque', default: true },
	floatingPanel: { kind: 'toggle', label: 'Painel flutuante', default: true },
	panelEdge: {
		kind: 'choice',
		label: 'Posição do painel',
		default: 'bottom',
		options: ['bottom', 'top'],
		optionLabels: { bottom: 'Embaixo', top: 'Em cima' },
		control: 'radio',
	},
	motion: {
		kind: 'choice',
		label: 'Animações',
		default: 'normal',
		options: ['off', 'reduced', 'normal'],
		optionLabels: { off: 'Desligadas', reduced: 'Reduzidas', normal: 'Normais' },
	},
} as const satisfies TAdjustmentDefinitions

type TPlasmaContext = TStyleContext<TPlasmaPaletteId, TPlasmaRole, typeof plasmaAdjustments>

export { plasmaPaletteFactory, plasmaPalettes, plasmaRoles, plasmaAdjustments }
export type { TPlasmaPaletteId, TPlasmaRole, TPlasmaContext }
