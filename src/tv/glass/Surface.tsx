import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { FunctionUtils } from '@lotexiu/typescript'
import { appearance } from '../state/appearance'
import { useMutableReactive, useReactive } from '@lotexiu/react'
import { displacementMap, SUPPORTS_REFRACTION } from './displacement'

type TBox = Readonly<{ width: number; height: number }>

/** Remede a cada tanto durante o redimensionamento, e uma última vez ao parar (`trailing`). */
const RESIZE_THROTTLE_MS = 90
/** Quanto a aberração cromática separa os canais (fração da refração por unidade de `dispersion`). */
const DISPERSION_SPREAD = 0.3

type TSurfaceProps = HTMLAttributes<HTMLDivElement> & {
	/**
	 * `false` mantém só o desfoque, mesmo no Liquid Glass. Use onde não há conteúdo nítido passando por trás
	 * (barras sobre o papel de parede liso): a refração só aparece sobre detalhe e custa por quadro.
	 */
	refract?: boolean
}

/**
 * Painel base de toda a interface. Cada estilo visual decide, por CSS, como ele se parece; no Liquid Glass
 * ele também monta um filtro SVG com um mapa de deslocamento do tamanho do elemento. Níveis (`appearance.quality`):
 *  - `light`:    só desfoque (sem filtro SVG)
 *  - `balanced`: 1 passe de deslocamento
 *  - `full`:     3 passes (um por canal RGB) = aberração cromática
 */
function Surface({ refract = true, className = '', style, children, ...rest }: TSurfaceProps) {
	const filterId = `glass-${useId().replace(/:/g, '')}`
	const ref = useRef<HTMLDivElement>(null)
	const styleDef = useReactive(appearance.styleId)
	const quality = useReactive(appearance.quality)
	const glass = useMutableReactive(appearance.glass)
	const [box, setBox] = useState<TBox | null>(null)
	const [map, setMap] = useState<string | null>(null)
	const refractive = refract && styleDef.refractive && SUPPORTS_REFRACTION && quality !== 'light'

	useLayoutEffect(() => {
		const element = ref.current
		if (!refractive || element === null) return
		const measure = () => {
			const width = element.offsetWidth
			const height = element.offsetHeight
			setBox((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }))
		}
		measure()
		const settle = FunctionUtils.throttle(measure, RESIZE_THROTTLE_MS, { trailing: true })
		const observer = new ResizeObserver(settle)
		observer.observe(element)
		return () => {
			observer.disconnect()
			settle.clear()
		}
	}, [refractive])

	// o mapa é montado fora do render: medir o custo (`StopWatch`) notifica a UI dos ajustes
	useLayoutEffect(() => {
		if (refractive && box !== null) setMap(displacementMap(box.width, box.height, glass.bezel))
	}, [refractive, box, glass.bezel])

	const ready = refractive && box !== null && map !== null
	const inline: CSSProperties = { ...style }
	if (ready) {
		;(inline as Record<string, string>)['--glass-filter'] = `blur(${glass.blur}px) url(#${filterId}) saturate(${glass.saturation})`
	}
	const spread = quality === 'full' ? glass.dispersion * DISPERSION_SPREAD : 0

	return (
		<div ref={ref} className={`surface ${className}`} style={inline} {...rest}>
			{ready && <RefractionFilter id={filterId} box={box} map={map} refraction={glass.refraction} spread={spread} />}
			{children}
		</div>
	)
}

type TFilterProps = { id: string; box: TBox; map: string; refraction: number; spread: number }

const KEEP_RED = '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
const KEEP_GREEN = '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'
const KEEP_BLUE = '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'

type TDisplaceProps = { map: string; scale: number; result?: string }

function Displace({ scale, result }: TDisplaceProps) {
	return <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={result} />
}

function RefractionFilter({ id, box, map, refraction, spread }: TFilterProps) {
	return (
		<svg className="surface__defs" width={0} height={0} aria-hidden>
			<defs>
				<filter id={id} x={0} y={0} width={box.width} height={box.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feImage href={map} x={0} y={0} width={box.width} height={box.height} preserveAspectRatio="none" result="map" />
					{spread === 0 ? (
						<Displace map={map} scale={refraction} />
					) : (
						<>
							<Displace map={map} scale={refraction * (1 + spread)} result="dispR" />
							<feColorMatrix in="dispR" type="matrix" values={KEEP_RED} result="r" />
							<Displace map={map} scale={refraction} result="dispG" />
							<feColorMatrix in="dispG" type="matrix" values={KEEP_GREEN} result="g" />
							<Displace map={map} scale={refraction * (1 - spread)} result="dispB" />
							<feColorMatrix in="dispB" type="matrix" values={KEEP_BLUE} result="b" />
							<feBlend in="r" in2="g" mode="screen" result="rg" />
							<feBlend in="rg" in2="b" mode="screen" />
						</>
					)}
				</filter>
			</defs>
		</svg>
	)
}

export { Surface }
