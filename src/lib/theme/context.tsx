'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'emerald-dark' | 'emerald-light' | 'royal-dark' | 'slate-dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('emerald-dark');

  useEffect(() => {
    const saved = localStorage.getItem('raahnuma-theme') as Theme;
    if (saved && ['emerald-dark', 'emerald-light', 'royal-dark', 'slate-dark'].includes(saved)) {
      setThemeState(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-royal', 'theme-slate');
    if (t === 'emerald-light') {
      root.classList.add('theme-light');
    } else if (t === 'royal-dark') {
      root.classList.add('theme-royal');
    } else if (t === 'slate-dark') {
      root.classList.add('theme-slate');
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
