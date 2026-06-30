import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	createTabOpenWatcher,
	getActiveTab,
	waitForTabLoad,
} from '../chromeTab'

// ---------------------------------------------------------------------------
// getActiveTab
// ---------------------------------------------------------------------------
describe('getActiveTab', () => {
	it('resolves with the active tab', async () => {
		const tab = { id: 1, status: 'complete' }
		chrome.tabs.query = vi.fn((_q, cb) => cb([tab]))

		await expect(getActiveTab()).resolves.toEqual(tab)
	})

	it('rejects when the callback receives no tabs', async () => {
		chrome.tabs.query = vi.fn((_q, cb) => cb([]))

		await expect(getActiveTab()).rejects.toThrow('No active tab found')
	})
})

// ---------------------------------------------------------------------------
// createTabOpenWatcher
// ---------------------------------------------------------------------------
describe('createTabOpenWatcher', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('resolves with the new tab id when onCreated fires', async () => {
		let capturedHandler: ((tab: chrome.tabs.Tab) => void) | undefined
		chrome.tabs.onCreated.addListener = vi.fn((handler) => {
			capturedHandler = handler
		})
		chrome.tabs.onCreated.removeListener = vi.fn()

		const { promise } = createTabOpenWatcher()
		capturedHandler!({ id: 42 })

		await expect(promise).resolves.toBe(42)
	})

	it('cancel() removes the listener without rejecting', async () => {
		chrome.tabs.onCreated.addListener = vi.fn()
		chrome.tabs.onCreated.removeListener = vi.fn()

		const { cancel } = createTabOpenWatcher()
		cancel()

		expect(chrome.tabs.onCreated.removeListener).toHaveBeenCalledTimes(1)
	})

	it('rejects after the timeout elapses', async () => {
		chrome.tabs.onCreated.addListener = vi.fn()
		chrome.tabs.onCreated.removeListener = vi.fn()

		const { promise } = createTabOpenWatcher(1000)
		vi.advanceTimersByTime(1001)

		await expect(promise).rejects.toThrow('popup did not open within 10s')
	})
})

// ---------------------------------------------------------------------------
// waitForTabLoad
// ---------------------------------------------------------------------------
describe('waitForTabLoad', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('resolves immediately when the tab is already complete', async () => {
		chrome.tabs.get = vi.fn((_id, cb) => cb({ status: 'complete' }))

		await expect(waitForTabLoad(1)).resolves.toBeUndefined()
	})

	it('resolves when onUpdated fires with status complete', async () => {
		chrome.tabs.get = vi.fn((_id, cb) => cb({ status: 'loading' }))

		let capturedHandler:
			| ((
					id: number,
					info: chrome.tabs.TabChangeInfo,
					tab: chrome.tabs.Tab,
			  ) => void)
			| undefined
		chrome.tabs.onUpdated.addListener = vi.fn((handler) => {
			capturedHandler = handler
		})
		chrome.tabs.onUpdated.removeListener = vi.fn()

		const p = waitForTabLoad(5)
		capturedHandler!(5, { status: 'complete' }, { id: 5, status: 'complete' })

		await expect(p).resolves.toBeUndefined()
	})

	it('ignores onUpdated events for other tab ids', async () => {
		chrome.tabs.get = vi.fn((_id, cb) => cb({ status: 'loading' }))

		let capturedHandler:
			| ((
					id: number,
					info: chrome.tabs.TabChangeInfo,
					tab: chrome.tabs.Tab,
			  ) => void)
			| undefined
		chrome.tabs.onUpdated.addListener = vi.fn((handler) => {
			capturedHandler = handler
		})
		chrome.tabs.onUpdated.removeListener = vi.fn()

		const p = waitForTabLoad(5)
		// Fire for wrong tab — should not resolve
		capturedHandler!(99, { status: 'complete' }, { id: 99 })
		// Fire for right tab — should resolve
		capturedHandler!(5, { status: 'complete' }, { id: 5 })

		await expect(p).resolves.toBeUndefined()
	})

	it('rejects after the timeout elapses', async () => {
		chrome.tabs.get = vi.fn((_id, cb) => cb({ status: 'loading' }))
		chrome.tabs.onUpdated.addListener = vi.fn()
		chrome.tabs.onUpdated.removeListener = vi.fn()

		const p = waitForTabLoad(5, 1000)
		vi.advanceTimersByTime(1001)

		await expect(p).rejects.toThrow('popup tab did not load within 15s')
	})
})
