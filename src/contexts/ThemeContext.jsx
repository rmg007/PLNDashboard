import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Function to safely get the initial theme
const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('theme');
    if (typeof storedPrefs === 'string') {
      return storedPrefs;
    }

    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  // Default to light theme if all else fails
  return 'light';
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const rawSetTheme = (newTheme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(newTheme);

    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);
  
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Convenience hook to just get a boolean for dark mode
export const useIsDark = () => {
    const { theme } = useTheme();
    return theme === 'dark';
};
