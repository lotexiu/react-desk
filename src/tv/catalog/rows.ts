import { ArrayUtils, ChunkUtils, StringUtils } from '@lotexiu/typescript'
import { APPS, CHANNELS, GENRES } from './mock-content'
import type { TApp, TChannel, TTitle } from './mock-content'
import { matchesQuery, SORT_KEYS } from './catalog'
import type { TSortKey } from './catalog'
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

const byRatingDesc = (titles: readonly TTitle[]) =>
	ArrayUtils.sortBy(titles, { key: (title) => title.rating, order: 'desc' })

const SORT_SELECTORS: Record<TSortKey, (title: TTitle) => string | number> = {
	Nota: (title) => title.rating,
	Ano: (title) => title.year,
	Título: (title) => title.title,
}

type TRowsInput = Readonly<{
	section: TSectionId
	query: string
	genres: readonly string[]
	catalog: readonly TTitle[]
	sortKey: TSortKey | undefined
	sortDirection: TSortDirection
}>

function rowsFor({
	section,
	query,
	genres: selected,
	catalog,
	sortKey,
	sortDirection,
}: TRowsInput): TRow[] {
	const titles = catalog.filter(
		(title) =>
			matchesQuery(title, query) &&
			(selected.length === 0 || selected.some((genre) => title.genres.includes(genre)))
	)
	const channels = CHANNELS.filter(
		(channel) =>
			query === '' ||
			StringUtils.noAccent(`${channel.name} ${channel.category}`).toLowerCase().includes(query)
	)
	const apps = APPS.filter(
		(appItem) => query === '' || StringUtils.noAccent(appItem.name).toLowerCase().includes(query)
	)
	const chips: TRow = { id: 'chips', title: 'Gêneros', kind: 'chips', items: GENRES }
	const sortChips: TRow = { id: 'sort', title: 'Ordenar por', kind: 'chips', items: SORT_KEYS }
	const sorted = sortKey
		? ArrayUtils.sortBy(titles, {
				key: SORT_SELECTORS[sortKey],
				order: sortDirection === 'ASC' ? 'asc' : 'desc',
			})
		: titles

	const rows: TRow[] = []
	switch (section) {
		case 'home':
			if (query === '')
				rows.push({ id: 'hero', title: 'Destaque', kind: 'hero', items: HERO_ACTIONS })
			rows.push(chips)
			rows.push({
				id: 'continue',
				title: 'Continue assistindo',
				kind: 'wide',
				items: titles.filter((title) => title.progress !== undefined),
			})
			rows.push({
				id: 'trending',
				title: 'Em alta no Brasil',
				kind: 'poster',
				items: byRatingDesc(titles),
			})
			rows.push({ id: 'live', title: 'Ao vivo agora', kind: 'live', items: channels })
			rows.push({ id: 'apps', title: 'Seus apps', kind: 'apps', items: apps })
			rows.push({
				id: 'foryou',
				title: 'Escolhidos para você',
				kind: 'poster',
				items: ArrayUtils.sortBy(titles, { key: (title) => title.year, order: 'desc' }),
			})
			break
		case 'movies': {
			rows.push(chips, sortChips)
			const byGenre = ArrayUtils.groupBy(sorted, (title) => title.genres[0])
			for (const [genre, items] of Object.entries(byGenre))
				rows.push({ id: `genre-${genre}`, title: genre, kind: 'poster', items })
			break
		}
		case 'live': {
			const byCategory = ArrayUtils.groupBy(channels, (channel) => channel.category)
			rows.push({ id: 'live-all', title: 'Todos os canais', kind: 'live', items: channels })
			for (const [category, items] of Object.entries(byCategory))
				rows.push({ id: `cat-${category}`, title: category, kind: 'live', items })
			break
		}
		case 'apps':
			ChunkUtils.bySize(apps, APPS_PER_ROW).forEach((items, index) =>
				rows.push({
					id: `apps-${index}`,
					title: index === 0 ? 'Seus apps' : 'Mais apps',
					kind: 'apps',
					items,
				})
			)
			break
	}
	return rows.filter((row) => row.items.length > 0)
}

export { rowsFor, HERO_ACTIONS }
export type { TRow, TSectionId, THeroAction }
