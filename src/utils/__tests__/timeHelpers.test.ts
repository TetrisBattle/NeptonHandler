import type { ChangeEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { handleTimeChange, normalizeTimeOnBlur } from '../timeHelpers'

// ---------------------------------------------------------------------------
// normalizeTimeOnBlur
// ---------------------------------------------------------------------------
describe('normalizeTimeOnBlur', () => {
	it('returns empty string unchanged', () => {
		expect(normalizeTimeOnBlur('')).toBe('')
	})

	it('passes through values that already contain a colon', () => {
		expect(normalizeTimeOnBlur('08:30')).toBe('08:30')
		expect(normalizeTimeOnBlur('0:0')).toBe('0:0')
	})

	it('pads 1-digit input → 0H:00', () => {
		expect(normalizeTimeOnBlur('8')).toBe('08:00')
	})

	it('pads 2-digit input → HH:00', () => {
		expect(normalizeTimeOnBlur('08')).toBe('08:00')
		expect(normalizeTimeOnBlur('23')).toBe('23:00')
	})

	it('pads 3-digit input → 0H:MM', () => {
		expect(normalizeTimeOnBlur('830')).toBe('08:30')
	})

	it('splits 4-digit input → HH:MM', () => {
		expect(normalizeTimeOnBlur('0830')).toBe('08:30')
		expect(normalizeTimeOnBlur('1345')).toBe('13:45')
	})
})

// ---------------------------------------------------------------------------
// handleTimeChange
// ---------------------------------------------------------------------------
function makeEvent(value: string): ChangeEvent<HTMLInputElement> {
	return { target: { value } } as ChangeEvent<HTMLInputElement>
}

describe('handleTimeChange', () => {
	it('strips non-digit, non-colon characters', () => {
		const setter = vi.fn()
		handleTimeChange(makeEvent('abc8de:3fg0'), setter)
		expect(setter).toHaveBeenCalledWith('8:30')
	})

	it('auto-inserts colon for exactly 4 digits', () => {
		const setter = vi.fn()
		handleTimeChange(makeEvent('0830'), setter)
		expect(setter).toHaveBeenCalledWith('08:30')
	})

	it('passes through partial digit input unchanged', () => {
		const setter = vi.fn()
		handleTimeChange(makeEvent('08:3'), setter)
		expect(setter).toHaveBeenCalledWith('08:3')
	})

	it('passes through value with fewer than 4 digits unchanged', () => {
		const setter = vi.fn()
		handleTimeChange(makeEvent('83'), setter)
		expect(setter).toHaveBeenCalledWith('83')
	})
})
