import { VISUAL_STYLE_LIST } from '../theme/visual-styles'
import { appearance } from './appearance'
import { activateFocused, closeOverlay, heroIndex, moveColumn, moveRow, navIndex, overlay, zone } from './navigation'
import { keyboard, remoteUi } from './system'

const isTextField = (target: EventTarget | null) => target instanceof HTMLInputElement && target.type === 'text'

const DIGIT_KEY = /^Digit([1-9])$/

/** Atalhos globais: `T` troca o modo, `1`–`7` o estilo, `M` abre ajustes, `Z`/`Y` desfazem/refazem. */
function globalShortcut(code: string): boolean {
	const digit = DIGIT_KEY.exec(code)
	if (digit) {
		const style = VISUAL_STYLE_LIST[Number(digit[1]) - 1]
		if (style === undefined) return false
		appearance.chooseStyle(style.id)
		return true
	}
	switch (code) {
		case 'KeyT':
			appearance.toggleMode()
			return true
		case 'KeyM':
			overlay.set({ kind: 'settings' })
			return true
		case 'KeyZ':
			appearance.undo()
			return true
		case 'KeyY':
			appearance.redo()
			return true
		default:
			return false
	}
}

function navigate(code: string): boolean {
	const inNav = zone() === 'nav'
	switch (code) {
		case 'ArrowUp':
			if (inNav) navIndex.update((value) => value - 1)
			else moveRow(-1)
			return true
		case 'ArrowDown':
			if (inNav) navIndex.update((value) => value + 1)
			else moveRow(1)
			return true
		case 'ArrowLeft':
			if (!inNav) moveColumn(-1)
			return true
		case 'ArrowRight':
			if (inNav) zone.set('content')
			else moveColumn(1)
			return true
		case 'Enter':
		case 'NumpadEnter':
			activateFocused()
			return true
		case 'BracketRight':
			heroIndex.next()
			return true
		case 'BracketLeft':
			heroIndex.prev()
			return true
		default:
			return false
	}
}

function onKeyDown(event: KeyboardEvent) {
	keyboard.press(event.code)
	if (event.code === 'Enter') remoteUi.active()
	if (event.ctrlKey || event.metaKey || event.altKey) return

	if (isTextField(event.target)) {
		if (event.code === 'Escape' || event.code === 'ArrowDown') (event.target as HTMLElement).blur()
		return
	}
	if (overlay() !== null) {
		if (event.code === 'Escape' || event.code === 'Backspace') {
			closeOverlay()
			event.preventDefault()
		}
		return // as setas dentro do painel são tratadas por ele mesmo
	}
	if (globalShortcut(event.code) || navigate(event.code)) event.preventDefault()
}

function onKeyUp(event: KeyboardEvent) {
	keyboard.release(event.code)
	if (event.code === 'Enter') remoteUi.unactive()
}

/** Perdeu o foco da janela: solta tudo, senão a tecla "fica presa" no HUD. */
function onBlur() {
	keyboard.reset()
	remoteUi.unactive()
}

export { onKeyDown, onKeyUp, onBlur }
