import { ArrayUtils, ChunkUtils, StringUtils } from '@lotexiu/typescript'
import { APPS, CHANNELS, GENRES } from '../mocks/content'
import type { TApp, TChannel, TTitle } from '../mocks/content'
import { matchesQuery, SORT_KEYS } from './system'
import type { TSortKey } from './system'
import type { TSortDirection } from '@lotexiu/typescript'

type TSectionId = 'home' | 'movies' | 'live' | 'apps'
type THeroAction = Readonly<{ id: 'play' | 'list' | 'info'; label: string }>

type TRow =
	| Readonly<{ id: string; title: string; kind: 'hero'; items: readonly THeroAction[] }>
	| Readonly<{ id: string; title: string; kind: 'chips'; items: readonly string[] }>
	| Readonly<{ id: string; title: string; kind: 'wide' | 'poster'; items: readonly TTitle[] }>
	| Readonly<{ id: string; title: string; kind: 'apps'; items: readonly TApp[] }>
	| Readonly<{ id: string; title: string; kind: 'live'; items: readonly TChannel[] }>

const HERO_ACTIONS: readonly THeroAction[] = [
	{ id: 'play', label: 'Assistir agora' },
	{ id: 'list', label: 'Minha lista' },
	{ id: 'info', label: 'Detalhes' },
]

const APPS_PER_ROW = 6

const byRatingDesc = (titles: readonly TTitle[]) => ArrayUtils.sortBy(titles, { key: (t) => t.rating, order: 'desc' })

const SORT_SELECTORS: Record<TSortKey, (title: TTitle) => string | number> = {
	Nota: (t) => t.rating,
	Ano: (t) => t.year,
	Título: (t) => t.title,
}

type TRowsInput = Readonly<{
	section: TSectionId
	query: string
	genres: readonly string[]
	catalog: readonly TTitle[]
	sortKey: TSortKey | undefined
	sortDirection: TSortDirection
}>

function rowsFor({ section, query: q, genres: selected, catalog, sortKey, sortDirection }: TRowsInput): TRow[] {
	const titles = catalog.filter((t) => matchesQuery(t, q) && (selected.length === 0 || selected.some((g) => t.genres.includes(g))))
	const channels = CHANNELS.filter((c) => q === '' || StringUtils.noAccent(`${c.name} ${c.category}`).toLowerCase().includes(q))
	const apps = APPS.filter((a) => q === '' || StringUtils.noAccent(a.name).toLowerCase().includes(q))
	const chips: TRow = { id: 'chips', title: 'Gêneros', kind: 'chips', items: GENRES }
	const sortChips: TRow = { id: 'sort', title: 'Ordenar por', kind: 'chips', items: SORT_KEYS }
	const sorted = sortKey ? ArrayUtils.sortBy(titles, { key: SORT_SELECTORS[sortKey], order: sortDirection === 'ASC' ? 'asc' : 'desc' }) : titles

	const rows: TRow[] = []
	switch (section) {
		case 'home':
			if (q === '') rows.push({ id: 'hero', title: 'Destaque', kind: 'hero', items: HERO_ACTIONS })
			rows.push(chips)
			rows.push({ id: 'continue', title: 'Continue assistindo', kind: 'wide', items: titles.filter((t) => t.progress !== undefined) })
			rows.push({ id: 'trending', title: 'Em alta no Brasil', kind: 'poster', items: byRatingDesc(titles) })
			rows.push({ id: 'live', title: 'Ao vivo agora', kind: 'live', items: channels })
			rows.push({ id: 'apps', title: 'Seus apps', kind: 'apps', items: apps })
			rows.push({ id: 'foryou', title: 'Escolhidos para você', kind: 'poster', items: ArrayUtils.sortBy(titles, { key: (t) => t.year, order: 'desc' }) })
			break
		case 'movies': {
			rows.push(chips, sortChips)
			const byGenre = ArrayUtils.groupBy(sorted, (t) => t.genres[0])
			for (const [genre, items] of Object.entries(byGenre)) rows.push({ id: `genre-${genre}`, title: genre, kind: 'poster', items })
			break
		}
		case 'live': {
			const byCategory = ArrayUtils.groupBy(channels, (c) => c.category)
			rows.push({ id: 'live-all', title: 'Todos os canais', kind: 'live', items: channels })
			for (const [category, items] of Object.entries(byCategory)) rows.push({ id: `cat-${category}`, title: category, kind: 'live', items })
			break
		}
		case 'apps':
			ChunkUtils.bySize(apps, APPS_PER_ROW).forEach((items, i) => rows.push({ id: `apps-${i}`, title: i === 0 ? 'Seus apps' : 'Mais apps', kind: 'apps', items }))
			break
	}
	return rows.filter((row) => row.items.length > 0)
}

export { rowsFor, HERO_ACTIONS }
export type { TRow, TSectionId, THeroAction }
