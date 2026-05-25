/**
 * Theme Context
 * Provides theme (light/dark) state throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Theme } from '../types';
import { lightColors, darkColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

// ============================================================
// Build Theme Object
// ============================================================
const buildTheme = (isDark: boolean): Theme => {
  const colors = isDark ? darkColors : lightColors;

  return {
    colors: {
      ...colors,
    },
    typography,
    spacing,
    borderRadius,
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.5 : 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    },
    isDark,
  };
};

// ============================================================
// Context Interface
// ============================================================
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// ============================================================
// Theme Provider
// ============================================================
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((saved) => {
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      AsyncStorage.setItem('theme_mode', newValue ? 'dark' : 'light');
      return newValue;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: buildTheme(isDark), isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
