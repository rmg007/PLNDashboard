import { useState, useEffect } from 'react';

export function usePersistedState(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultVal;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultVal;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Error writing to localStorage key "${key}":`, e);
    }
  }, [key, val]);

  return [val, setVal];
}
