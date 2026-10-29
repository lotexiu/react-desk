import { ColorUtils, PALETTES } from '@lotexiu/typescript'
import { Icon } from '../ui/Icon'
import { Section, Segmented, Slider, Switch } from '../ui/controls'
import { appearance, GLASS_CONTROLS, PALETTE_GROUPS } from './appearance'
import type { TPaletteGroup } from './appearance'
import { mapTimer } from '../glass/displacement'
import { useMutableReactive, useReactive } from '@lotexiu/react'
import type { TGlassQuality } from './appearance'
import { VISUAL_STYLE_LIST } from './theme/visual-styles'
import type { TVisualStyle } from './theme/visual-styles'

/** Miniatura: o próprio CSS do estilo aplicado a um painel + botão + chip de mentira. */
function StylePreview({ style }: { style: TVisualStyle }) {
	return (
		<span className="style-preview" data-style={style.id} aria-hidden>
			<span className="surface style-preview__panel" />
			<span className="style-preview__row">
				<i className="btn btn--primary" />
				<i className="chip" />
			</span>
		</span>
	)
}

function StylePicker() {
	const current = useReactive(appearance.styleId.key)
	return (
		<div className="style-grid">
			{VISUAL_STYLE_LIST.map((style, index) => (
				<button
					key={style.id}
					className="style-option"
					data-on={style.id === current}
					onClick={() => appearance.chooseStyle(style.id)}
					data-pf
				>
					<StylePreview style={style} />
					<strong>
						<kbd>{index + 1}</kbd> {style.label}
					</strong>
					<small>{style.tagline}</small>
				</button>
			))}
		</div>
	)
}

function PalettePicker() {
	const { group, index } = useReactive(appearance.pick)
	return (
		<>
			<div className="chip-row">
				{PALETTE_GROUPS.map((name) => (
					<button
						key={name}
						className="chip"
						data-on={name === group}
						onClick={() => appearance.choosePalette(name as TPaletteGroup, 0)}
						data-pf
					>
						{name}
					</button>
				))}
			</div>
			<div className="swatches">
				{PALETTES[group].map((palette, paletteIndex) => (
					<button
						key={palette.name()}
						className="swatch"
						data-on={paletteIndex === index}
						title={palette.name()}
						style={{ background: ColorUtils.toHex(palette.get(60)) }}
						onClick={() => appearance.choosePalette(group, paletteIndex)}
						data-pf
					>
						{paletteIndex === index && <Icon name="check" size="1.1em" />}
					</button>
				))}
			</div>
			<small className="muted">{PALETTES[group][index].name().replaceAll('_', ' ')}</small>
		</>
	)
}

/** Quanto custou gerar os mapas de refração até agora (`StopWatch.measure`). */
function MapStats() {
	const laps = useMutableReactive(mapTimer.laps)
	const average = useReactive(mapTimer.average)
	if (laps.length === 0) return null
	return (
		<small className="muted">
			Mapas de refração: {laps.length} gerados · média {average.toFixed(2)} ms
		</small>
	)
}

const QUALITY_OPTIONS = [
	{ value: 'light', label: 'Leve' },
	{ value: 'balanced', label: 'Equilibrado' },
	{ value: 'full', label: 'Completo' },
] as const satisfies readonly { value: TGlassQuality; label: string }[]

function GlassControls() {
	const values = useMutableReactive(appearance.glass)
	const quality = useReactive(appearance.quality)
	const ambient = useReactive(appearance.ambient)
	return (
		<>
			<Segmented
				value={quality}
				options={QUALITY_OPTIONS}
				onChange={(nextQuality) => appearance.quality.set(nextQuality)}
			/>
			<Switch
				label="Fundo animado (pesa)"
				icon="sun"
				on={ambient}
				onToggle={() => appearance.ambient.toggle()}
			/>
			{GLASS_CONTROLS.filter(({ key }) => quality === 'full' || key !== 'dispersion').map(
				({ key, label, min, max, step }) => (
					<Slider
						key={key}
						label={label}
						value={values[key]}
						min={min}
						max={max}
						step={step}
						format={(shownValue) => (step < 1 ? shownValue.toFixed(2) : String(shownValue))}
						onChange={(newValue) => appearance.glassFields[key].set(newValue)}
					/>
				)
			)}
			<MapStats />
			<button className="btn" onClick={() => appearance.resetGlass()} data-pf>
				Restaurar vidro
			</button>
		</>
	)
}

function History() {
	const canUndo = useReactive(appearance.canUndo)
	const canRedo = useReactive(appearance.canRedo)
	return (
		<div className="btn-row">
			<button className="btn" disabled={!canUndo} onClick={() => appearance.undo()} data-pf>
				<Icon name="undo" size="1.15em" /> Desfazer
			</button>
			<button className="btn" disabled={!canRedo} onClick={() => appearance.redo()} data-pf>
				<Icon name="redo" size="1.15em" /> Refazer
			</button>
			<button className="btn" onClick={() => appearance.shuffle()} data-pf>
				<Icon name="shuffle" size="1.15em" /> Sortear
			</button>
		</div>
	)
}

function AppearanceTab() {
	const mode = useReactive(appearance.theme.mode)
	const style = useReactive(appearance.styleId)
	return (
		<>
			<Section title="Estilo visual" hint="Teclas 1–7">
				<StylePicker />
			</Section>
			<Section title="Modo e histórico">
				<Segmented
					value={mode}
					options={[
						{ value: 'dark', label: 'Escuro', icon: 'moon' },
						{ value: 'light', label: 'Claro', icon: 'sun' },
					]}
					onChange={(mode) => appearance.setMode(mode)}
				/>
				<History />
			</Section>
			<Section title="Paleta" hint="Semente → tons tonais (oklch)">
				<PalettePicker />
			</Section>
			{style.glassy && (
				<Section title="Vidro" hint={style.refractive ? 'Refração SVG (Chromium)' : 'Desfoque ×4'}>
					<GlassControls />
				</Section>
			)}
		</>
	)
}

export { AppearanceTab }
