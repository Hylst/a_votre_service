
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state without accessing localStorage immediately
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from localStorage after component mounts
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('theme') as Theme;
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          setTheme(stored);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    const root = window?.document?.documentElement;
    if (!root) return;
    
    const updateTheme = () => {
      let resolvedTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        resolvedTheme = window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
      } else {
        resolvedTheme = theme;
      }
      
      setActualTheme(resolvedTheme);
      
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    };

    updateTheme();
    
    const mediaQuery = window?.matchMedia?.('(prefers-color-scheme: dark)');
    if (mediaQuery) {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme, isInitialized]);

  // Save theme to localStorage with error handling
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', theme);
      }
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme, isInitialized]);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
