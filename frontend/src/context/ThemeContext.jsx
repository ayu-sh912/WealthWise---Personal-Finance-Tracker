import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Always dark — forced dark mode
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('wealthwise_theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Keep dark, do nothing (or allow toggle for future)
    setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
