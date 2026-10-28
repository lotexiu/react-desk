import { MouseState } from '@lotexiu/typescript'

const mouse = new MouseState<number>()

/**
 * Alimenta o `MouseState` com o ponteiro e espelha a posição em `--mx`/`--my` do elemento,
 * direto no DOM — sem passar pelo React, já que muda a cada movimento.
 */
function bindPointer(element: HTMLElement): () => void {
	const onMove = (event: PointerEvent) => mouse.move(event.clientX, event.clientY)
	const onDown = (event: PointerEvent) => mouse.press(event.button)
	const onUp = (event: PointerEvent) => mouse.release(event.button)
	const onLeave = () => {
		element.style.removeProperty('--mx')
		element.style.removeProperty('--my')
		mouse.reset()
	}
	const stop = mouse.position.subscribe(({ x, y }) => {
		element.style.setProperty('--mx', `${x}px`)
		element.style.setProperty('--my', `${y}px`)
	})
	window.addEventListener('pointermove', onMove)
	window.addEventListener('pointerdown', onDown)
	window.addEventListener('pointerup', onUp)
	document.addEventListener('pointerleave', onLeave)
	return () => {
		stop()
		window.removeEventListener('pointermove', onMove)
		window.removeEventListener('pointerdown', onDown)
		window.removeEventListener('pointerup', onUp)
		document.removeEventListener('pointerleave', onLeave)
	}
}

export { mouse, bindPointer }
