import { useState } from 'react'
import {
	createTabOpenWatcher,
	getActiveTab,
	waitForTabLoad,
} from '../utils/chromeTab'
import {
	clickDateEntry,
	fillEndTime,
	fillProjectNotes,
	fillStartTime,
	selectProject,
} from '../utils/nepton'

export type Status = 'idle' | 'success' | 'notFound' | 'error'

export function roundUpTo5Min(): string {
	const d = new Date()
	let h = d.getHours()
	let m = Math.ceil(d.getMinutes() / 5) * 5
	if (m === 60) {
		m = 0
		h = (h + 1) % 24
	}
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function todayISO(): string {
	const d = new Date()
	return [
		d.getFullYear(),
		String(d.getMonth() + 1).padStart(2, '0'),
		String(d.getDate()).padStart(2, '0'),
	].join('-')
}

export function useAddEntry() {
	const [date, setDate] = useState(todayISO)
	const [startTime, setStartTime] = useState('')
	const [endTime, setEndTime] = useState(roundUpTo5Min)
	const [status, setStatus] = useState<Status>('idle')
	const [diagnostic, setDiagnostic] = useState('')

	async function handleAdd(neptonProjectId?: string, code?: string) {
		setStatus('idle')
		setDiagnostic('')

		try {
			const tab = await getActiveTab()
			if (tab.id == null) {
				setStatus('error')
				return
			}

			// Attach listener before the click so the popup-open event is never missed
			const { promise: newTabIdPromise, cancel } = createTabOpenWatcher()

			const { clicked, diagnostic: msg } = await clickDateEntry(tab.id, date)
			if (!clicked) {
				cancel()
				setStatus('notFound')
				setDiagnostic(msg)
				return
			}

			const newTabId = await newTabIdPromise
			await waitForTabLoad(newTabId)
			await fillStartTime(newTabId, startTime || '08:00')
			await fillEndTime(newTabId, endTime)

			if (neptonProjectId) {
				await selectProject(newTabId, neptonProjectId)
				await fillProjectNotes(newTabId, code)
			}

			setStatus('success')
		} catch (e) {
			setStatus('error')
			setDiagnostic(String(e))
		}
	}

	return {
		date,
		setDate,
		startTime,
		setStartTime,
		endTime,
		setEndTime,
		status,
		diagnostic,
		handleAdd,
	}
}
