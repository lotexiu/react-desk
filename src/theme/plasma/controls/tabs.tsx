import { useEffect, useRef } from 'react'
import { usePart, useReactive } from '@lotexiu/react'
import type { Tabs as HeadlessTabs } from '@lotexiu/typescript'
import type { TTabsProps } from '../../contract'
import { usePlasmaTokens } from '../use-plasma-tokens'

function Tab({ control, tabKey, label }: { control: HeadlessTabs<unknown, string>; tabKey: string; label: string }) {
	const { control: tokens, motion } = usePlasmaTokens()
	const tab = usePart(() => control.parts.tab(tabKey), [control, tabKey])
	const active = useReactive(control.navigation.active)
	const element = useRef<HTMLDivElement>(null)
	const selected = tab['aria-selected'] === 'true'
	useEffect(() => {
		if (active === tabKey && element.current?.parentElement?.contains(document.activeElement)) element.current.focus()
	}, [active, tabKey])
	return (
		<div
			{...tab}
			ref={element}
			className="plasma-focusable"
			onClick={() => control.choose(tabKey)}
			style={{ padding: '6px 14px', cursor: 'pointer', borderBottom: `2px solid ${selected ? tokens.accent : 'transparent'}`, color: selected ? 'inherit' : tokens.muted, transition: `border-color ${motion.duration} ${motion.easing}` }}
		>
			{label}
		</div>
	)
}

function Tabs({ control, label, children }: TTabsProps) {
	const { control: tokens } = usePlasmaTokens()
	const list = usePart(() => control.parts.list(), [control])
	const entries = useReactive(control.collection.entries)
	const selected = useReactive(control.selected)
	const panel = usePart(() => (selected === undefined ? {} : control.parts.panel(selected)), [control, selected])
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
			<div {...list} aria-label={label} onKeyDown={control.keydown} style={{ display: 'flex', borderBottom: tokens.border }}>
				{entries.map((entry) => (
					<Tab key={entry.key} control={control} tabKey={entry.key} label={entry.label} />
				))}
			</div>
			<div {...panel} style={{ minHeight: 0 }}>
				{selected === undefined ? null : children}
			</div>
		</div>
	)
}

export { Tabs }
