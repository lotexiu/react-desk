import { useReactive } from '@lotexiu/react'
import { computed, Dialog, Listbox, Menu, Pagination, signal, Tabs } from '@lotexiu/typescript'
import { theme } from '../theme/service'

type TFileKind = 'documents' | 'images' | 'music'

type TFile = {
	readonly value: string
	readonly label: string
	readonly kind: TFileKind
}

const PAGE_SIZE = 5

const INITIAL_FILES: readonly TFile[] = [
	...['Relatório anual', 'Contrato', 'Ata da reunião', 'Proposta comercial', 'Currículo', 'Notas fiscais', 'Planejamento 2027', 'Manual do produto'].map((label, index) => ({ value: `document-${index}`, label: `${label}.pdf`, kind: 'documents' as const })),
	...['Praia', 'Montanha', 'Aniversário', 'Pôr do sol', 'Família'].map((label, index) => ({ value: `image-${index}`, label: `${label}.jpg`, kind: 'images' as const })),
	...['Abertura', 'Tema principal', 'Encerramento'].map((label, index) => ({ value: `music-${index}`, label: `${label}.ogg`, kind: 'music' as const })),
]

const files = signal<readonly TFile[]>(INITIAL_FILES)
let createdCount = 0

const sections = new Tabs({
	id: 'files-sections',
	items: [
		{ value: 'documents', label: 'Documentos' },
		{ value: 'images', label: 'Imagens' },
		{ value: 'music', label: 'Músicas' },
	],
})

const visibleFiles = computed(() => files().filter((file) => file.kind === sections.selected()))
const pages = new Pagination({ id: 'files-pages', total: computed(() => visibleFiles().length), pageSize: PAGE_SIZE })
const pageFiles = computed(() => visibleFiles().slice(pages.start(), pages.end()))
const list = new Listbox({ id: 'files-list', items: pageFiles, selectionMode: 'multiple' })
const confirmDelete = new Dialog({ id: 'files-confirm', role: 'alertdialog' })

sections.value.subscribe(() => {
	pages.set(1)
	list.clearSelection()
})

const actionItems = computed(() => [
	{ value: 'create', label: 'Novo arquivo' },
	{ value: 'duplicate', label: 'Duplicar', disabled: list.value().length === 0 },
	{ value: 'delete', label: 'Excluir…', disabled: list.value().length === 0 },
])

const actions = new Menu({
	id: 'files-actions',
	items: actionItems,
	onAction: (action) => {
		const selected = list.value()
		if (action === 'create') {
			createdCount += 1
			const kind = sections.selected() as TFileKind
			files.set([...files(), { value: `created-${createdCount}`, label: `Novo arquivo ${createdCount}`, kind }])
			pages.last()
		}
		if (action === 'duplicate') {
			const copies = files().filter((file) => selected.includes(file.value)).map((file) => ({ ...file, value: `${file.value}-copy-${++createdCount}`, label: `${file.label} (cópia)` }))
			files.set([...files(), ...copies])
		}
		if (action === 'delete') confirmDelete.show()
	},
})

function deleteSelected() {
	const selected = list.value()
	files.set(files().filter((file) => !selected.includes(file.value)))
	list.clearSelection()
	confirmDelete.hide()
}

function FilesWindow() {
	const { Menu: MenuView, Tabs: TabsView, Listbox: ListboxView, Pagination: PaginationView, Dialog: DialogView, Button } = useReactive(theme.components)
	const selectedCount = useReactive(list.value).length
	const visibleCount = useReactive(visibleFiles).length

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<MenuView control={actions} label="Arquivo" />
				<span style={{ opacity: 0.75 }}>{selectedCount === 0 ? `${visibleCount} itens` : `${selectedCount} selecionado(s)`}</span>
			</div>
			<TabsView control={sections} label="Seções">
				<ListboxView control={list} label="Arquivos" />
			</TabsView>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<PaginationView control={pages} label="Páginas" />
			</div>
			<DialogView
				control={confirmDelete}
				title="Excluir arquivos?"
				description={`${selectedCount} arquivo(s) serão removidos. Isso não pode ser desfeito.`}
				actions={
					<>
						<Button onPress={confirmDelete.hide}>Cancelar</Button>
						<Button tone="danger" onPress={deleteSelected}>
							Excluir
						</Button>
					</>
				}
			/>
		</div>
	)
}

export { FilesWindow }
