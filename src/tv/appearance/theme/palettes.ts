import { PaletteFactory, PALETTES } from '@lotexiu/typescript'

const SECONDARY_HUE_SHIFT = 48
const TERTIARY_HUE_SHIFT = 110

/** A primária com que o app abre. */
const DEFAULT_PICK = { group: 'Basic', index: 6 } as const

/**
 * De UMA cor (a que o usuário escolhe) saem as cinco paletas que os papéis de `roles.ts` citam. A
 * interface lê `APP_PALETTES.seeds` para saber o que oferecer; trocar a factory muda isso sozinho.
 */
const APP_PALETTES = new PaletteFactory({
	seeds: {
		brand: { label: 'Cor principal', default: PALETTES[DEFAULT_PICK.group][DEFAULT_PICK.index] },
	},
	palettes: {
		primary: ({ seeds }) => seeds.brand,
		secondary: ({ seeds }) =>
			seeds.brand.derive({ hueShift: SECONDARY_HUE_SHIFT, chromaScale: 0.7, name: 'secondary' }),
		tertiary: ({ seeds }) =>
			seeds.brand.derive({ hueShift: TERTIARY_HUE_SHIFT, chromaScale: 0.8, name: 'tertiary' }),
		neutral: ({ seeds }) => seeds.brand.neutral(undefined, 'neutral'),
		error: () => PALETTES.Basic[12],
	},
})

type TPaletteId = keyof ReturnType<typeof APP_PALETTES.build>

/**
 * Padrão de todo estilo do app: o que cada id usa enquanto ninguém atribui outra paleta (a factory
 * com as seeds padrão).
 */
const DEFAULT_PALETTES = APP_PALETTES.build()

export { APP_PALETTES, DEFAULT_PICK, DEFAULT_PALETTES }
export type { TPaletteId }
