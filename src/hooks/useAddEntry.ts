import { useState } from "react";
import {
	createTabOpenWatcher,
	getActiveTab,
	waitForTabLoad,
} from "../utils/chromeTab";
import { clickDateEntry, fillStartTime } from "../utils/nepton";

export type Status = "idle" | "success" | "not-found" | "error";

function todayISO(): string {
	const d = new Date();
	return [
		d.getFullYear(),
		String(d.getMonth() + 1).padStart(2, "0"),
		String(d.getDate()).padStart(2, "0"),
	].join("-");
}

export function useAddEntry() {
	const [date, setDate] = useState(todayISO);
	const [startTime, setStartTime] = useState("");
	const [status, setStatus] = useState<Status>("idle");
	const [diagnostic, setDiagnostic] = useState("");

	async function handleAdd() {
		setStatus("idle");
		setDiagnostic("");

		try {
			const tab = await getActiveTab();
			if (tab.id == null) {
				setStatus("error");
				return;
			}

			// Attach listener before the click so the popup-open event is never missed
			const { promise: newTabIdPromise, cancel } = createTabOpenWatcher();

			const { clicked, diagnostic: msg } = await clickDateEntry(tab.id, date);
			if (!clicked) {
				cancel();
				setDiagnostic(msg);
				setStatus("not-found");
				return;
			}

			const newTabId = await newTabIdPromise;
			await waitForTabLoad(newTabId);

			if (startTime) {
				await fillStartTime(newTabId, startTime);
			}

			setStatus("success");
		} catch (e) {
			setDiagnostic(String(e));
			setStatus("error");
		}
	}

	return {
		date,
		setDate,
		startTime,
		setStartTime,
		status,
		diagnostic,
		handleAdd,
	};
}
