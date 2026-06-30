type FrameResult = { clicked: boolean; msg: string };

/**
 * Clicks the date entry link on the Nepton page, then polls for and clicks the
 * "Add" popup button that appears afterwards.
 *
 * Runs across all frames so it works regardless of iframe nesting.
 */
export async function clickDateEntry(
	tabId: number,
	isoDate: string,
): Promise<{ clicked: boolean; diagnostic: string }> {
	const results = await chrome.scripting.executeScript({
		target: { tabId, allFrames: true },
		func: async (date: string): Promise<FrameResult> => {
			const dateLink = document.querySelector<HTMLElement>(
				`[data-popup-id^="${date}-"]`,
			);
			if (!dateLink) return { clicked: false, msg: "date link not found" };

			dateLink.click();

			const addBtn = await new Promise<HTMLElement | null>((resolve) => {
				const deadline = Date.now() + 5000;
				const id = setInterval(() => {
					const btn = document.querySelector<HTMLElement>(
						`[data-on-click="openPopup"][data-param-array*="selectedDate=${date}"]`,
					);
					if (btn) {
						clearInterval(id);
						resolve(btn);
					} else if (Date.now() > deadline) {
						clearInterval(id);
						resolve(null);
					}
				}, 100);
			});

			if (!addBtn)
				return { clicked: false, msg: "add button not found after 5s" };
			addBtn.click();
			return { clicked: true, msg: "ok" };
		},
		args: [isoDate],
	});

	const clicked = results.some((r) => r.result?.clicked);

	const diagnostic = results
		.map((r) => r.result?.msg ?? "")
		.filter(Boolean)
		.join("; ");

	return { clicked, diagnostic: diagnostic || "no result from any frame" };
}

/** Fills the end-time input in the Nepton popup tab. */
export async function fillEndTime(tabId: number, time: string): Promise<void> {
	await chrome.scripting.executeScript({
		target: { tabId },
		func: (t: string) => {
			const input =
				document.querySelector<HTMLInputElement>("#Activity_endTime");
			if (!input) return;
			input.focus();
			input.select();
			input.value = t;
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));
		},
		args: [time],
	});
}

/** Fills the start-time input in the Nepton popup tab. */
export async function fillStartTime(
	tabId: number,
	time: string,
): Promise<void> {
	await chrome.scripting.executeScript({
		target: { tabId },
		func: (t: string) => {
			const input = document.querySelector<HTMLInputElement>(
				"#Activity_beginTime",
			);
			if (!input) return;
			input.focus();
			input.select();
			input.value = t;
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));
		},
		args: [time],
	});
}
