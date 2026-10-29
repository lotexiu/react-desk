import { MathUtils } from '@lotexiu/typescript'

/** Dados fictícios — nenhum título, app ou canal aqui existe de verdade. */

type TTitle = Readonly<{
	id: string
	title: string
	kind: 'Filme' | 'Série'
	year: number
	genres: readonly string[]
	minutes: number
	rating: number
	maturity: 'L' | '10' | '12' | '14' | '16' | '18'
	synopsis: string
	/** Cor-semente do pôster (vira uma `TonalPalette`). */
	seed: string
	/** 0..1 — presente só nos itens de "continue assistindo". */
	progress?: number
	badge?: string
}>

const TITLES: readonly TTitle[] = [
	{
		id: 't1',
		title: 'Horizonte Perdido',
		kind: 'Filme',
		year: 2026,
		genres: ['Ficção', 'Aventura'],
		minutes: 128,
		rating: 8.7,
		maturity: '12',
		synopsis:
			'Uma engenheira de satélites descobre que o sinal que ela recebe vem de um lugar que não existe nos mapas — e que alguém quer que continue assim.',
		seed: '#1a8cff',
		badge: '4K HDR',
	},
	{
		id: 't2',
		title: 'Código Aurora',
		kind: 'Série',
		year: 2025,
		genres: ['Suspense', 'Ficção'],
		minutes: 52,
		rating: 8.4,
		maturity: '14',
		synopsis:
			'Três hackers acordam numa cidade onde cada tela mostra a mesma contagem regressiva. Ninguém sabe o que acontece no zero.',
		seed: '#bf00ff',
		progress: 0.62,
		badge: 'Novo episódio',
	},
	{
		id: 't3',
		title: 'Noites de Néon',
		kind: 'Filme',
		year: 2024,
		genres: ['Drama', 'Romance'],
		minutes: 109,
		rating: 7.9,
		maturity: '16',
		synopsis:
			'Em uma metrópole que nunca apaga as luzes, dois desconhecidos trocam mensagens em painéis publicitários.',
		seed: '#ff2d78',
		progress: 0.35,
	},
	{
		id: 't4',
		title: 'O Último Farol',
		kind: 'Filme',
		year: 2023,
		genres: ['Suspense', 'Drama'],
		minutes: 117,
		rating: 8.1,
		maturity: '14',
		synopsis:
			'O faroleiro de uma ilha esquecida começa a receber cartas de navios que naufragaram há cinquenta anos.',
		seed: '#c46200',
	},
	{
		id: 't5',
		title: 'Rota 66 Sul',
		kind: 'Série',
		year: 2026,
		genres: ['Aventura', 'Comédia'],
		minutes: 41,
		rating: 7.6,
		maturity: '12',
		synopsis: 'Uma van, quatro amigos e um mapa rasgado: a viagem mais desastrosa do continente.',
		seed: '#c1440e',
		progress: 0.88,
	},
	{
		id: 't6',
		title: 'Jardim de Vidro',
		kind: 'Série',
		year: 2025,
		genres: ['Drama', 'Mistério'],
		minutes: 58,
		rating: 8.9,
		maturity: '16',
		synopsis:
			'Uma botânica herda uma estufa onde as plantas parecem lembrar de tudo o que já foi dito perto delas.',
		seed: '#2ab88a',
		badge: 'Premiada',
	},
	{
		id: 't7',
		title: 'Maré Alta',
		kind: 'Filme',
		year: 2022,
		genres: ['Aventura', 'Família'],
		minutes: 96,
		rating: 7.4,
		maturity: 'L',
		synopsis:
			'Quando o mar recua mais que o normal, duas crianças descobrem uma cidade inteira esperando para ser lembrada.',
		seed: '#0077b6',
	},
	{
		id: 't8',
		title: 'Cidade Submersa',
		kind: 'Série',
		year: 2024,
		genres: ['Ficção', 'Suspense'],
		minutes: 47,
		rating: 8.2,
		maturity: '14',
		synopsis:
			'Em 2090, o último distrito seco do planeta fecha as comportas. Do lado de fora, alguém bate.',
		seed: '#0d2b6b',
		progress: 0.12,
	},
	{
		id: 't9',
		title: 'Pulso',
		kind: 'Filme',
		year: 2026,
		genres: ['Ação', 'Suspense'],
		minutes: 112,
		rating: 7.8,
		maturity: '16',
		synopsis:
			'Uma paramédica tem 90 minutos para atravessar uma cidade em blecaute com um coração em um cooler.',
		seed: '#ff1a1a',
		badge: 'Novo',
	},
	{
		id: 't10',
		title: 'Estação Zero',
		kind: 'Série',
		year: 2025,
		genres: ['Ficção', 'Ação'],
		minutes: 49,
		rating: 8.0,
		maturity: '14',
		synopsis:
			'A tripulação de uma estação orbital perde contato com a Terra — e começa a receber instruções de si mesma.',
		seed: '#6a21c4',
	},
	{
		id: 't11',
		title: 'Fronteira Azul',
		kind: 'Filme',
		year: 2023,
		genres: ['Drama', 'Aventura'],
		minutes: 134,
		rating: 8.5,
		maturity: '12',
		synopsis:
			'Dois irmãos atravessam um deserto de sal para encontrar o pai que ninguém mais acredita estar vivo.',
		seed: '#5ecfb1',
	},
	{
		id: 't12',
		title: 'Sombras de Cristal',
		kind: 'Filme',
		year: 2021,
		genres: ['Mistério', 'Suspense'],
		minutes: 101,
		rating: 7.2,
		maturity: '16',
		synopsis:
			'Um restaurador de espelhos antigos nota que os reflexos chegam sempre um segundo atrasados.',
		seed: '#a78fdb',
	},
	{
		id: 't13',
		title: 'Festa no Terraço',
		kind: 'Série',
		year: 2026,
		genres: ['Comédia', 'Romance'],
		minutes: 28,
		rating: 7.1,
		maturity: '12',
		synopsis: 'Seis vizinhos, um prédio com elevador quebrado e uma festa que nunca termina.',
		seed: '#f5c542',
		badge: 'Novo',
	},
	{
		id: 't14',
		title: 'Linha do Tempo',
		kind: 'Filme',
		year: 2025,
		genres: ['Ficção', 'Romance'],
		minutes: 123,
		rating: 8.3,
		maturity: '12',
		synopsis: 'Ela vive de trás para frente. Ele, de frente para trás. Só se cruzam uma vez.',
		seed: '#f28b9f',
		progress: 0.5,
	},
]

