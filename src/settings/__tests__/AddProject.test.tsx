import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddProject from '../AddProject'

describe('AddProject', () => {
	it('requires a name and project ID', async () => {
		const user = userEvent.setup()
		render(<AddProject onAdd={vi.fn()} />)
		const addButton = screen.getByRole('button', { name: 'Add project' })

		expect(addButton).toBeDisabled()
		await user.type(screen.getByLabelText('Name'), 'Project')
		expect(addButton).toBeDisabled()
		await user.type(screen.getByLabelText('Project ID'), '123')
		expect(addButton).toBeEnabled()
	})

	it('submits trimmed values and resets the fields', async () => {
		const user = userEvent.setup()
		const onAdd = vi.fn()
		render(<AddProject onAdd={onAdd} />)

		await user.type(screen.getByLabelText('Name'), '  Project One  ')
		await user.type(screen.getByLabelText('Project ID'), '  123  ')
		await user.type(
			screen.getByLabelText('Internal code (optional)'),
			'  ABC  ',
		)
		await user.click(screen.getByRole('button', { name: 'Add project' }))

		expect(onAdd).toHaveBeenCalledWith('123', 'Project One', 'ABC')
		expect(screen.getByLabelText('Name')).toHaveValue('')
		expect(screen.getByLabelText('Project ID')).toHaveValue('')
		expect(screen.getByLabelText('Internal code (optional)')).toHaveValue('')
	})

	it('omits an empty internal code', async () => {
		const user = userEvent.setup()
		const onAdd = vi.fn()
		render(<AddProject onAdd={onAdd} />)

		await user.type(screen.getByLabelText('Name'), 'Project One')
		await user.type(screen.getByLabelText('Project ID'), '123')
		await user.type(screen.getByLabelText('Internal code (optional)'), '   ')
		await user.click(screen.getByRole('button', { name: 'Add project' }))

		expect(onAdd).toHaveBeenCalledWith('123', 'Project One', undefined)
	})
})
