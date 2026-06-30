import '@testing-library/jest-dom'

// Minimal Chrome API stub. Individual tests override methods with vi.fn() as needed.
const chromeMock = {
	tabs: {
		query: vi.fn(),
		get: vi.fn(),
		onCreated: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
		},
		onUpdated: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
		},
	},
	scripting: {
		executeScript: vi.fn(),
	},
	storage: {
		local: {
			get: vi.fn().mockResolvedValue({}),
			set: vi.fn().mockResolvedValue(undefined),
		},
	},
}

Object.defineProperty(globalThis, 'chrome', {
	value: chromeMock,
	writable: true,
})
