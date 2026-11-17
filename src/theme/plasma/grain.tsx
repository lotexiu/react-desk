import { useEffect, useRef } from 'react'
import { ValueNoise } from '@lotexiu/typescript'

const GRAIN_SEED = 7
const GRAIN_TILE = 128
const GRAIN_SCALE = 0.35
const CHANNEL_MAXIMUM = 255
const RGBA_CHANNELS = 4

function renderGrainTile(canvas: HTMLCanvasElement) {
	const context = canvas.getContext('2d')
	if (context === null) return
	const noise = new ValueNoise(GRAIN_SEED)
	const image = context.createImageData(GRAIN_TILE, GRAIN_TILE)
	for (let y = 0; y < GRAIN_TILE; y++) {
		for (let x = 0; x < GRAIN_TILE; x++) {
			const shade = Math.round(noise.fractal(x * GRAIN_SCALE, y * GRAIN_SCALE, { octaves: 3 }) * CHANNEL_MAXIMUM)
			const offset = (y * GRAIN_TILE + x) * RGBA_CHANNELS
			image.data[offset] = shade
			image.data[offset + 1] = shade
			image.data[offset + 2] = shade
			image.data[offset + 3] = CHANNEL_MAXIMUM
		}
	}
	context.putImageData(image, 0, 0)
}

function Grain({ opacity }: { opacity: number }) {
	const canvas = useRef<HTMLCanvasElement>(null)
	const tile = useRef<string | null>(null)
	const layer = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (opacity === 0 || canvas.current === null || layer.current === null) return
		if (tile.current === null) {
			renderGrainTile(canvas.current)
			tile.current = canvas.current.toDataURL()
		}
		layer.current.style.backgroundImage = `url(${tile.current})`
	}, [opacity])

	if (opacity === 0) return null
	return (
		<>
			<canvas ref={canvas} width={GRAIN_TILE} height={GRAIN_TILE} hidden />
			<div ref={layer} aria-hidden style={{ position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
		</>
	)
}

export { Grain }
