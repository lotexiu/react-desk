import { KeyboardState, uiInteraction } from '@lotexiu/typescript'

// --- teclado / controle remoto ---------------------------------------------------------------
const keyboard = new KeyboardState<string>()
const remoteUi = uiInteraction()

export { keyboard, remoteUi }
