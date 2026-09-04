import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import 'dayjs/locale/fi'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const theme = createTheme({
	palette: {
		mode: 'dark',
	},
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fi'>
				<CssBaseline />
				<App />
			</LocalizationProvider>
		</ThemeProvider>
	</React.StrictMode>,
)
