import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx';
import { LayoutProvider } from './contexts/LayoutContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css'

// Apply theme class to html element before initial render
const root = ReactDOM.createRoot(document.getElementById('root'));

// Set initial theme class on html element
const initialTheme = (() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'light';
})();

document.documentElement.classList.add(initialTheme);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </ThemeProvider>
  </React.StrictMode>
)
