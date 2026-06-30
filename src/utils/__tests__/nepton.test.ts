import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clickDateEntry, fillEndTime, fillStartTime } from '../nepton'

beforeEach(() => {
	vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// clickDateEntry
// ---------------------------------------------------------------------------
describe('clickDateEntry', () => {
	it('returns clicked:true when at least one frame result has clicked:true', async () => {
		chrome.scripting.executeScript = vi
			.fn()
			.mockResolvedValue([
				{ result: { clicked: false, msg: 'date link not found' } },
				{ result: { clicked: true, msg: 'ok' } },
			])

		const result = await clickDateEntry(1, '2026-06-30')

		expect(result.clicked).toBe(true)
	})

	it('returns clicked:false and aggregates diagnostic messages when no frame clicked', async () => {
		chrome.scripting.executeScript = vi
			.fn()
			.mockResolvedValue([
				{ result: { clicked: false, msg: 'date link not found' } },
				{ result: { clicked: false, msg: 'date link not found' } },
			])

		const result = await clickDateEntry(1, '2026-06-30')

		expect(result.clicked).toBe(false)
		expect(result.diagnostic).toContain('date link not found')
	})

	it("falls back to 'no result from any frame' when results have no messages", async () => {
		chrome.scripting.executeScript = vi
			.fn()
			.mockResolvedValue([{ result: { clicked: false, msg: '' } }])

		const result = await clickDateEntry(1, '2026-06-30')

		expect(result.diagnostic).toBe('no result from any frame')
	})

	it('passes allFrames:true and the iso date as an arg', async () => {
		chrome.scripting.executeScript = vi
			.fn()
			.mockResolvedValue([{ result: { clicked: true, msg: 'ok' } }])

		await clickDateEntry(7, '2026-01-15')

		expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
			expect.objectContaining({
				target: { tabId: 7, allFrames: true },
				args: ['2026-01-15'],
			}),
		)
	})
})

// ---------------------------------------------------------------------------
// fillEndTime
// ---------------------------------------------------------------------------
describe('fillEndTime', () => {
	it('calls executeScript with the correct tabId and time arg', async () => {
		chrome.scripting.executeScript = vi.fn().mockResolvedValue([{}])

		await fillEndTime(3, '17:30')

		expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
			expect.objectContaining({
				target: { tabId: 3 },
				args: ['17:30'],
			}),
		)
	})
})

// ---------------------------------------------------------------------------
// fillStartTime
// ---------------------------------------------------------------------------
describe('fillStartTime', () => {
	it('calls executeScript with the correct tabId and time arg', async () => {
		chrome.scripting.executeScript = vi.fn().mockResolvedValue([{}])

		await fillStartTime(4, '09:00')

		expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
			expect.objectContaining({
				target: { tabId: 4 },
				args: ['09:00'],
			}),
		)
	})
})
