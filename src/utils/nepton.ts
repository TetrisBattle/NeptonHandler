type FrameResult = { clicked: boolean; msg: string }

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
			)
			if (!dateLink) return { clicked: false, msg: 'date link not found' }

			dateLink.click()

			const addBtn = await new Promise<HTMLElement | null>((resolve) => {
				const deadline = Date.now() + 5000
				const id = setInterval(() => {
					const btn = document.querySelector<HTMLElement>(
						`[data-on-click="openPopup"][data-param-array*="selectedDate=${date}"]`,
					)
					if (btn) {
						clearInterval(id)
						resolve(btn)
					} else if (Date.now() > deadline) {
						clearInterval(id)
						resolve(null)
					}
				}, 100)
			})

			if (!addBtn)
				return { clicked: false, msg: 'add button not found after 5s' }
			addBtn.click()
			return { clicked: true, msg: 'ok' }
		},
		args: [isoDate],
	})

	const clicked = results.some((r) => r.result?.clicked)

	const diagnostic = results
		.map((r) => r.result?.msg ?? '')
		.filter(Boolean)
		.join('; ')

	return { clicked, diagnostic: diagnostic || 'no result from any frame' }
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
				'#Activity_beginTime',
			)
			if (!input) return
			input.focus()
			input.select()
			input.value = t
			input.dispatchEvent(new Event('input', { bubbles: true }))
			input.dispatchEvent(new Event('change', { bubbles: true }))
		},
		args: [time],
	})
}

/** Fills the end-time input in the Nepton popup tab. */
export async function fillEndTime(tabId: number, time: string): Promise<void> {
	await chrome.scripting.executeScript({
		target: { tabId },
		func: (t: string) => {
			const input =
				document.querySelector<HTMLInputElement>('#Activity_endTime')
			if (!input) return
			input.focus()
			input.select()
			input.value = t
			input.dispatchEvent(new Event('input', { bubbles: true }))
			input.dispatchEvent(new Event('change', { bubbles: true }))
		},
		args: [time],
	})
}

/**
 * Types a project ID into the Nepton project-selection search input,
 * waits for jstree to filter the tree, then clicks the matching leaf node.
 */
export async function selectProject(
	tabId: number,
	projectId: string,
	code?: string,
): Promise<{ selected: boolean; msg: string }> {
	const results = await chrome.scripting.executeScript({
		target: { tabId },
		func: async (
			pid: string,
			noteCode: string,
		): Promise<{ selected: boolean; msg: string }> => {
			// 1. Find the search input by its known class.
			const searchInput = document.querySelector<HTMLInputElement>(
				'input.singleNodeSearchInputBox',
			)
			if (!searchInput)
				return { selected: false, msg: 'singleNodeSearchInputBox not found' }

			// 2. Open the dropdown tree by firing mousedown then focus.
			searchInput.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
			searchInput.focus()

			// 3. Wait for the tree container to become visible.
			const treeVisible = await new Promise<boolean>((resolve) => {
				const deadline = Date.now() + 5000
				const id = setInterval(() => {
					const container = document.querySelector<HTMLElement>(
						'.singleNodeSelectTreeContainer',
					)
					if (container && container.style.display !== 'none') {
						clearInterval(id)
						resolve(true)
					} else if (Date.now() > deadline) {
						clearInterval(id)
						resolve(false)
					}
				}, 100)
			})
			if (!treeVisible)
				return { selected: false, msg: 'tree container did not become visible' }

			// 4. Clear existing value and type the project ID to filter the tree.
			searchInput.value = ''
			searchInput.value = pid
			searchInput.dispatchEvent(new Event('input', { bubbles: true }))
			searchInput.dispatchEvent(new Event('change', { bubbles: true }))
			searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }))

			// 5. Wait for the matching leaf node to appear in filtered results.
			const node = await new Promise<HTMLElement | null>((resolve) => {
				const deadline = Date.now() + 5000
				const id = setInterval(() => {
					// jstree-search-current is set only on the active search's result,
					// avoiding stale jstree-search nodes from a previous search.
					const el = document.querySelector<HTMLElement>(
						'li.nodeType_leaf.jstree-search-current a.clickBound',
					)
					if (el) {
						clearInterval(id)
						resolve(el)
					} else if (Date.now() > deadline) {
						clearInterval(id)
						resolve(null)
					}
				}, 100)
			})
			if (!node)
				return {
					selected: false,
					msg: `no visible leaf node found after filter`,
				}

			// 6. Click the result.
			node.click()

			// 7. Always open the notes section.
			document
				.querySelector<HTMLElement>('button.projectNoteInputToggle')
				?.click()

			// 8. Wait for the internal notes textarea to appear.
			const internalNotes = await new Promise<HTMLTextAreaElement | null>(
				(resolve) => {
					const deadline = Date.now() + 3000
					const id = setInterval(() => {
						const el = document.querySelector<HTMLTextAreaElement>(
							'textarea.projectNoteInput.internalNotes',
						)
						if (el) {
							clearInterval(id)
							resolve(el)
						} else if (Date.now() > deadline) {
							clearInterval(id)
							resolve(null)
						}
					}, 100)
				},
			)

			// 9. Fill internal notes with code if provided.
			if (internalNotes && noteCode) {
				internalNotes.value = noteCode
				internalNotes.dispatchEvent(new Event('input', { bubbles: true }))
				internalNotes.dispatchEvent(new Event('change', { bubbles: true }))
			}

			// 10. Always focus the public notes textarea.
			document
				.querySelector<HTMLTextAreaElement>(
					'textarea.projectNoteInput.publicNotes',
				)
				?.focus()

			return { selected: true, msg: 'search result clicked' }
		},
		args: [projectId, code ?? ''],
	})

	return results[0]?.result ?? { selected: false, msg: 'no result from script' }
}
