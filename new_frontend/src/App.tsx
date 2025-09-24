import React from 'react';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage/LandingPage'; // Or your router

const App = () => (
  <CustomThemeProvider>
    <LanguageProvider>
      <CssBaseline />
      <LandingPage />
    </LanguageProvider>
  </CustomThemeProvider>
);

export default App;
// TEST GIT CHANGE 2025
