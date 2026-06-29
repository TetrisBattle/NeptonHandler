/** Resolves with the active tab in the current window. */
export function getActiveTab(): Promise<chrome.tabs.Tab> {
	return new Promise((resolve, reject) =>
		chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
			if (tab) resolve(tab);
			else reject(new Error("No active tab found"));
		}),
	);
}

/**
 * Attaches an `onCreated` listener *before* you trigger the action that opens a
 * popup so the event is never missed.
 *
 * Returns `{ promise, cancel }`:
 *   - `promise` resolves with the new tab id once it appears
 *   - `cancel()` cleans up the listener when the popup never opened
 */
export function createTabOpenWatcher(timeoutMs = 10_000): {
	promise: Promise<number>;
	cancel: () => void;
} {
	let cancel: () => void = () => {};

	const promise = new Promise<number>((resolve, reject) => {
		const timer = setTimeout(() => {
			chrome.tabs.onCreated.removeListener(handler);
			reject(new Error("popup did not open within 10s"));
		}, timeoutMs);

		const handler = (newTab: chrome.tabs.Tab) => {
			if (newTab.id != null) {
				clearTimeout(timer);
				chrome.tabs.onCreated.removeListener(handler);
				resolve(newTab.id);
			}
		};

		chrome.tabs.onCreated.addListener(handler);

		cancel = () => {
			clearTimeout(timer);
			chrome.tabs.onCreated.removeListener(handler);
		};
	});

	return { promise, cancel };
}

/** Waits for a tab to reach `"complete"`, handling the already-loaded race. */
export function waitForTabLoad(
	tabId: number,
	timeoutMs = 15_000,
): Promise<void> {
	return new Promise((resolve, reject) => {
		chrome.tabs.get(tabId, (tab) => {
			if (tab.status === "complete") {
				resolve();
				return;
			}

			const timer = setTimeout(() => {
				chrome.tabs.onUpdated.removeListener(handler);
				reject(new Error("popup tab did not load within 15s"));
			}, timeoutMs);

			const handler = (changedId: number, info: chrome.tabs.TabChangeInfo) => {
				if (changedId === tabId && info.status === "complete") {
					clearTimeout(timer);
					chrome.tabs.onUpdated.removeListener(handler);
					resolve();
				}
			};

			chrome.tabs.onUpdated.addListener(handler);
		});
	});
}
