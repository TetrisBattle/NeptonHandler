import { render, screen } from '@testing-library/react'
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
	})
})
