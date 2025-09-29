import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35', // Orange/red accent
      light: '#FF8A65',
      dark: '#E64A19',
    },
    secondary: {
      main: '#4FC3F7', // Light blue accent
      light: '#81D4FA',
      dark: '#29B6F6',
    },
    background: {
      default: '#1a237e', // Dark blue background
      paper: '#283593', // Slightly lighter blue for cards
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbdefb',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h6: {
      fontWeight: 600,
      color: '#ffffff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #F5F5DC 0%, #F0E68C 100%)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          color: '#2c3e50 !important',
          '& .MuiTypography-root': {
            color: '#2c3e50 !important',
          },
          '& .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6': {
            color: '#1a1a1a !important',
          },
          '& .MuiTypography-body1, & .MuiTypography-body2': {
            color: '#555 !important',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)',
            background: 'linear-gradient(135deg, #F0E68C 0%, #DDD3A0 100%)',
            borderColor: 'rgba(255, 107, 53, 0.4)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 500,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
          },
        },
        outlined: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)