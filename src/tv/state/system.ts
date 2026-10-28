import { AsyncUtils, computed, debouncedValue, FunctionUtils, KeyboardState, MathUtils, selection, signal, sort, StringUtils, task, ticker, Time, toggle, uiInteraction } from '@lotexiu/typescript'
import { TITLES, programAt } from '../mocks/content'
import type { TChannel, TTitle } from '../mocks/content'

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS

// --- relógio ---------------------------------------------------------------------------------
const clock = new Time()
const clockTicker = ticker(SECOND_MS)

// `Time` lê o próprio signal interno em `toLocaleString`, então estes `computed` acompanham `refresh()`
// e só avisam quando o texto muda de fato (1x por minuto), mesmo com o relógio batendo a cada segundo.
const timeLabel = computed(() => clock.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
const dateLabel = computed(() => clock.toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }))
const minuteOfDay = computed(() => clock.hour() * 60 + clock.minutes())

/** Liga um `ticker` a um callback; devolve a função que desliga os dois. */
function every(source: ReturnType<typeof ticker>, onTick: () => void): () => void {
	const unsubscribe = source.count.subscribe(onTick)
	source.start()
	return () => {
		source.stop()
		unsubscribe()
	}
}

function startClock(): () => void {
	clock.refresh()
	return every(clockTicker, () => clock.refresh())
}

// --- ajustes rápidos -------------------------------------------------------------------------
const wifi = toggle(true)
const bluetooth = toggle(true)
const nightLight = toggle(false)
const doNotDisturb = toggle(false)
const showRemote = toggle(true)
const networkFail = toggle(false)

const volume = signal(42)
const setVolume = (value: number) => volume.set(MathUtils.clamp(Math.round(value), 0, 100))

/** PIN do controle parental: guarda só dígitos; a máscara é só de exibição. */
const PIN_MASK = '0 0 0 0'
const pin = signal('')

/** Documento digitado (CPF ou CNPJ): o tipo é detectado pelo que foi escrito (`@lotexiu/br`). */
const documentText = signal('')

/** Data digitada (dd/mm/aaaa): `Mask.date` valida o calendário e devolve um `PlainDate`. */
const dateText = signal('')

// --- catálogo (assíncrono) -------------------------------------------------------------------
const CATALOG_LATENCY_MS = 900
const CATALOG_RETRIES = 1
const CATALOG_RETRY_DELAY_MS = 600

/** Simula a API: demora, e falha enquanto "Simular falha de rede" estiver ligado. */
async function fetchCatalog(): Promise<readonly TTitle[]> {
	return AsyncUtils.retry(
		async () => {
			await AsyncUtils.sleep(CATALOG_LATENCY_MS)
			if (networkFail()) throw new Error('Sem conexão com o servidor')
			return TITLES
		},
		CATALOG_RETRIES,
		CATALOG_RETRY_DELAY_MS
	)
}

const catalog = task<[], readonly TTitle[], Error>(fetchCatalog)

// --- busca, filtros e ordenação --------------------------------------------------------------
const query = debouncedValue('', 180)
const genres = selection<string>()

type TSortKey = 'Nota' | 'Ano' | 'Título'
const SORT_KEYS: readonly TSortKey[] = ['Nota', 'Ano', 'Título']
const sorter = sort<TSortKey>({ initialKey: 'Nota', initialDirection: 'DESC' })

/** Sem acento e minúsculo, para comparar. */
const fold = (text: string) => StringUtils.noAccent(text).toLowerCase()
const normalizedQuery = computed(() => fold(query.debounced().trim()))

function matchesQuery(title: TTitle, q: string): boolean {
	if (q === '') return true
	return fold(`${title.title} ${title.genres.join(' ')} ${title.synopsis}`).includes(q)
}

// --- teclado / controle remoto ---------------------------------------------------------------
const keyboard = new KeyboardState<string>()
const remoteUi = uiInteraction()

// --- reprodução ------------------------------------------------------------------------------
type TPlaying = Readonly<{ id: string; title: string; subtitle: string; seed: string; totalMs: number; live: boolean }>

const playbackTicker = ticker(SECOND_MS)

function playingFromTitle(title: TTitle): TPlaying {
	return { id: title.id, title: title.title, subtitle: `${title.kind} · ${title.year}`, seed: title.seed, totalMs: title.minutes * MINUTE_MS, live: false }
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
	playing.set({ id: channel.id, title: program.title, subtitle: `Ao vivo · ${channel.number} ${channel.name}`, seed: channel.seed, totalMs: program.minutes * MINUTE_MS, live: true })
	position.set(Math.round(progress * program.minutes * MINUTE_MS))
	isPlaying.on()
}

function startPlayback(): () => void {
	return every(playbackTicker, () => {
		if (isPlaying()) position.update((ms) => Math.min(ms + SECOND_MS, playing().totalMs))
	})
}

// --- toast -----------------------------------------------------------------------------------
const TOAST_MS = 2600
const toast = signal<string | null>(null)
const hideToast = FunctionUtils.debounce(() => toast.set(null), TOAST_MS)
function showToast(message: string) {
	toast.set(message)
	hideToast()
}

export {
	clock,
	timeLabel,
	dateLabel,
	minuteOfDay,
	startClock,
	wifi,
	bluetooth,
	nightLight,
	doNotDisturb,
	showRemote,
	networkFail,
	volume,
	setVolume,
	PIN_MASK,
	pin,
	documentText,
	dateText,
	catalog,
	query,
	normalizedQuery,
	genres,
	SORT_KEYS,
	sorter,
	matchesQuery,
	keyboard,
	remoteUi,
	playing,
	position,
	isPlaying,
	playbackProgress,
	playTitle,
	playChannel,
	startPlayback,
	toast,
	showToast,
}
export type { TPlaying, TSortKey }
