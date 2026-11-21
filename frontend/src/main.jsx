import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App.jsx'
import './theme/styles.css'

const theme = createTheme({
  palette: { primary: { main: '#142b4a' }, secondary: { main: '#2563eb' }, background: { default: '#f5f7fa' } },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 10 },
})
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><ThemeProvider theme={theme}><CssBaseline /><BrowserRouter><App /></BrowserRouter></ThemeProvider></QueryClientProvider></React.StrictMode>,
)
