import { PathBuilder } from '@lotexiu/typescript'

const SIZE = 28
const CENTER = { x: SIZE / 2, y: SIZE / 2 }
const RADIUS = SIZE / 2 - 1.5
const DEGREES_PER_HOUR = 30
const DEGREES_PER_MINUTE = 6
const MINUTES_PER_HOUR = 60
const HOURS_ON_FACE = 12
const DEGREES_PER_QUARTER = 90
const HOUR_MARKS = [...Array(HOURS_ON_FACE).keys()].map((hour) => hour * DEGREES_PER_HOUR)

function hand(degrees: number, length: number): string {
	const tip = PathBuilder.polar(CENTER, length, degrees)
	return new PathBuilder().moveTo(CENTER.x, CENTER.y).lineTo(tip.x, tip.y).toString()
}

function ClockFace({ date }: { date: Date }) {
	const minutes = date.getMinutes() + date.getSeconds() / MINUTES_PER_HOUR
	const hours = (date.getHours() % HOURS_ON_FACE) + minutes / MINUTES_PER_HOUR
	const marks = HOUR_MARKS.map((degrees) => {
		const outer = PathBuilder.polar(CENTER, RADIUS, degrees)
		const inner = PathBuilder.polar(CENTER, RADIUS - (degrees % DEGREES_PER_QUARTER === 0 ? 3 : 1.5), degrees)
		return new PathBuilder().moveTo(inner.x, inner.y).lineTo(outer.x, outer.y).toString()
	}).join('')

	return (
		<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden fill="none" stroke="currentColor" strokeLinecap="round">
			<path d={PathBuilder.arc(CENTER, RADIUS, 0, 360)} strokeWidth={1.2} opacity={0.7} />
			<path d={marks} strokeWidth={1} opacity={0.6} />
			<path d={hand(hours * DEGREES_PER_HOUR, RADIUS * 0.5)} strokeWidth={2} />
			<path d={hand(minutes * DEGREES_PER_MINUTE, RADIUS * 0.78)} strokeWidth={1.4} />
			<path d={hand(date.getSeconds() * DEGREES_PER_MINUTE, RADIUS * 0.85)} strokeWidth={0.8} stroke="var(--accent)" />
		</svg>
	)
}

export { ClockFace }