const GENRES: readonly string[] = Array.from(
	new Set(TITLES.flatMap((title) => title.genres))
).sort()

/** Os destaques do banner — referenciam `TITLES` por id. */
const HERO_IDS: readonly string[] = ['t1', 't6', 't9', 't2']

type TApp = Readonly<{ id: string; name: string; seed: string; glyph: string }>

const APPS: readonly TApp[] = [
	{ id: 'a1', name: 'Streamix', seed: '#ff2d78', glyph: 'S' },
	{ id: 'a2', name: 'MusicWave', seed: '#39ff14', glyph: '♪' },
	{ id: 'a3', name: 'Arcadia', seed: '#bf00ff', glyph: '◆' },
	{ id: 'a4', name: 'Tubo', seed: '#ff1a1a', glyph: '▶' },
	{ id: 'a5', name: 'CineMax', seed: '#1a8cff', glyph: 'C' },
	{ id: 'a6', name: 'Fit TV', seed: '#ff6600', glyph: '✚' },
	{ id: 'a7', name: 'Clima', seed: '#00f5ff', glyph: '☀' },
	{ id: 'a8', name: 'Galeria', seed: '#ffe800', glyph: '▣' },
	{ id: 'a9', name: 'Navegador', seed: '#0047ab', glyph: '◉' },
	{ id: 'a10', name: 'Karaokê', seed: '#ff00cc', glyph: '♫' },
	{ id: 'a11', name: 'Notícias 24', seed: '#b5174f', glyph: 'N' },
	{ id: 'a12', name: 'Espelhar', seed: '#2ab88a', glyph: '⇄' },
]

type TProgram = Readonly<{ title: string; startMinute: number; minutes: number }>
type TChannel = Readonly<{
	id: string
	number: number
	name: string
	category: string
	seed: string
	programs: readonly TProgram[]
}>

