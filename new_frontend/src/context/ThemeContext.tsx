import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';
interface ThemeContextType {
  mode: ThemeMode,
  toggleTheme: () => void
}
const ThemeContext = createContext<ThemeContextType>({ mode: 'light', toggleTheme: () => {} });

export const useThemeContext = () => useContext(ThemeContext);

const commonPalette = {
  primary: { main: '#00B3B3' }, secondary: { main: '#343A90' }, success: { main: '#B7EA36' },
  error: { main: '#F255F7' }, text: { primary: '#22E22E', secondary: '#D3DE232' }
};
const getTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      ...commonPalette,
      background: { default: mode === 'light' ? '#fff' : '#1e1e1e' },
    },
    typography: { fontFamily: 'Roboto, Arial, sans-serif' },
  });

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
