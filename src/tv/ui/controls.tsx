import type { CSSProperties, ReactNode } from 'react'
import { MathUtils } from '@lotexiu/typescript'
import { Icon } from './Icon'

type TSwitchProps = { label: string; icon: string; on: boolean; onToggle: () => void }

function Switch({ label, icon, on, onToggle }: TSwitchProps) {
	return (
		<button
			className="switch"
			role="switch"
			aria-checked={on}
			data-on={on}
			onClick={onToggle}
			data-pf
		>
			<Icon name={icon} size="1.4em" />
			<span>{label}</span>
			<i className="switch__knob" />
		</button>
	)
}

type TSliderProps = {
	label: string
	value: number
	min: number
	max: number
	step: number
	format?: (value: number) => string
	onChange: (value: number) => void
}

function Slider({ label, value, min, max, step, format = String, onChange }: TSliderProps) {
	const fill = MathUtils.map(value, min, max, 0, 100)
	return (
		<label className="slider">
			<span>{label}</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				style={{ '--fill': `${fill}%` } as CSSProperties}
				onChange={(event) => onChange(Number(event.target.value))}
				data-pf
			/>
			<output>{format(value)}</output>
		</label>
	)
}

type TSegmentedProps<T extends string> = {
	value: T
	options: readonly { value: T; label: string; icon?: string }[]
	onChange: (value: T) => void
}

function Segmented<T extends string>({ value, options, onChange }: TSegmentedProps<T>) {
	return (
		<div className="seg" role="radiogroup">
			{options.map((option) => (
				<button
					key={option.value}
					role="radio"
					aria-checked={value === option.value}
					data-on={value === option.value}
					onClick={() => onChange(option.value)}
					data-pf
				>
					{option.icon && <Icon name={option.icon} size="1.15em" />} {option.label}
				</button>
			))}
		</div>
	)
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
	return (
		<section className="group">
			<header>
				<h3>{title}</h3>
				{hint && <small>{hint}</small>}
			</header>
			{children}
		</section>
	)
}

export { Switch, Slider, Segmented, Section }
