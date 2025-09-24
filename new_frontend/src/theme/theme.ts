import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: '#00B3B3' },
    secondary: { main: '#343A90' },
    text: {
      primary: '#111111', // All default text is black
      secondary: '#656871'
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#1A2133',
      paper: mode === 'light' ? '#F8FBFF' : '#22263A',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { color: '#111111' },
    h2: { color: '#111111' },
    h3: { color: '#111111' },
    h4: { color: '#111111' },
    h5: { color: '#111111' },
    h6: { color: '#111111' },
    body1: { color: '#111111' },
    body2: { color: '#111111' },
    subtitle1: { color: '#111111' },
    subtitle2: { color: '#111111' }
  }
});
