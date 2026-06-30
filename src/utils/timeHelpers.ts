import type { ChangeEvent } from 'react'

export function handleTimeChange(
	e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	setter: (v: string) => void,
) {
	const filtered = e.target.value.replace(/[^\d:]/g, '')
	if (/^\d{4}$/.test(filtered)) {
		setter(`${filtered.slice(0, 2)}:${filtered.slice(2)}`)
	} else {
		setter(filtered)
	}
}

export function normalizeTimeOnBlur(value: string): string {
	if (!value || value.includes(':')) return value
	let h: string
	let m: string
	switch (value.length) {
		case 1:
			h = `0${value}`
			m = '00'
			break
		case 2:
			h = value
			m = '00'
			break
		case 3:
			h = `0${value[0]}`
			m = value.slice(1)
			break
		default:
			h = value.slice(0, 2)
			m = value.slice(2, 4)
	}
	return `${h}:${m}`
}
