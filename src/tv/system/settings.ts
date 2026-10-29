import { MathUtils, signal, toggle } from '@lotexiu/typescript'

// --- ajustes rápidos -------------------------------------------------------------------------
const wifi = toggle(true)
const bluetooth = toggle(true)
const nightLight = toggle(false)
const doNotDisturb = toggle(false)
const showRemote = toggle(true)
const networkFail = toggle(false)

const volume = signal(42)
const setVolume = (value: number) => volume.set(MathUtils.clamp(Math.round(value), 0, 100))

// --- campos de texto com máscara -------------------------------------------------------------

/** PIN do controle parental: guarda só dígitos; a máscara é só de exibição. */
const PIN_MASK = '0 0 0 0'
const pin = signal('')

/** Documento digitado (CPF ou CNPJ): o tipo é detectado pelo que foi escrito (`@lotexiu/br`). */
const documentText = signal('')

/** Data digitada (dd/mm/aaaa): `Mask.date` valida o calendário e devolve um `PlainDate`. */
const dateText = signal('')

export {
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
}
