import { computed, MathUtils, signal, ticker, toggle } from '@lotexiu/typescript'
import { programAt, TITLES } from '../catalog/mock-content'
import type { TChannel, TTitle } from '../catalog/mock-content'
import { MINUTE_MS, minuteOfDay, SECOND_MS } from '../system/clock'
import { every } from '../system/every'

type TPlaying = Readonly<{
	id: string
	title: string
	subtitle: string
	seed: string
	totalMs: number
	live: boolean
}>

const playbackTicker = ticker(SECOND_MS)

function playingFromTitle(title: TTitle): TPlaying {
	return {
		id: title.id,
		title: title.title,
		subtitle: `${title.kind} · ${title.year}`,
		seed: title.seed,
		totalMs: title.minutes * MINUTE_MS,
		live: false,
	}
}

const playing = signal<TPlaying>(playingFromTitle(TITLES[1]))
const position = signal(Math.round((TITLES[1].progress ?? 0) * TITLES[1].minutes * MINUTE_MS))
const isPlaying = toggle(true)
const playbackProgress = computed(() => MathUtils.clamp(position() / playing().totalMs, 0, 1))

function playTitle(title: TTitle) {
	playing.set(playingFromTitle(title))
	position.set(Math.round((title.progress ?? 0) * title.minutes * MINUTE_MS))
	isPlaying.on()
}

function playChannel(channel: TChannel) {
	const { program, progress } = programAt(channel, minuteOfDay())
	playing.set({
		id: channel.id,
		title: program.title,
		subtitle: `Ao vivo · ${channel.number} ${channel.name}`,
		seed: channel.seed,
		totalMs: program.minutes * MINUTE_MS,
		live: true,
	})
	position.set(Math.round(progress * program.minutes * MINUTE_MS))
	isPlaying.on()
}

function startPlayback(): () => void {
	return every(playbackTicker, () => {
		if (isPlaying()) position.update((ms) => Math.min(ms + SECOND_MS, playing().totalMs))
	})
}

export { playing, position, isPlaying, playbackProgress, playTitle, playChannel, startPlayback }
export type { TPlaying }
