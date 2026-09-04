import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { ProjectConfig } from '../hooks/useProjectConfigs'
import AddProject from './AddProject'
import ManageProjects from './ManageProjects'

type Props = {
	view: 'menu' | 'add' | 'manage'
	onViewChange: (view: 'add' | 'manage') => void
	configs: ProjectConfig[]
	defaultProjectId: string | null
	onAdd: (projectId: string, name: string, code?: string) => void
	onRemove: (id: string) => void
	onUpdate: (id: string, patch: Partial<Omit<ProjectConfig, 'id'>>) => void
	onSetDefault: (id: string | null) => void
}

export default function Settings({
	view,
	onViewChange,
	configs,
	defaultProjectId,
	onAdd,
	onRemove,
	onUpdate,
	onSetDefault,
}: Readonly<Props>) {
	if (view === 'add') {
		return <AddProject onAdd={onAdd} />
	}

	if (view === 'manage') {
		return (
			<ManageProjects
				configs={configs}
				defaultProjectId={defaultProjectId}
				onRemove={onRemove}
				onUpdate={onUpdate}
				onSetDefault={onSetDefault}
			/>
		)
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
			<Button variant='outlined' onClick={() => onViewChange('add')} fullWidth>
				Add new project
			</Button>
			<Button
				variant='outlined'
				onClick={() => onViewChange('manage')}
				fullWidth
			>
				Manage projects
			</Button>
		</Box>
	)
}
