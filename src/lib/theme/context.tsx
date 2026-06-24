'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'slate-light' | 'slate-dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('slate-light');

  useEffect(() => {
    const saved = localStorage.getItem('raahnuma-theme') as Theme;
    if (saved && ['slate-light', 'slate-dark'].includes(saved)) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme('slate-light');
    }
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('theme-dark');
    if (t === 'slate-dark') {
      root.classList.add('theme-dark');
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('raahnuma-theme', t);
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
