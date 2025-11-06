import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@pomodoro_theme';

// Theme colors
export const lightTheme = {
  // Background
  background: '#f6f7f8',
  cardBackground: '#ffffff',
  
  // Text
  textPrimary: '#343A40',
  textSecondary: '#617c89',
  textTertiary: '#9ca3af',
  
  // Accents
  primary: '#A8D8B9',
  secondary: '#B2C7E5',
  
  // Borders
  border: '#e5e7eb',
  
  // Status
  success: '#A8D8B9',
  error: '#ef4444',
  warning: '#f59e0b',
  
  // Chart
  chartBar: '#A8D8B9',
  chartLine: '#B2C7E5',
  
  // Bottom Nav
  navInactive: '#617c89',
  navActive: '#A8D8B9',
  
  // Icons
  icon: '#343A40',
  iconLight: '#617c89',
};

export const darkTheme = {
  // Background
  background: '#1a1a1a',
  cardBackground: '#2d2d2d',
  
  // Text
  textPrimary: '#e5e7eb',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  
  // Accents
  primary: '#A8D8B9',
  secondary: '#B2C7E5',
  
  // Borders
  border: '#404040',
  
  // Status
  success: '#A8D8B9',
  error: '#f87171',
  warning: '#fbbf24',
  
  // Chart
  chartBar: '#A8D8B9',
  chartLine: '#B2C7E5',
  
  // Bottom Nav
  navInactive: '#9ca3af',
  navActive: '#A8D8B9',
  
  // Icons
  icon: '#e5e7eb',
  iconLight: '#9ca3af',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);
  
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};




