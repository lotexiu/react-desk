import { computed, ticker, Time } from '@lotexiu/typescript'
import { every } from './every'

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS

const clock = new Time()
const clockTicker = ticker(SECOND_MS)

// `Time` lê o próprio signal interno em `toLocaleString`, então estes `computed` acompanham
// `refresh()` e só avisam quando o texto muda de fato (1x por minuto), mesmo com o relógio batendo
// a cada segundo.
const timeLabel = computed(() =>
	clock.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
)
const dateLabel = computed(() =>
	clock.toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
)
const minuteOfDay = computed(() => clock.hour() * 60 + clock.minutes())

function startClock(): () => void {
	clock.refresh()
	return every(clockTicker, () => clock.refresh())
}

export { SECOND_MS, MINUTE_MS, clock, timeLabel, dateLabel, minuteOfDay, startClock }
