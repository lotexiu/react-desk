import { ThemeStyle } from '@lotexiu/typescript'
import { Button } from './controls/button'
import { Checkbox } from './controls/checkbox'
import { Combobox } from './controls/combobox'
import { Dialog } from './controls/dialog'
import { Listbox } from './controls/listbox'
import { Menu } from './controls/menu'
import { Pagination } from './controls/pagination'
import { Tabs } from './controls/tabs'
import { RadioGroup } from './controls/radio-group'
import { Select } from './controls/select'
import { Slider } from './controls/slider'
import { Switch } from './controls/switch'
import { TextField } from './controls/text-field'
import { plasmaAdjustments, plasmaPalettes, plasmaRoles } from './definitions'
import { Desktop } from './desktop'
import { Panel } from './panel'
import { plasmaTokens } from './tokens'
import { Window } from './window'

export const plasmaComponents = {
	Desktop,
	Panel,
	Window,
	Slider,
	Switch,
	Checkbox,
	Select,
	RadioGroup,
	TextField,
	Menu,
	Listbox,
	Tabs,
	Pagination,
	Combobox,
	Dialog,
	Button,
}

export const PlasmaStyle = new ThemeStyle({
	name: 'Plasma',
	palettes: plasmaPalettes,
	roles: plasmaRoles,
	adjustments: plasmaAdjustments,
	tokens: plasmaTokens,
	components: plasmaComponents,
})
