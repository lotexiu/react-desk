import type { TTicker } from '@lotexiu/typescript'

/** Liga um `ticker` a um callback; devolve a função que desliga os dois. */
function every(source: TTicker, onTick: () => void): () => void {
	const unsubscribe = source.count.subscribe(onTick)
	source.start()
	return () => {
		source.stop()
		unsubscribe()
	}
}

export { every }
