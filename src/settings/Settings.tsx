import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'
import type {
	NeptonHandlerConfig,
	ProjectConfig,
} from '../utils/neptonHandlerConfig'
import AddProject from './AddProject'
import ManageProjects from './ManageProjects'

type Props = {
	view: 'menu' | 'add' | 'manage'
	onViewChange: (view: 'add' | 'manage') => void
	configs: ProjectConfig[]
	defaultProjectId: string | null
	favoriteEnabled: boolean
	onAdd: (projectId: string, name: string, code?: string) => void
	onRemove: (id: string) => void
	onUpdate: (id: string, patch: Partial<Omit<ProjectConfig, 'id'>>) => void
	onSetDefault: (id: string | null) => void
	onSetFavoriteEnabled: (enabled: boolean) => void
	onExport: () => NeptonHandlerConfig
	onImport: (value: unknown) => Promise<void>
}

export default function Settings({
	view,
	onViewChange,
	configs,
	defaultProjectId,
	favoriteEnabled,
	onAdd,
	onRemove,
	onUpdate,
	onSetDefault,
	onSetFavoriteEnabled,
	onExport,
	onImport,
}: Readonly<Props>) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [importError, setImportError] = useState<string | null>(null)

	function handleExport() {
		const blob = new Blob([JSON.stringify(onExport(), null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'neptonHandlerConfig.json'
		link.click()
		URL.revokeObjectURL(url)
	}

	async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		setImportError(null)
		if (!file) {
			event.target.value = ''
			return
		}

		try {
			await onImport(JSON.parse(await file.text()))
		} catch (error) {
			setImportError(
				error instanceof Error
					? error.message
					: 'Could not import configuration',
			)
		} finally {
			event.target.value = ''
		}
	}

	if (view === 'add') {
		return <AddProject onAdd={onAdd} />
	}

	if (view === 'manage') {
		return (
			<ManageProjects
				configs={configs}
				defaultProjectId={defaultProjectId}
				favoriteEnabled={favoriteEnabled}
				onRemove={onRemove}
				onUpdate={onUpdate}
				onSetDefault={onSetDefault}
				onSetFavoriteEnabled={onSetFavoriteEnabled}
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
			<input
				ref={fileInputRef}
				type='file'
				accept='application/json,.json'
				onChange={handleImport}
				aria-label='Import configuration'
				style={{ display: 'none' }}
			/>
			<Button
				variant='outlined'
				onClick={() => fileInputRef.current?.click()}
				fullWidth
			>
				Import
			</Button>
			<Button variant='outlined' onClick={handleExport} fullWidth>
				Export
			</Button>
			{importError && (
				<Typography color='error' role='alert'>
					{importError}
				</Typography>
			)}
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
