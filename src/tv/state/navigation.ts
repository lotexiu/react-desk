import { activeIndex, computed, Signal, signal } from '@lotexiu/typescript'
import type { TActiveIndex } from '@lotexiu/typescript'
import { HERO_IDS, TITLES } from '../mocks/content'
import type { TApp, TChannel, TTitle } from '../mocks/content'
import { rowsFor } from './rows'
import type { THeroAction, TRow, TSectionId } from './rows'
import type { TSortKey } from './system'
import { catalog, genres, normalizedQuery, playChannel, playTitle, showToast, sorter } from './system'

type TZone = 'nav' | 'content'
type TOverlay = Readonly<{ kind: 'settings' }> | Readonly<{ kind: 'details'; titleId: string }>
type TNavItem = Readonly<{ id: TSectionId | 'search' | 'settings'; label: string; icon: string }>

const NAV_ITEMS: readonly TNavItem[] = [
	{ id: 'home', label: 'Início', icon: 'home' },
	{ id: 'search', label: 'Buscar', icon: 'search' },
	{ id: 'movies', label: 'Filmes e séries', icon: 'film' },
	{ id: 'live', label: 'Ao vivo', icon: 'tv' },
	{ id: 'apps', label: 'Apps', icon: 'apps' },
	{ id: 'settings', label: 'Ajustes', icon: 'sliders' },
]

const zone = signal<TZone>('content')
const section = signal<TSectionId>('home')
const overlay = signal<TOverlay | null>(null)

const rows = computed<TRow[]>(() => {
	const data = catalog.data()
	if (data === undefined) return []
	return rowsFor({ section: section(), query: normalizedQuery(), genres: genres(), catalog: data, sortKey: sorter.key(), sortDirection: sorter.direction() })
})

// em TV o foco para nas pontas (← no começo da linha sai para o menu, não dá a volta)
const STOP_AT_ENDS = { wrap: false }
const navIndex = activeIndex(computed(() => NAV_ITEMS.length), STOP_AT_ENDS)
const rowIndex = activeIndex(computed(() => rows().length), STOP_AT_ENDS)
const heroIndex = activeIndex(computed(() => HERO_IDS.length))
navIndex.set(0)
rowIndex.set(0)
heroIndex.set(0)

/** Cada linha lembra a própria coluna; o comprimento acompanha filtros e busca. */
const columns = new Map<string, TActiveIndex>()
function columnOf(rowId: string): TActiveIndex {
	let column = columns.get(rowId)
	if (column === undefined) {
		column = activeIndex(computed(() => rows().find((row) => row.id === rowId)?.items.length ?? 0), STOP_AT_ENDS)
		column.set(0)
		columns.set(rowId, column)
	}
	return column
}

const currentRow = () => rows()[rowIndex()]
const heroTitle = () => TITLES.find((t) => t.id === HERO_IDS[heroIndex()]) ?? TITLES[0]

function selectSection(id: TSectionId) {
	Signal.batch(() => {
		section.set(id)
		rowIndex.set(0)
		zone.set('content')
	})
}

function moveRow(delta: number) {
	rowIndex.update((value) => value + delta)
}

function moveColumn(delta: number) {
	const row = currentRow()
	if (row === undefined) return
	const column = columnOf(row.id)
	if (delta < 0 && column() === 0) {
		zone.set('nav')
		return
	}
	column.update((value) => value + delta)
}

function focusAt(rowId: string, col: number) {
	const index = rows().findIndex((row) => row.id === rowId)
	if (index < 0) return
	Signal.batch(() => {
		zone.set('content')
		rowIndex.set(index)
		columnOf(rowId).set(col)
	})
}

const openDetails = (title: TTitle) => overlay.set({ kind: 'details', titleId: title.id })
const closeOverlay = () => overlay.set(null)

function activateHero(action: THeroAction) {
	const title = heroTitle()
	if (action.id === 'play') {
		playTitle(title)
		showToast(`Reproduzindo ${title.title}`)
	} else if (action.id === 'list') showToast(`${title.title} adicionado à sua lista`)
	else openDetails(title)
}

function activateApp(app: TApp) {
	showToast(`Abrindo ${app.name}…`)
}

function activateChannel(channel: TChannel) {
	playChannel(channel)
	showToast(`Sintonizado em ${channel.name}`)
}

function activateNav(item: TNavItem) {
	if (item.id === 'settings') overlay.set({ kind: 'settings' })
	else if (item.id === 'search') document.getElementById('tv-search')?.focus()
	else selectSection(item.id)
}

function activateItem(row: TRow, col: number) {
	switch (row.kind) {
		case 'hero':
			return activateHero(row.items[col])
		case 'chips':
			return row.id === 'sort' ? sorter.toggle(row.items[col] as TSortKey) : genres.toggle(row.items[col])
		case 'wide':
		case 'poster':
			return openDetails(row.items[col])
		case 'apps':
			return activateApp(row.items[col])
		case 'live':
			return activateChannel(row.items[col])
	}
}

function retryCatalog() {
	catalog.run()
}

function activateFocused() {
	if (zone() === 'nav') return activateNav(NAV_ITEMS[navIndex()])
	if (rows().length === 0 && catalog.error() !== undefined) return retryCatalog()
	const row = currentRow()
	if (row !== undefined) activateItem(row, columnOf(row.id)())
}

export {
	NAV_ITEMS,
	zone,
	section,
	overlay,
	rows,
	navIndex,
	rowIndex,
	heroIndex,
	columnOf,
	heroTitle,
	selectSection,
	moveRow,
	moveColumn,
	focusAt,
	openDetails,
	closeOverlay,
	activateHero,
	activateItem,
	activateNav,
	activateFocused,
	retryCatalog,
}
export type { TZone, TOverlay, TNavItem }
