import { useReactive } from '@lotexiu/react'
import { Checkbox, RadioGroup, Select, Slider, Switch, TextField } from '@lotexiu/typescript'
import { theme } from '../theme/service'

function FormControl({ control, label }: { control: object; label: string }) {
	const components = useReactive(theme.components)
	if (control instanceof Slider) return <components.Slider control={control} label={label} />
	if (control instanceof Switch) return <components.Switch control={control} label={label} />
	if (control instanceof Checkbox) return <components.Checkbox control={control} label={label} />
	if (control instanceof Select) return <components.Select control={control} label={label} />
	if (control instanceof RadioGroup) return <components.RadioGroup control={control} label={label} />
	if (control instanceof TextField) return <components.TextField control={control} label={label} />
	return null
}

export { FormControl }
