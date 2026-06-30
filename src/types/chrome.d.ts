declare namespace chrome {
	namespace tabs {
		interface Tab {
			id?: number
			status?: string
		}

		interface TabChangeInfo {
			status?: string
		}

		function query(
			queryInfo: { active: boolean; currentWindow: boolean },
			callback: (tabs: Tab[]) => void,
		): void

		function get(tabId: number, callback: (tab: Tab) => void): void

		namespace onCreated {
			function addListener(callback: (tab: Tab) => void): void
			function removeListener(callback: (tab: Tab) => void): void
		}

		namespace onUpdated {
			function addListener(
				callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void,
			): void

			function removeListener(
				callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void,
			): void
		}
	}

	namespace scripting {
		function executeScript<T>(params: {
			target: { tabId: number; allFrames?: boolean }
			func: (...args: never[]) => T | Promise<T>
			args?: unknown[]
		}): Promise<Array<{ result: T }>>
	}

	namespace storage {
		interface StorageArea {
			get(keys: string | string[] | null): Promise<Record<string, unknown>>
			set(items: Record<string, unknown>): Promise<void>
			remove(keys: string | string[]): Promise<void>
		}
		const local: StorageArea
		const sync: StorageArea
	}
}
