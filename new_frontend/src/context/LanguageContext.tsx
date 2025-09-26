import React, { createContext, useState, useContext } from 'react';
export const languages = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'ml', label: 'Malayalam' }
];
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}
const LanguageContext = createContext<LanguageContextType>({ language: 'en', setLanguage: () => {} });
export const useLanguageContext = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
  );
};
