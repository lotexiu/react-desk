import type { ReactNode, SVGProps } from 'react'

function Icon({ children, size = 16, ...properties }: SVGProps<SVGSVGElement> & { size?: number; children: ReactNode }) {
	return (
		<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden {...properties}>
			{children}
		</svg>
	)
}

function LauncherIcon() {
	return (
		<Icon size={20}>
			<rect x="2" y="2" width="5" height="5" rx="1.2" />
			<rect x="9" y="2" width="5" height="5" rx="1.2" />
			<rect x="2" y="9" width="5" height="5" rx="1.2" />
			<rect x="9" y="9" width="5" height="5" rx="1.2" />
		</Icon>
	)
}

function MinimizeIcon() {
	return (
		<Icon size={12}>
			<path d="M3 10.5 8 5.5l5 5" transform="rotate(180 8 8)" />
		</Icon>
	)
}

function MaximizeIcon() {
	return (
		<Icon size={12}>
			<path d="M3 10.5 8 5.5l5 5" />
		</Icon>
	)
}

function CloseIcon() {
	return (
		<Icon size={12}>
			<path d="m4 4 8 8M12 4l-8 8" />
		</Icon>
	)
}

function ModeIcon({ dark }: { dark: boolean }) {
	return dark ? (
		<Icon>
			<path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z" />
		</Icon>
	) : (
		<Icon>
			<circle cx="8" cy="8" r="3" />
			<path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
		</Icon>
	)
}

function ChevronIcon() {
	return (
		<Icon size={12}>
			<path d="M4 6l4 4 4-4" />
		</Icon>
	)
}

function CheckIcon() {
	return (
		<Icon size={12} strokeWidth={2}>
			<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
		</Icon>
	)
}

function DashIcon() {
	return (
		<Icon size={12} strokeWidth={2}>
			<path d="M4 8h8" />
		</Icon>
	)
}

export { LauncherIcon, MinimizeIcon, MaximizeIcon, CloseIcon, ModeIcon, ChevronIcon, CheckIcon, DashIcon }
