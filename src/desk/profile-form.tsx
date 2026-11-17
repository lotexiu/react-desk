import { useReactive } from '@lotexiu/react'
import { Form } from '@lotexiu/typescript'
import type { TControlDefinitions } from '@lotexiu/typescript'
import { FormControl } from './form-control'
import { SettingRow } from './setting-row'

const profileDefinitions = {
	name: { kind: 'text', label: 'Nome', default: '', required: true, maxLength: 60 },
	phone: { kind: 'text', label: 'Telefone', default: '', mask: '(00) 00000-0000' },
	plan: {
		kind: 'choice',
		label: 'Plano',
		default: 'basic',
		options: ['basic', 'plus', 'pro'],
		optionLabels: { basic: 'Básico', plus: 'Plus', pro: 'Pro' },
		control: 'radio',
	},
	contact: {
		kind: 'choice',
		label: 'Contato preferido',
		default: 'email',
		options: ['email', 'phone', 'message'],
		optionLabels: { email: 'E-mail', phone: 'Ligação', message: 'Mensagem' },
	},
	newsletter: { kind: 'toggle', label: 'Receber novidades', default: false, control: 'checkbox' },
} as const satisfies TControlDefinitions

const profileForm = new Form({ id: 'profile', definitions: profileDefinitions })

function ProfileForm() {
	const values = useReactive(profileForm.values)
	const invalid = useReactive(profileForm.invalid)
	const dirty = useReactive(profileForm.dirty)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
			{profileForm.fields.map((field) => (
				<SettingRow key={field.id} label={field.definition.label}>
					<FormControl control={field.control} label={field.definition.label} />
				</SettingRow>
			))}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12 }}>
				<code style={{ fontSize: '0.8em', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{JSON.stringify(values)}
				</code>
				<button type="button" disabled={!dirty} onClick={() => profileForm.reset()}>
					Limpar
				</button>
			</div>
			<span style={{ fontSize: '0.85em', opacity: 0.75 }}>{invalid ? 'Preencha os campos obrigatórios.' : 'Tudo certo.'}</span>
		</div>
	)
}

export { ProfileForm }
