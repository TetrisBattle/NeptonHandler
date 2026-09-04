import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SettingsIcon from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { type Status, useAddEntry } from './hooks/useAddEntry'
import { useProjectConfigs } from './hooks/useProjectConfigs'
import Settings from './settings/Settings'
import { handleTimeChange, normalizeTimeOnBlur } from './utils/timeHelpers'

const statusMessages: Record<Status, string> = {
	idle: '',
	success: 'Done!',
	notFound: 'No date link found on the page.',
	error: 'Failed — make sure the Nepton tab is active.',
}

const statusColors: Record<Status, string | undefined> = {
	idle: undefined,
	success: 'success.main',
	notFound: 'warning.main',
	error: 'error.main',
}

export default function App() {
	const [view, setView] = useState<
		'main' | 'settings' | 'addProject' | 'manageProjects'
	>('main')
	const [selectedProjectId, setSelectedProjectId] = useState('')
	const {
		configs,
		loading,
		defaultProjectId,
		addConfig,
		updateConfig,
		removeConfig,
		setDefaultProject,
	} = useProjectConfigs()
	const defaultApplied = useRef(false)
	const {
		date,
		setDate,
		startTime,
		setStartTime,
		endTime,
		setEndTime,
		status,
		handleAdd,
	} = useAddEntry()

	useEffect(() => {
		if (!loading && !defaultApplied.current) {
			defaultApplied.current = true
			if (defaultProjectId) {
				setSelectedProjectId(defaultProjectId)
			}
		}
	}, [loading, defaultProjectId])

	return (
		<Box
			sx={{
				p: 2,
				minWidth: 320,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				textAlign: 'center',
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				{view !== 'main' ? (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<IconButton
							size='small'
							onClick={() => setView(view === 'settings' ? 'main' : 'settings')}
							aria-label='Back'
						>
							<ArrowBackIcon fontSize='small' />
						</IconButton>
						<Typography variant='h6'>
							{view === 'settings'
								? 'Settings'
								: view === 'addProject'
									? 'Add new project'
									: 'Manage projects'}
						</Typography>
					</Box>
				) : (
					<>
						<Typography variant='h6'>Nepton Handler</Typography>
						<IconButton
							size='small'
							onClick={() => setView('settings')}
							aria-label='Settings'
						>
							<SettingsIcon fontSize='small' />
						</IconButton>
					</>
				)}
			</Box>

			{view !== 'main' ? (
				<Settings
					view={
						view === 'addProject'
							? 'add'
							: view === 'manageProjects'
								? 'manage'
								: 'menu'
					}
					onViewChange={(settingsView) =>
						setView(settingsView === 'add' ? 'addProject' : 'manageProjects')
					}
					configs={configs}
					defaultProjectId={defaultProjectId}
					onAdd={addConfig}
					onUpdate={updateConfig}
					onRemove={removeConfig}
					onSetDefault={(id) => {
						setDefaultProject(id)
						if (id) setSelectedProjectId(id)
					}}
				/>
			) : (
				<>
					<FormControl fullWidth size='small'>
						<InputLabel id='project-select-label'>Project</InputLabel>
						<Select
							labelId='project-select-label'
							value={selectedProjectId}
							label='Project'
							onChange={(e) => setSelectedProjectId(e.target.value)}
						>
							<MenuItem value=''>
								<em>— No project —</em>
							</MenuItem>
							{configs.map((c) => (
								<MenuItem key={c.id} value={c.id}>
									{c.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<DatePicker
						label='Date'
						format='DD.MM.YYYY'
						value={dayjs(date)}
						onChange={(value) => setDate(value?.format('YYYY-MM-DD') ?? '')}
						slotProps={{ textField: { fullWidth: true } }}
					/>

					<TextField
						label='Start time'
						placeholder='HH:MM'
						value={startTime}
						onChange={(e) => handleTimeChange(e, setStartTime)}
						onBlur={() => setStartTime(normalizeTimeOnBlur(startTime))}
						slotProps={{ htmlInput: { maxLength: 5 } }}
						fullWidth
					/>

					<TextField
						label='End time'
						placeholder='HH:MM'
						value={endTime}
						onChange={(e) => handleTimeChange(e, setEndTime)}
						onBlur={() => setEndTime(normalizeTimeOnBlur(endTime))}
						slotProps={{ htmlInput: { maxLength: 5 } }}
						fullWidth
					/>

					<Button
						variant='contained'
						onClick={() => {
							const cfg = configs.find((c) => c.id === selectedProjectId)
							handleAdd(cfg?.projectId, cfg?.code)
						}}
						fullWidth
					>
						Add
					</Button>

					{status !== 'idle' && (
						<Typography variant='body2' sx={{ color: statusColors[status] }}>
							{statusMessages[status]}
						</Typography>
					)}
				</>
			)}
		</Box>
	)
}
