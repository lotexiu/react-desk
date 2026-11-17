import { computed, Form, Select, Slider, Switch, writable } from '@lotexiu/typescript'
import type { TAdjustmentDefinitions, TControlValues } from '@lotexiu/typescript'
import { theme } from '../theme/service'
import { DESK_STYLE_LABELS, DESK_STYLES } from '../theme/styles'

const CONTRAST_RANGE = { min: -1, max: 1, step: 0.1 }

const darkMode = new Switch({
	id: 'dark-mode',
	value: writable(
		() => theme.mode() === 'dark',
		(dark) => theme.mode.set(dark ? 'dark' : 'light')
	),
})

const styleChoice = new Select({
	id: 'desk-style',
	items: Object.keys(DESK_STYLES),
	label: (id: string) => DESK_STYLE_LABELS[id] ?? id,
	value: writable(
		() => Object.keys(DESK_STYLES).find((id) => DESK_STYLES[id] === theme.style()),
		(id) => {
			if (id !== undefined) theme.style.set(DESK_STYLES[id])
		}
	),
})

const contrast = new Slider({
	id: 'contrast',
	...CONTRAST_RANGE,
	value: theme.contrast,
	format: (value) => value.toFixed(1),
})

const adjustmentsForm = computed(
	() =>
		new Form({
			id: 'adjustments',
			definitions: theme.style().adjustments,
			values: writable(
				() => theme.activeAdjustments() as TControlValues<TAdjustmentDefinitions>,
				(values) => theme.setAdjustments(values)
			),
		})
)

export { darkMode, styleChoice, contrast, adjustmentsForm }
