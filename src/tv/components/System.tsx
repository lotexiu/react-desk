import { detectPersonOrCompany } from '@lotexiu/br'
import type { TDocumentIssue } from '@lotexiu/br'
import { Mask } from '@lotexiu/typescript'
import { Icon } from './Icon'
import { Section, Slider, Switch } from './controls'
import { useReactive } from '@lotexiu/react'
import { retryCatalog } from '../state/navigation'
import { bluetooth, dateText, doNotDisturb, documentText, networkFail, nightLight, PIN_MASK, pin, setVolume, showRemote, volume, wifi } from '../state/system'

const PIN_LENGTH = 4

const DATE = Mask.date({ order: 'dmy', separator: '/' })
const DATE_DIGITS = 8
const WEEKDAYS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']

/** Só números: a máscara põe as barras, valida o calendário (bissexto, dia por mês) e entrega um `PlainDate`. */
function DateField() {
	const text = useReactive(dateText)
	const { masked, unmasked, typed, check } = DATE.parse(text)
	const status = typed ? `${WEEKDAYS[typed.dayOfWeek - 1]} · ${typed.dayOfYear}º dia do ano` : !check.ok && check.reason === 'calendar' ? 'data inexistente' : `${unmasked.length}/${DATE_DIGITS}`
	return (
		<label className="pin">
			<Icon name="sun" size="1.3em" />
			<input
				type="text"
				inputMode="numeric"
				value={masked}
				placeholder="dd/mm/aaaa"
				onChange={(e) => dateText.set(DATE.apply(e.target.value))}
				onKeyDown={(e) => e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.stopPropagation()}
				data-pf
			/>
			<span className="pin__state" data-ok={typed !== undefined}>
				{status}
			</span>
		</label>
	)
}

const ISSUE_TEXT: Record<TDocumentIssue, string> = {
	empty: 'vazio',
	length: 'tamanho incorreto',
	characters: 'caracteres inválidos',
	repeated: 'números repetidos',
	'check-digit': 'dígito verificador não confere',
	'area-code': 'DDD inexistente',
}

/** CPF ou CNPJ (inclusive alfanumérico): o tipo vem do texto, a forma de exibição e a validação, do `@lotexiu/br`. */
function DocumentField() {
	const text = useReactive(documentText)
	const document = detectPersonOrCompany(text)
	const result = document?.check(text)
	const shown = document ? document.format(text) : text
	return (
		<label className="pin">
			<Icon name="user" size="1.3em" />
			<input
				type="text"
				value={shown}
				placeholder="CPF ou CNPJ"
				maxLength={18}
				onChange={(e) => documentText.set(e.target.value)}
				onKeyDown={(e) => e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.stopPropagation()}
				data-pf
			/>
			<span className="pin__state" data-ok={result?.ok === true}>
				{!document ? '—' : result?.ok ? `${document.id.toUpperCase()} válido` : `${document.id.toUpperCase()}: ${ISSUE_TEXT[result!.reason]}`}
			</span>
		</label>
	)
}

/** O estado guarda só dígitos (`Mask.unapply`); o campo mostra com a máscara (`Mask.apply`). */
function PinField() {
	const digits = useReactive(pin)
	const shown = Mask.apply(digits, PIN_MASK)
	const complete = Mask.valid(shown, PIN_MASK) && digits.length === PIN_LENGTH
	return (
		<label className="pin">
			<Icon name="lock" size="1.3em" />
			<input
				type="text"
				inputMode="numeric"
				value={shown}
				placeholder="• • • •"
				onChange={(e) => pin.set(Mask.unapply(e.target.value, PIN_MASK).slice(0, PIN_LENGTH))}
				onKeyDown={(e) => e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.stopPropagation()}
				data-pf
			/>
			<span className="pin__state" data-ok={complete}>
				{complete ? 'PIN definido' : `${digits.length}/${PIN_LENGTH}`}
			</span>
		</label>
	)
}

function Toggles() {
	return (
		<div className="switch-grid">
			<Switch label="Wi-Fi" icon="wifi" on={useReactive(wifi)} onToggle={() => wifi.toggle()} />
			<Switch label="Bluetooth" icon="bluetooth" on={useReactive(bluetooth)} onToggle={() => bluetooth.toggle()} />
			<Switch label="Luz noturna" icon="moon" on={useReactive(nightLight)} onToggle={() => nightLight.toggle()} />
			<Switch label="Não perturbe" icon="bell" on={useReactive(doNotDisturb)} onToggle={() => doNotDisturb.toggle()} />
			<Switch label="Mostrar controle" icon="play" on={useReactive(showRemote)} onToggle={() => showRemote.toggle()} />
			<Switch label="Simular falha de rede" icon="close" on={useReactive(networkFail)} onToggle={() => networkFail.toggle()} />
		</div>
	)
}

function SystemTab() {
	const level = useReactive(volume)
	return (
		<>
			<Section title="Conexões e conforto">
				<Toggles />
			</Section>
			<Section title="Som">
				<Slider label="Volume" value={level} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setVolume} />
			</Section>
			<Section title="Catálogo" hint="task + AsyncUtils.retry">
				<button className="btn" onClick={retryCatalog} data-pf>
					<Icon name="redo" size="1.15em" /> Recarregar catálogo
				</button>
			</Section>
			<Section title="Data" hint="Mask.date · PlainDate">
				<DateField />
			</Section>
			<Section title="Documento" hint="@lotexiu/br · CNPJ alfanumérico">
				<DocumentField />
			</Section>
			<Section title="Controle parental" hint={`Máscara ${PIN_MASK}`}>
				<PinField />
			</Section>
		</>
	)
}

export { SystemTab }
