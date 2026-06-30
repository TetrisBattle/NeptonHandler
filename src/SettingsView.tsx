import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { ProjectConfig } from './hooks/useProjectConfigs'

type Props = {
	onBack: () => void
	configs: ProjectConfig[]
	onAdd: (projectId: string, name: string, code?: string) => void
	onRemove: (id: string) => void
	onUpdate: (id: string, patch: Partial<Omit<ProjectConfig, 'id'>>) => void
}

export default function SettingsView({
	onBack,
	configs,
	onAdd,
	onRemove,
	onUpdate,
}: Readonly<Props>) {
	const [name, setName] = useState('')
	const [projectId, setProjectId] = useState('')
	const [code, setCode] = useState('')

	const [editingId, setEditingId] = useState<string | null>(null)
	const [editName, setEditName] = useState('')
	const [editProjectId, setEditProjectId] = useState('')
	const [editCode, setEditCode] = useState('')

	function handleAdd() {
		const trimmedName = name.trim()
		const trimmedId = projectId.trim()
		if (!trimmedName || !trimmedId) return
		onAdd(trimmedId, trimmedName, code.trim() || undefined)
		setName('')
		setProjectId('')
		setCode('')
	}

	function startEdit(c: ProjectConfig) {
		setEditingId(c.id)
		setEditName(c.name)
		setEditProjectId(c.projectId)
		setEditCode(c.code ?? '')
	}

	function handleSave() {
		if (!editingId || !editName.trim() || !editProjectId.trim()) return
		onUpdate(editingId, {
			name: editName.trim(),
			projectId: editProjectId.trim(),
			code: editCode.trim() || undefined,
		})
		setEditingId(null)
	}

	return (
		<Box
			sx={{
				p: 2,
				minWidth: 320,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<IconButton size='small' onClick={onBack} aria-label='Back'>
					<ArrowBackIcon fontSize='small' />
				</IconButton>
				<Typography variant='h6'>Project settings</Typography>
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				<TextField
					label='Name'
					value={name}
					onChange={(e) => setName(e.target.value)}
					size='small'
					fullWidth
				/>
				<TextField
					label='Project ID'
					value={projectId}
					onChange={(e) => setProjectId(e.target.value)}
					size='small'
					fullWidth
				/>
				<TextField
					label='Code (optional)'
					value={code}
					onChange={(e) => setCode(e.target.value)}
					size='small'
					fullWidth
				/>
				<Button
					variant='contained'
					onClick={handleAdd}
					disabled={!name.trim() || !projectId.trim()}
					fullWidth
				>
					Add project
				</Button>
			</Box>

			{configs.length > 0 && (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
					<Typography variant='caption' sx={{ color: 'text.secondary' }}>
						Saved projects
					</Typography>
					{configs.map((c) =>
						editingId === c.id ? (
							<Box
								key={c.id}
								sx={{
									display: 'flex',
									flexDirection: 'column',
									gap: 1,
									p: 1,
									borderRadius: 1,
									bgcolor: 'action.hover',
								}}
							>
								<TextField
									label='Name'
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									size='small'
									fullWidth
								/>
								<TextField
									label='Project ID'
									value={editProjectId}
									onChange={(e) => setEditProjectId(e.target.value)}
									size='small'
									fullWidth
								/>
								<TextField
									label='Code (optional)'
									value={editCode}
									onChange={(e) => setEditCode(e.target.value)}
									size='small'
									fullWidth
								/>
								<Box sx={{ display: 'flex', gap: 1 }}>
									<Button
										variant='contained'
										size='small'
										onClick={handleSave}
										disabled={!editName.trim() || !editProjectId.trim()}
										fullWidth
									>
										Save
									</Button>
									<Button
										variant='outlined'
										size='small'
										onClick={() => setEditingId(null)}
										fullWidth
									>
										Cancel
									</Button>
								</Box>
							</Box>
						) : (
							<Box
								key={c.id}
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									px: 1,
									py: 0.5,
									borderRadius: 1,
									bgcolor: 'action.hover',
								}}
							>
								<Typography variant='body2'>{c.name}</Typography>
								<Box>
									<IconButton
										size='small'
										onClick={() => startEdit(c)}
										aria-label={`Edit project ${c.name}`}
									>
										<EditIcon fontSize='small' />
									</IconButton>
									<IconButton
										size='small'
										onClick={() => onRemove(c.id)}
										aria-label={`Remove project ${c.name}`}
									>
										<DeleteIcon fontSize='small' />
									</IconButton>
								</Box>
							</Box>
						),
					)}
				</Box>
			)}
		</Box>
	)
}
