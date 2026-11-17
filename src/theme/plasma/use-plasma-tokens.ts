import { useReactive } from '@lotexiu/react'
import { theme } from '../service'
import type { TPlasmaTokens } from './tokens'

function usePlasmaTokens(): TPlasmaTokens {
	return useReactive(theme.tokens) as TPlasmaTokens
}

export { usePlasmaTokens }
