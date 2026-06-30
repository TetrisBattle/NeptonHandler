import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type Status, useAddEntry } from "./hooks/useAddEntry";

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
				placeholder="TTMM"
				value={startTime}
				onChange={(e) => setStartTime(e.target.value)}
				fullWidth
			/>

			<TextField
				label="End time"
				placeholder="TTMM"
				value={endTime}
				onChange={(e) => setEndTime(e.target.value)}
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
