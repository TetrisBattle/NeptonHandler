import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Settings from '../Settings'

function renderSettings() {
	return render(
		<Settings
			view='menu'
			onViewChange={vi.fn()}
			configs={[]}
			defaultProjectId={null}
			favoriteEnabled={false}
			onAdd={vi.fn()}
			onRemove={vi.fn()}
			onUpdate={vi.fn()}
			onSetDefault={vi.fn()}
			onSetFavoriteEnabled={vi.fn()}
			onExport={() => ({
				projectConfigs: [],
				defaultProjectId: null,
				favoriteEnabled: false,
				selectedProjectId: '',
			})}
			onImport={vi.fn().mockResolvedValue(undefined)}
		/>,
	)
}

describe('Settings', () => {
	it('shows the settings menu actions', () => {
		renderSettings()

		expect(
			screen.getByRole('button', { name: 'Add new project' }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Manage projects' }),
		).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
	})

	it('reports an import error and allows selecting the same file again', async () => {
		const onImport = vi
			.fn()
			.mockRejectedValue(new Error('Invalid configuration'))
		render(
			<Settings
				view='menu'
				onViewChange={vi.fn()}
				configs={[]}
				defaultProjectId={null}
				favoriteEnabled={false}
				onAdd={vi.fn()}
				onRemove={vi.fn()}
				onUpdate={vi.fn()}
				onSetDefault={vi.fn()}
				onSetFavoriteEnabled={vi.fn()}
				onExport={vi.fn()}
				onImport={onImport}
			/>,
		)

		const input = screen.getByLabelText('Import configuration')
		const file = new File(['{}'], 'neptonHandlerConfig.json', {
			type: 'application/json',
		})
		Object.defineProperty(file, 'text', {
			value: vi.fn().mockResolvedValue('{}'),
		})
		fireEvent.change(input, { target: { files: [file] } })
		await screen.findByRole('alert')
		await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1))
		const secondFile = new File(['{}'], 'neptonHandlerConfig.json', {
			type: 'application/json',
		})
		Object.defineProperty(secondFile, 'text', {
			value: vi.fn().mockResolvedValue('{}'),
		})
		fireEvent.change(input, { target: { files: [secondFile] } })

		await waitFor(() => expect(onImport).toHaveBeenCalledTimes(2))
		expect(screen.getByRole('alert')).toHaveTextContent('Invalid configuration')
	})
})
