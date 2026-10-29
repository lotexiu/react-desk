import {
	AsyncUtils,
	computed,
	debouncedValue,
	selection,
	sort,
	StringUtils,
	task,
} from '@lotexiu/typescript'
import { networkFail } from '../system/settings'
import { TITLES } from './mock-content'
import type { TTitle } from './mock-content'

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

function matchesQuery(title: TTitle, query: string): boolean {
	if (query === '') return true
	return fold(`${title.title} ${title.genres.join(' ')} ${title.synopsis}`).includes(query)
}

export { catalog, query, normalizedQuery, genres, SORT_KEYS, sorter, matchesQuery }
export type { TSortKey }
