import { FunctionUtils, signal } from '@lotexiu/typescript'

const TOAST_MS = 2600

const toast = signal<string | null>(null)
const hideToast = FunctionUtils.debounce(() => toast.set(null), TOAST_MS)

function showToast(message: string) {
	toast.set(message)
	hideToast()
}

export { toast, showToast }
