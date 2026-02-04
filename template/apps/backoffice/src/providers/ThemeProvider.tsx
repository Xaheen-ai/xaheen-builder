/**
 * Theme Provider
 * Manages light/dark theme with system preference detection
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
  /** Resets to auto mode (follows system preference) */
  resetToAuto: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'auto',
  toggleTheme: () => {},
  setColorScheme: () => {},
  isDark: false,
  resetToAuto: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
  /** Storage key for persisting theme preference */
  storageKey?: string;
}

/**
 * ThemeProvider - Provides theme context with system preference detection
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <DesignsystemetProvider colorScheme={colorScheme}>
 *     <App />
 *   </DesignsystemetProvider>
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, storageKey = 'theme-preference' }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    // Check localStorage first - only use stored if explicitly set
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    // Default to auto (follows system preference via CSS)
    return 'auto';
  });

  // Compute isDark for UI toggle state
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    return false;
  });

  // Listen for system preference changes (for isDark computation when in auto mode)
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (scheme === 'auto') {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, scheme);
    }
  };

  const resetToAuto = () => {
    setColorSchemeState('auto');
    localStorage.removeItem(storageKey);
  };

  // Compute effective dark state for UI
  const isDark = colorScheme === 'auto' ? systemPrefersDark : colorScheme === 'dark';

  const toggleTheme = () => {
    // Toggle based on current effective state
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      colorScheme, 
      toggleTheme, 
      setColorScheme,
      isDark,
      resetToAuto,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  return useContext(ThemeContext);
}
