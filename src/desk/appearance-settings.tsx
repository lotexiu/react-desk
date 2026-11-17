import { useReactive } from '@lotexiu/react'
import { adjustmentsForm, contrast, darkMode, styleChoice } from './appearance-controls'
import { FormControl } from './form-control'
import { SettingRow } from './setting-row'

function AppearanceSettings() {
	const form = useReactive(adjustmentsForm)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
			<SettingRow label="Estilo">
				<FormControl control={styleChoice} label="Estilo" />
			</SettingRow>
			<SettingRow label="Modo escuro">
				<FormControl control={darkMode} label="Modo escuro" />
			</SettingRow>
			<SettingRow label="Contraste">
				<FormControl control={contrast} label="Contraste" />
			</SettingRow>
			{form.fields.map((field) => {
				const label = field.definition.label ?? field.id
				return (
					<SettingRow key={field.id} label={label}>
						<FormControl control={field.control} label={label} />
					</SettingRow>
				)
			})}
		</div>
	)
}

export { AppearanceSettings }
