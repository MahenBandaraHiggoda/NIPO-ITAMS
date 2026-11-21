import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: { primary: { main: '#142b4a' }, secondary: { main: '#2563eb' }, background: { default: '#f5f7fa' } },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  shape: { borderRadius: 10 },
})

export default theme
