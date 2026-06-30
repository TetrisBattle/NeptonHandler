import { describe, expect, it } from 'vitest'
import { roundUpTo5Min, todayISO } from '../useAddEntry'

describe('todayISO', () => {
	it('returns today in YYYY-MM-DD format', () => {
		const result = todayISO()
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)

		const now = new Date()
		const expected = [
			now.getFullYear(),
			String(now.getMonth() + 1).padStart(2, '0'),
			String(now.getDate()).padStart(2, '0'),
		].join('-')
		expect(result).toBe(expected)
	})
})

describe('roundUpTo5Min', () => {
	it('returns a HH:MM formatted string', () => {
		expect(roundUpTo5Min()).toMatch(/^\d{2}:\d{2}$/)
	})

	it('minutes are always a multiple of 5', () => {
		const [, mm] = roundUpTo5Min().split(':')
		expect(Number(mm) % 5).toBe(0)
	})

	it('hours are between 00 and 23', () => {
		const [hh] = roundUpTo5Min().split(':')
		const h = Number(hh)
		expect(h).toBeGreaterThanOrEqual(0)
		expect(h).toBeLessThanOrEqual(23)
	})
})
