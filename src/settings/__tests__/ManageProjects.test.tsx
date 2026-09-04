import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import ManageProjects from '../ManageProjects'

const configs = [
	{ id: 'project-1', name: 'Project One', projectId: '123', code: 'ABC' },
	{ id: 'project-2', name: 'Project Two', projectId: '456' },
]

function renderManageProjects(
	overrides: Partial<ComponentProps<typeof ManageProjects>> = {},
) {
	const props: ComponentProps<typeof ManageProjects> = {
		configs,
		defaultProjectId: null,
		favoriteEnabled: false,
		onRemove: vi.fn(),
		onUpdate: vi.fn(),
		onSetDefault: vi.fn(),
		onSetFavoriteEnabled: vi.fn(),
		...overrides,
	}

	return { ...render(<ManageProjects {...props} />), props }
}

describe('ManageProjects', () => {
	it('renders Favorite first and shows its info tooltip', async () => {
		const user = userEvent.setup()
		renderManageProjects({ configs: [] })

		expect(screen.getByRole('switch', { name: 'Favorite' })).not.toBeChecked()
		expect(screen.getByText('Empty')).toBeInTheDocument()

		await user.hover(screen.getByTestId('InfoOutlinedIcon'))
		expect(
			await screen.findByRole('tooltip', { name: 'Set default project' }),
		).toBeInTheDocument()
	})

	it('hides stars while Favorite is disabled and enables the mode', async () => {
		const user = userEvent.setup()
		const { props } = renderManageProjects()

		expect(
			screen.queryByRole('button', {
				name: 'Set Project One as default project',
			}),
		).not.toBeInTheDocument()

		await user.click(screen.getByRole('switch', { name: 'Favorite' }))
		expect(props.onSetFavoriteEnabled).toHaveBeenCalledWith(true)
	})

	it('shows selected and unselected stars while Favorite is enabled', () => {
		renderManageProjects({
			favoriteEnabled: true,
			defaultProjectId: 'project-1',
		})

		const selected = screen.getByRole('button', {
			name: 'Set Project One as default project',
		})
		const unselected = screen.getByRole('button', {
			name: 'Set Project Two as default project',
		})
		expect(within(selected).getByTestId('StarIcon')).toBeInTheDocument()
		expect(within(unselected).getByTestId('StarBorderIcon')).toBeInTheDocument()
	})

	it('selects an unselected project and clears the selected project', async () => {
		const user = userEvent.setup()
		const { props } = renderManageProjects({
			favoriteEnabled: true,
			defaultProjectId: 'project-1',
		})

		await user.click(
			screen.getByRole('button', {
				name: 'Set Project Two as default project',
			}),
		)
		await user.click(
			screen.getByRole('button', {
				name: 'Set Project One as default project',
			}),
		)

		expect(props.onSetDefault).toHaveBeenNthCalledWith(1, 'project-2')
		expect(props.onSetDefault).toHaveBeenNthCalledWith(2, null)
	})

	it('disables Favorite through the toggle', async () => {
		const user = userEvent.setup()
		const { props } = renderManageProjects({ favoriteEnabled: true })

		expect(screen.getByRole('switch', { name: 'Favorite' })).toBeChecked()
		await user.click(screen.getByRole('switch', { name: 'Favorite' }))
		expect(props.onSetFavoriteEnabled).toHaveBeenCalledWith(false)
	})

	it('updates trimmed project values', async () => {
		const user = userEvent.setup()
		const { props } = renderManageProjects()

		await user.click(
			screen.getByRole('button', { name: 'Edit project Project One' }),
		)
		const name = screen.getByLabelText('Name')
		const projectId = screen.getByLabelText('Project ID')
		const code = screen.getByLabelText('Internal code (optional)')
		await user.clear(name)
		await user.type(name, '  Updated  ')
		await user.clear(projectId)
		await user.type(projectId, '  789  ')
		await user.clear(code)
		await user.click(screen.getByRole('button', { name: 'Save' }))

		expect(props.onUpdate).toHaveBeenCalledWith('project-1', {
			name: 'Updated',
			projectId: '789',
			code: undefined,
		})
	})

	it('removes a project', async () => {
		const user = userEvent.setup()
		const { props } = renderManageProjects()

		await user.click(
			screen.getByRole('button', { name: 'Remove project Project Two' }),
		)
		expect(props.onRemove).toHaveBeenCalledWith('project-2')
	})
})
