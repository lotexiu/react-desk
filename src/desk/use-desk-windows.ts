import { useState } from 'react'
import type { TDeskTask, TWindowFrame } from '../theme/contract'

type TDeskWindow = {
	readonly id: string
	readonly title: string
	readonly frame: TWindowFrame
	readonly open: boolean
	readonly minimized: boolean
	readonly maximized: boolean
}

function useDeskWindows(initialWindows: readonly TDeskWindow[]) {
	const [windows, setWindows] = useState(initialWindows)
	const [stacking, setStacking] = useState(() => initialWindows.map((deskWindow) => deskWindow.id))

	const visibleWindows = windows.filter((deskWindow) => deskWindow.open && !deskWindow.minimized)
	const activeId = stacking.findLast((id) => visibleWindows.some((deskWindow) => deskWindow.id === id))

	const update = (id: string, changes: Partial<TDeskWindow>) => {
		setWindows((current) => current.map((deskWindow) => (deskWindow.id === id ? { ...deskWindow, ...changes } : deskWindow)))
	}

	const focus = (id: string) => {
		update(id, { open: true, minimized: false })
		setStacking((current) => [...current.filter((stackedId) => stackedId !== id), id])
	}

	const selectTask = (id: string) => {
		if (id === activeId) update(id, { minimized: true })
		else focus(id)
	}

	const tasks: TDeskTask[] = windows
		.filter((deskWindow) => deskWindow.open)
		.map((deskWindow) => ({ id: deskWindow.id, title: deskWindow.title, active: deskWindow.id === activeId, minimized: deskWindow.minimized }))

	return {
		visibleWindows,
		activeId,
		tasks,
		layerOf: (id: string) => stacking.indexOf(id) + 1,
		focus,
		selectTask,
		move: (id: string, frame: TWindowFrame) => update(id, { frame }),
		minimize: (id: string) => update(id, { minimized: true }),
		toggleMaximize: (id: string) => {
			const target = windows.find((deskWindow) => deskWindow.id === id)
			update(id, { maximized: !target?.maximized })
		},
		close: (id: string) => update(id, { open: false, maximized: false }),
	}
}

export { useDeskWindows }
export type { TDeskWindow }