/** Grade de 24h repetida por canal — `programAt` descobre o que está no ar pelo relógio. */
function dayOf(titles: readonly string[], minutes: number): TProgram[] {
	return titles.map((title, index) => ({ title, startMinute: index * minutes, minutes }))
}

const CHANNELS: readonly TChannel[] = [
	{
		id: 'c1',
		number: 2,
		name: 'Aurora HD',
		category: 'Variedades',
		seed: '#ff6600',
		programs: dayOf(
			[
				'Bom Dia Aurora',
				'Culinária Express',
				'Aurora Notícias',
				'Tarde Premiada',
				'Novela das Sete',
				'Jornal da Noite',
				'Cine Aurora',
				'Madrugada Musical',
			],
			180
		),
	},
	{
		id: 'c2',
		number: 5,
		name: 'Esporte Total',
		category: 'Esportes',
		seed: '#39ff14',
		programs: dayOf(
			[
				'Mesa Redonda',
				'Futebol Ao Vivo',
				'Basquete Sul',
				'Zona de Treino',
				'Melhores Momentos',
				'Rodada Final',
			],
			240
		),
	},
	{
		id: 'c3',
		number: 8,
		name: 'Mundo Natural',
		category: 'Documentários',
		seed: '#2d6a2d',
		programs: dayOf(
			[
				'Planeta Vivo',
				'Oceanos Profundos',
				'Vida Selvagem',
				'Montanhas',
				'Noite no Deserto',
				'Aves do Sul',
			],
			240
		),
	},
	{
		id: 'c4',
		number: 11,
		name: 'Mirim TV',
		category: 'Infantil',
		seed: '#f5c542',
		programs: dayOf(
			[
				'Turma do Bosque',
				'Mini Cientistas',
				'Aventuras no Mar',
				'Hora da Música',
				'Contos de Boa Noite',
			],
			288
		),
	},
	{
		id: 'c5',
		number: 14,
		name: 'Notícias 24h',
		category: 'Notícias',
		seed: '#b5174f',
		programs: dayOf(
			['Manhã em Foco', 'Economia Hoje', 'Plantão', 'Debate', 'Mundo em 30 min', 'Edição Final'],
			240
		),
	},
	{
		id: 'c6',
		number: 21,
		name: 'Cine Clássico',
		category: 'Filmes',
		seed: '#7b2d8b',
		programs: dayOf(
			[
				'A Dama de Branco',
				'Sessão Faroeste',
				'Noite de Gala',
				'Cinema Mudo',
				'Clássicos do Terror',
			],
			288
		),
	},
	{
		id: 'c7',
		number: 27,
		name: 'Beat FM TV',
		category: 'Música',
		seed: '#ff00cc',
		programs: dayOf(
			['Top 20', 'Acústico', 'Hits do Verão', 'DJ Set', 'Rock Nacional', 'Madrugada Lo-fi'],
			240
		),
	},
	{
		id: 'c8',
		number: 33,
		name: 'Gourmet+',
		category: 'Culinária',
		seed: '#c1440e',
		programs: dayOf(
			['Mesa Posta', 'Cozinha de Rua', 'Padaria Artesanal', 'Chef Desafio', 'Doces do Mundo'],
			288
		),
	},
]

const MINUTES_PER_DAY = 1440

/** Programa no ar em `minuteOfDay`, com o quanto dele já passou (0..1). */
function programAt(channel: TChannel, minuteOfDay: number) {
	const program =
		channel.programs.find(
			(scheduledProgram) =>
				minuteOfDay >= scheduledProgram.startMinute &&
				minuteOfDay < scheduledProgram.startMinute + scheduledProgram.minutes
		) ?? channel.programs[channel.programs.length - 1]
	const elapsed = (minuteOfDay - program.startMinute) / program.minutes
	return {
		program,
		progress: MathUtils.clamp(elapsed, 0, 1),
		next: channel.programs[(channel.programs.indexOf(program) + 1) % channel.programs.length],
	}
}

const NOTIFICATIONS = 3
const WEATHER = { city: 'São Paulo', temp: 26, label: 'Parcialmente nublado' }

export {
	TITLES,
	GENRES,
	HERO_IDS,
	APPS,
	CHANNELS,
	MINUTES_PER_DAY,
	NOTIFICATIONS,
	WEATHER,
	programAt,
}
export type { TTitle, TApp, TChannel }
