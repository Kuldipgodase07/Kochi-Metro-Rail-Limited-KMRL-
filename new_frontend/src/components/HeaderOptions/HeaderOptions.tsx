import React from 'react';
import { IconButton, Select, MenuItem, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../../context/ThemeContext';
import { useLanguageContext, languages } from '../../context/LanguageContext';

const HeaderOptions: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const { language, setLanguage } = useLanguageContext();

  return (
    <>
      <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
        <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 2 }}>
          {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Tooltip>
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        size="small"
        sx={{ minWidth: 110, ml: 1, bgcolor: 'background.paper' }}
      >
        {languages.map(lang => <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>)}
      </Select>
    </>
  );
};

export default HeaderOptions;
