import type { CSSProperties } from 'react'
import { Cache, ColorUtils, TonalPalette } from '@lotexiu/typescript'

const palettes = new Cache<TonalPalette>()

/** Uma `TonalPalette` por cor-semente — o "pôster" inteiro é derivado dela. */
function paletteOf(seed: string): TonalPalette {
	return palettes.getOrSet(seed, () => new TonalPalette(seed, seed))
}

function artVars(seed: string): CSSProperties {
	const palette = paletteOf(seed)
	return { '--a1': ColorUtils.toHex(palette.get(18)), '--a2': ColorUtils.toHex(palette.get(46)), '--a3': ColorUtils.toHex(palette.get(78)) } as CSSProperties
}

type TArtProps = { seed: string; variant?: number }

/** Arte procedural no lugar de imagens: gradiente + orbe + faixas, tudo das cores da paleta. */
function Art({ seed, variant = 0 }: TArtProps) {
	return <div className={`art art--v${variant % 3}`} style={artVars(seed)} aria-hidden />
}

export { Art, paletteOf }
