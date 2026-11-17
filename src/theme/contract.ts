import type { ComponentType, ReactNode } from 'react'
import type {
	Checkbox,
	Combobox,
	Dialog,
	Listbox,
	Menu,
	Pagination,
	Tabs,
	RadioGroup,
	Select,
	Slider,
	Switch,
	TextField,
	ThemeStyle,
} from '@lotexiu/typescript'

type TWindowFrame = {
	readonly left: number
	readonly top: number
	readonly width: number
	readonly height: number
}

type TDeskTask = {
	readonly id: string
	readonly title: string
	readonly active: boolean
	readonly minimized: boolean
}

type TDesktopProps = {
	readonly panel: ReactNode
	readonly children: ReactNode
}

type TPanelProps = {
	readonly tasks: readonly TDeskTask[]
	readonly onTaskSelect: (id: string) => void
	readonly onLauncherSelect: () => void
}

type TWindowProps = {
	readonly title: string
	readonly active: boolean
	readonly maximized: boolean
	readonly frame: TWindowFrame
	readonly layer: number
	readonly children: ReactNode
	readonly onFocus: () => void
	readonly onMove: (frame: TWindowFrame) => void
	readonly onMinimize: () => void
	readonly onMaximize: () => void
	readonly onClose: () => void
}

type TControlProps<Control> = {
	readonly control: Control
	readonly label: string
}

type TTabsProps = TControlProps<Tabs<unknown, string>> & {
	readonly children: ReactNode
}

type TDialogProps = {
	readonly control: Dialog
	readonly title: string
	readonly description?: string
	readonly actions: ReactNode
}

type TButtonProps = {
	readonly children: ReactNode
	readonly onPress: () => void
	readonly tone?: 'default' | 'accent' | 'danger'
	readonly disabled?: boolean
}

type TDeskComponents = {
	readonly Desktop: ComponentType<TDesktopProps>
	readonly Panel: ComponentType<TPanelProps>
	readonly Window: ComponentType<TWindowProps>
	readonly Slider: ComponentType<TControlProps<Slider>>
	readonly Switch: ComponentType<TControlProps<Switch>>
	readonly Checkbox: ComponentType<TControlProps<Checkbox>>
	readonly Select: ComponentType<TControlProps<Select<string, string>>>
	readonly RadioGroup: ComponentType<TControlProps<RadioGroup<string, string>>>
	readonly TextField: ComponentType<TControlProps<TextField>>
	readonly Menu: ComponentType<TControlProps<Menu<unknown, string>>>
	readonly Listbox: ComponentType<TControlProps<Listbox<unknown, string>>>
	readonly Tabs: ComponentType<TTabsProps>
	readonly Pagination: ComponentType<TControlProps<Pagination>>
	readonly Combobox: ComponentType<TControlProps<Combobox<unknown, string>>>
	readonly Dialog: ComponentType<TDialogProps>
	readonly Button: ComponentType<TButtonProps>
}

type TDeskStyle = ThemeStyle<TDeskComponents>

export type {
	TWindowFrame,
	TDeskTask,
	TDesktopProps,
	TPanelProps,
	TWindowProps,
	TControlProps,
	TTabsProps,
	TDialogProps,
	TButtonProps,
	TDeskComponents,
	TDeskStyle,
}
