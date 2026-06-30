import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { ChangeEvent } from "react";
import { type Status, useAddEntry } from "./hooks/useAddEntry";

function handleTimeChange(
	e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	setter: (v: string) => void,
) {
	const filtered = e.target.value.replace(/[^\d:]/g, "");
	if (/^\d{4}$/.test(filtered)) {
		setter(`${filtered.slice(0, 2)}:${filtered.slice(2)}`);
	} else {
		setter(filtered);
	}
}

function normalizeTimeOnBlur(value: string): string {
	if (!value || value.includes(":")) return value;
	let h: string;
	let m: string;
	switch (value.length) {
		case 1:
			h = `0${value}`;
			m = "00";
			break;
		case 2:
			h = value;
			m = "00";
			break;
		case 3:
			h = `0${value[0]}`;
			m = value.slice(1);
			break;
		default:
			h = value.slice(0, 2);
			m = value.slice(2, 4);
	}
	return `${h}:${m}`;
}

const statusMessages: Record<Status, string> = {
	idle: "",
	success: "Done!",
	"not-found": "No date link found on the page.",
	error: "Failed — make sure the Nepton tab is active.",
};

const statusColors: Record<Status, string | undefined> = {
	idle: undefined,
	success: "success.main",
	"not-found": "warning.main",
	error: "error.main",
};

export default function App() {
	const {
		date,
		setDate,
		startTime,
		setStartTime,
		endTime,
		setEndTime,
		status,
		diagnostic,
		handleAdd,
	} = useAddEntry();

	return (
		<Box
			sx={{
				p: 2,
				minWidth: 320,
				display: "flex",
				flexDirection: "column",
				gap: 2,
				textAlign: "center",
			}}
		>
			<Typography variant="h6">Nepton Handler</Typography>

			<TextField
				label="Date"
				type="date"
				value={date}
				onChange={(e) => setDate(e.target.value)}
				slotProps={{ inputLabel: { shrink: true } }}
				fullWidth
			/>

			<TextField
				label="Start time"
				placeholder="HH:MM"
				value={startTime}
				onChange={(e) => handleTimeChange(e, setStartTime)}
				onBlur={() => setStartTime(normalizeTimeOnBlur(startTime))}
				slotProps={{ htmlInput: { maxLength: 5 } }}
				fullWidth
			/>

			<TextField
				label="End time"
				placeholder="HH:MM"
				value={endTime}
				onChange={(e) => handleTimeChange(e, setEndTime)}
				onBlur={() => setEndTime(normalizeTimeOnBlur(endTime))}
				slotProps={{ htmlInput: { maxLength: 5 } }}
				fullWidth
			/>

			<Button variant="contained" onClick={handleAdd} fullWidth>
				Add
			</Button>

			{status !== "idle" && (
				<Typography variant="body2" sx={{ color: statusColors[status] }}>
					{statusMessages[status]}
				</Typography>
			)}

			{diagnostic && (
				<Typography
					variant="caption"
					sx={{ color: "text.secondary", wordBreak: "break-all" }}
				>
					{diagnostic}
				</Typography>
			)}
		</Box>
	);
}
