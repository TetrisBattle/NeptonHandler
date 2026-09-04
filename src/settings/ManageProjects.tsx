import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import type { ProjectConfig } from '../hooks/useProjectConfigs'

type Props = {
	configs: ProjectConfig[]
	defaultProjectId: string | null
	favoriteEnabled: boolean
	onRemove: (id: string) => void
	onUpdate: (id: string, patch: Partial<Omit<ProjectConfig, 'id'>>) => void
	onSetDefault: (id: string | null) => void
	onSetFavoriteEnabled: (enabled: boolean) => void
}

export default function ManageProjects({
	configs,
	defaultProjectId,
	favoriteEnabled,
	onRemove,
	onUpdate,
	onSetDefault,
	onSetFavoriteEnabled,
}: Readonly<Props>) {
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editName, setEditName] = useState('')
	const [editProjectId, setEditProjectId] = useState('')
	const [editInternalCode, setEditInternalCode] = useState('')

	function startEdit(config: ProjectConfig) {
		setEditingId(config.id)
		setEditName(config.name)
		setEditProjectId(config.projectId)
		setEditInternalCode(config.code ?? '')
	}

	function handleSave() {
		if (!editingId || !editName.trim() || !editProjectId.trim()) return
		onUpdate(editingId, {
			name: editName.trim(),
			projectId: editProjectId.trim(),
			code: editInternalCode.trim() || undefined,
		})
		setEditingId(null)
	}

	return (
		<Box
			sx={{
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<Box
					sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}
				>
					<Typography>Favorite</Typography>
					<Tooltip title='Set default project'>
						<InfoOutlinedIcon fontSize='small' />
					</Tooltip>
				</Box>
				<Switch
					checked={favoriteEnabled}
					onChange={(_, checked) => onSetFavoriteEnabled(checked)}
					slotProps={{ input: { 'aria-label': 'Favorite' } }}
				/>
			</Box>
			{configs.length === 0 ? (
				<Typography variant='body2' sx={{ color: 'text.secondary' }}>
					Empty
				</Typography>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
					{configs.map((config) =>
						editingId === config.id ? (
							<Box
								key={config.id}
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
									onChange={(event) => setEditName(event.target.value)}
									size='small'
									fullWidth
								/>
								<TextField
									label='Project ID'
									value={editProjectId}
									onChange={(event) => setEditProjectId(event.target.value)}
									size='small'
									fullWidth
								/>
								<TextField
									label='Internal code (optional)'
									value={editInternalCode}
									onChange={(event) => setEditInternalCode(event.target.value)}
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
								key={config.id}
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
								<Typography variant='body2'>{config.name}</Typography>
								<Box>
									{favoriteEnabled && (
										<IconButton
											size='small'
											onClick={() =>
												onSetDefault(
													defaultProjectId === config.id ? null : config.id,
												)
											}
											aria-label={`Set ${config.name} as default project`}
										>
											{defaultProjectId === config.id ? (
												<StarIcon fontSize='small' color='primary' />
											) : (
												<StarBorderIcon fontSize='small' />
											)}
										</IconButton>
									)}
									<IconButton
										size='small'
										onClick={() => startEdit(config)}
										aria-label={`Edit project ${config.name}`}
									>
										<EditIcon fontSize='small' />
									</IconButton>
									<IconButton
										size='small'
										onClick={() => onRemove(config.id)}
										aria-label={`Remove project ${config.name}`}
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
