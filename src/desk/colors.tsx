import { useRef } from 'react'
import { useFloating, useOutsidePointer, usePart, useReactive } from '@lotexiu/react'
import { ColorUtils, Combobox, PALETTES_TYPES, Popover, StringUtils, TONE_STOPS } from '@lotexiu/typescript'
import type { Palette } from '@lotexiu/typescript'
import { theme } from '../theme/service'

type TPaletteOption = {
	readonly value: string
	readonly label: string
	readonly palette: Palette
}

const FAMILY_LABELS: Readonly<Record<string, string>> = { Basic: 'Básica', Light: 'Clara', Dark: 'Escura' }

const PALETTE_OPTIONS: readonly TPaletteOption[] = Object.entries(PALETTES_TYPES).flatMap(([family, palettes]) =>
	Object.values(palettes as Record<string, Palette>).map((palette) => {
		const name = palette.name()
		return { value: `${family}.${name}`, label: `${StringUtils.capitalize(name.toLowerCase().replaceAll('_', ' '))} · ${FAMILY_LABELS[family] ?? family}`, palette }
	})
)

const search = new Combobox({ id: 'colors-search', items: PALETTE_OPTIONS })
const tones = new Popover({ id: 'colors-tones', placement: 'bottom-start', offset: 6 })

function ColorsWindow() {
	const { Combobox: ComboboxView, Button } = useReactive(theme.components)
	const chosen = useReactive(search.selectedItem)
	const open = useReactive(tones.value)
	const anchor = useRef<HTMLDivElement>(null)
	const floating = useRef<HTMLDivElement>(null)
	const position = useFloating(tones, anchor, floating)
	const content = usePart(() => tones.parts.content(), [])
	useOutsidePointer([anchor, floating], tones.interactOutside, open)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
			<ComboboxView control={search} label="Paleta" />
			<div ref={anchor} style={{ display: 'flex', gap: 8 }}>
				<Button onPress={tones.toggle} disabled={chosen === undefined}>
					Ver tons
				</Button>
				<Button tone="accent" disabled={chosen === undefined} onPress={() => chosen !== undefined && theme.setPalettes({ accent: chosen.palette })}>
					Usar como destaque
				</Button>
				<Button onPress={() => theme.setPalettes({ accent: undefined })}>Restaurar</Button>
			</div>
			{open && chosen !== undefined && (
				<div
					ref={floating}
					{...content}
					onKeyDown={tones.keydown}
					style={{ position: 'fixed', zIndex: 1000, left: position?.x ?? -9999, top: position?.y ?? -9999, display: 'grid', gridTemplateColumns: 'repeat(7, 28px)', gap: 4, padding: 8, background: 'var(--window)', border: '1px solid var(--outline)', borderRadius: 8, boxShadow: '0 8px 24px rgb(0 0 0 / 0.3)' }}
				>
					{TONE_STOPS.map((tone) => (
						<div key={tone} title={`Tom ${tone}`} style={{ width: 28, height: 28, borderRadius: 4, background: ColorUtils.toHex(chosen.palette.get(tone)) }} />
					))}
				</div>
			)}
			<p style={{ margin: 0, opacity: 0.75 }}>Busque por nome (acentos e maiúsculas não importam) e aplique a paleta como destaque do tema atual.</p>
		</div>
	)
}

export { ColorsWindow }
