import {
	computed,
	field,
	MathUtils,
	PALETTES,
	Signal,
	signal,
	Theme,
	toggle,
	ValueHistory,
	variant,
} from '@lotexiu/typescript'
import type { Field, Palette, TThemeMode } from '@lotexiu/typescript'
import { toCssVars } from './theme/css-vars'
import { APP_PALETTES, DEFAULT_PICK } from './theme/palettes'
import type { TGlassParams } from './theme/types'
import { VISUAL_STYLE_LIST, VISUAL_STYLES } from './theme/visual-styles'
import type { TVisualStyle, TVisualStyleId } from './theme/visual-styles'

type TPaletteGroup = keyof typeof PALETTES
type TPick = { group: TPaletteGroup; index: number }
type TSnapshot = { pick: TPick; style: TVisualStyleId; mode: TThemeMode }

const PALETTE_GROUPS = Object.keys(PALETTES) as TPaletteGroup[]

const GLASS_DEFAULTS: TGlassParams = {
	blur: 6,
	refraction: 38,
	bezel: 28,
	dispersion: 0.35,
	tint: 0.14,
	saturation: 1.6,
	specular: 0.7,
}

const GLASS_CONTROLS: readonly {
	key: keyof TGlassParams
	label: string
	min: number
	max: number
	step: number
}[] = [
	{ key: 'blur', label: 'Desfoque', min: 0, max: 24, step: 1 },
	{ key: 'refraction', label: 'Refração', min: 0, max: 90, step: 1 },
	{ key: 'bezel', label: 'Largura da borda', min: 6, max: 60, step: 1 },
	{ key: 'dispersion', label: 'Aberração cromática', min: 0, max: 1, step: 0.05 },
	{ key: 'tint', label: 'Opacidade da tinta', min: 0, max: 0.8, step: 0.02 },
	{ key: 'saturation', label: 'Saturação', min: 0.5, max: 2.5, step: 0.05 },
	{ key: 'specular', label: 'Brilho especular', min: 0, max: 1, step: 0.05 },
]

const HISTORY_SIZE = 40

// --- fontes de verdade ---------------------------------------------------------------------
const pick = signal<TPick>({ ...DEFAULT_PICK })
const styleId = variant<TVisualStyleId, TVisualStyle>((id) => VISUAL_STYLES[id], 'liquid-glass')
const glass = signal<TGlassParams>({ ...GLASS_DEFAULTS })

/**
 * Custo do vidro (medido no banco de testes — ver LIB-FINDINGS.md): `light` só desfoca; `balanced`
 * refrata; `full` separa os canais RGB.
 */
type TGlassQuality = 'light' | 'balanced' | 'full'
const quality = signal<TGlassQuality>('balanced')

/**
 * Orbes do papel de parede em movimento. Tudo que está atrás de um `backdrop-filter` e muda de
 * pixel refaz o filtro a cada quadro; parado, o custo é zero.
 */
const ambient = toggle(false)

/** Um `field` por parâmetro: o slider escreve no objeto compartilhado e avisa. */
const glassFields = Object.fromEntries(
	GLASS_CONTROLS.map(({ key }) => [
		key,
		field(
			glass,
			(glassParams) => glassParams[key],
			(glassParams, value) => {
				glassParams[key] = value
			}
		),
	])
) as Record<keyof TGlassParams, Field<number>>

// --- paletas derivadas ---------------------------------------------------------------------
const primary = computed<Palette>(() => PALETTES[pick().group][pick().index])

/**
 * Uma paleta para cada id que os estilos declaram: a factory gera todas a partir da cor escolhida
 * (`brand`).
 */
const palettes = computed(() => APP_PALETTES.build({ brand: primary() }))
const themeStyle = computed(() => styleId().theme)

const theme = new Theme({ style: themeStyle(), palettes: palettes(), mode: 'dark' })
theme.bindStyle(themeStyle)
theme.bindPalettes(palettes)

const cssVars = computed(() => toCssVars(theme.roles(), theme.components(), glass()))

// --- histórico (desfazer/refazer das escolhas de tema) ----------------------------------------
const history = new ValueHistory<TSnapshot>(HISTORY_SIZE)
const snapshot = (): TSnapshot => ({
	pick: { ...pick() },
	style: styleId.key(),
	mode: theme.mode(),
})
const commit = () => history.add(snapshot())
commit()

// o estado inicial não deve ser desfeito (`history.canUndo` deixaria voltar para "antes de tudo")
const canUndo = computed(() => history.index() > 0)
const canRedo = history.canRedo

function restore(state: TSnapshot) {
	Signal.batch(() => {
		pick.set({ ...state.pick })
		styleId.key.set(state.style)
		theme.mode.set(state.mode)
	})
}

const appearance = {
	pick,
	styleId,
	glass,
	quality,
	ambient,
	glassFields,
	theme,
	cssVars,
	canUndo,
	canRedo,

	choosePalette(group: TPaletteGroup, index: number) {
		pick.set({ group, index })
		commit()
	},
	chooseStyle(id: TVisualStyleId) {
		styleId.key.set(id)
		commit()
	},
	setMode(mode: TThemeMode) {
		theme.mode.set(mode)
		commit()
	},
	toggleMode() {
		appearance.setMode(theme.mode() === 'dark' ? 'light' : 'dark')
	},
	undo() {
		history.undo()
		const current = history.current()
		if (current) restore(current.value)
	},
	redo() {
		history.redo()
		const current = history.current()
		if (current) restore(current.value)
	},
	resetGlass() {
		glass.set({ ...GLASS_DEFAULTS })
	},
	shuffle() {
		// `MathUtils.random(min, max, true)` exclui o `max`: passa o tamanho, não o último índice.
		const group = PALETTE_GROUPS[MathUtils.random(0, PALETTE_GROUPS.length, true)]
		const index = MathUtils.random(0, PALETTES[group].length, true)
		const style = VISUAL_STYLE_LIST[MathUtils.random(0, VISUAL_STYLE_LIST.length, true)]
		Signal.batch(() => {
			pick.set({ group, index })
			styleId.key.set(style.id)
		})
		commit()
	},
}

export { appearance, PALETTE_GROUPS, GLASS_CONTROLS }
export type { TPaletteGroup, TGlassQuality }
