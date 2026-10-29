import type { ReactNode } from 'react'

const ICONS: Record<string, ReactNode> = {
	home: <path d="M3.5 11.2 12 4l8.5 7.2M5.8 9.6V20h4.4v-6h3.6v6h4.4V9.6" />,
	search: (
		<>
			<circle cx="11" cy="11" r="6.2" />
			<path d="m15.8 15.8 4.4 4.4" />
		</>
	),
	film: <path d="M4 5h16v14H4zM4 9.5h16M4 14.5h16M8.5 5v14M15.5 5v14" />,
	tv: (
		<>
			<rect x="3" y="5.5" width="18" height="11.5" rx="2" />
			<path d="M8 20.5h8M12 17v3.5" />
		</>
	),
	apps: <path d="M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z" />,
	sliders: (
		<>
			<path d="M4 7.5h9M19 7.5h1M4 16.5h1M11 16.5h9" />
			<circle cx="16" cy="7.5" r="2.4" />
			<circle cx="8" cy="16.5" r="2.4" />
		</>
	),
	play: <path d="M8 5.2v13.6L19 12z" fill="currentColor" />,
	pause: <path d="M7.5 5.5h3.2v13H7.5zM13.3 5.5h3.2v13h-3.2z" fill="currentColor" />,
	plus: <path d="M12 5v14M5 12h14" />,
	info: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 11v5.5M12 7.8v.1" />
		</>
	),
	bell: <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.6 1.8H4.4zM10 20.5h4" />,
	wifi: (
		<path d="M3.5 9.5a12 12 0 0 1 17 0M6.4 12.6a8 8 0 0 1 11.2 0M9.3 15.6a4 4 0 0 1 5.4 0M12 19v.1" />
	),
	bluetooth: <path d="m7 7.5 10 9-5 4.5V3l5 4.5-10 9" />,
	moon: <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z" />,
	sun: (
		<>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
		</>
	),
	volume: (
		<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
	),
	undo: <path d="M8.5 6 4 10.5 8.5 15M4.5 10.5H15a5 5 0 0 1 0 10h-3" />,
	redo: <path d="m15.5 6 4.5 4.5-4.5 4.5M19.5 10.5H9a5 5 0 0 0 0 10h3" />,
	shuffle: (
		<path d="M3.5 7h3.2c4 0 5.6 10 10.1 10h3.7M3.5 17h3.2c1.4 0 2.4-.8 3.3-2M14 8.6c.9-1 1.9-1.6 2.8-1.6h3.7M17.5 4l3 3-3 3M17.5 14l3 3-3 3" />
	),
	star: (
		<path
			d="m12 4 2.4 5 5.5.7-4 3.8 1 5.4L12 16.2 7.1 19l1-5.4-4-3.8L9.6 9z"
			fill="currentColor"
			stroke="none"
		/>
	),
	close: <path d="m6 6 12 12M18 6 6 18" />,
	check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
	user: (
		<>
			<circle cx="12" cy="8.5" r="3.6" />
			<path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
		</>
	),
	lock: (
		<>
			<rect x="5" y="10.5" width="14" height="9.5" rx="2" />
			<path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
		</>
	),
}

type TIconProps = { name: string; size?: string }

function Icon({ name, size = '1.5em' }: TIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
			className="icon"
		>
			{ICONS[name]}
		</svg>
	)
}

export { Icon }
