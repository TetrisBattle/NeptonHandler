import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { fireEvent, render, screen } from '@testing-library/react'
import 'dayjs/locale/fi'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

function renderApp() {
	return render(
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fi'>
			<App />
		</LocalizationProvider>,
	)
}

describe('App', () => {
	it('renders the title', () => {
		renderApp()
		expect(screen.getByText('Nepton Handler')).toBeInTheDocument()
	})

	it('renders Date, Start time and End time fields', () => {
		renderApp()
		expect(screen.getByRole('group', { name: /date/i })).toBeInTheDocument()
		expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
	})

	it('date field defaults to today in Finnish format', () => {
		renderApp()
		const field = screen.getByRole('group', { name: /date/i })
		expect(field).toHaveTextContent(/\d{2}\.\d{2}\.\d{4}/)
	})

	it('renders an Add button', () => {
		renderApp()
		expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
	})

	it('does not show a status message initially', () => {
		renderApp()
		expect(screen.queryByText(/done!/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/no date link/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/failed/i)).not.toBeInTheDocument()
	})

	it('normalizes start time on blur — 3-digit input', async () => {
		renderApp()
		const input = screen.getByLabelText(/start time/i) as HTMLInputElement

		await userEvent.type(input, '830')
		fireEvent.blur(input)

		expect(input.value).toBe('08:30')
	})

	it('normalizes end time on blur — 2-digit input', async () => {
		renderApp()
		const input = screen.getByLabelText(/end time/i) as HTMLInputElement

		// Clear existing default value then type
		await userEvent.clear(input)
		await userEvent.type(input, '17')
		fireEvent.blur(input)

		expect(input.value).toBe('17:00')
	})
})
