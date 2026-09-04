import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'

type Props = {
	onAdd: (projectId: string, name: string, code?: string) => void
}

export default function AddProject({ onAdd }: Readonly<Props>) {
	const [name, setName] = useState('')
	const [projectId, setProjectId] = useState('')
	const [internalCode, setInternalCode] = useState('')

	function handleAdd() {
		const trimmedName = name.trim()
		const trimmedId = projectId.trim()
		if (!trimmedName || !trimmedId) return
		onAdd(trimmedId, trimmedName, internalCode.trim() || undefined)
		setName('')
		setProjectId('')
		setInternalCode('')
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
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				<TextField
					label='Name'
					value={name}
					onChange={(event) => setName(event.target.value)}
					size='small'
					fullWidth
				/>
				<TextField
					label='Project ID'
					value={projectId}
					onChange={(event) => setProjectId(event.target.value)}
					size='small'
					fullWidth
				/>
				<TextField
					label='Internal code (optional)'
					value={internalCode}
					onChange={(event) => setInternalCode(event.target.value)}
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
		</Box>
	)
}
