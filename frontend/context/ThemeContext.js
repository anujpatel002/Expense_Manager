import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      card: '#334155',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#475569',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      primary: '#00ff88',
      secondary: '#ff0080',
      accent: '#00d4ff',
      background: '#0a0a0a',
      surface: '#1a1a2e',
      card: '#16213e',
      text: '#00ff88',
      textSecondary: '#8892b0',
      border: '#233554',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff0080',
      gradient: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 50%, #ff0080 100%)'
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      card: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #8b5cf6 100%)'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      background: '#fefcfb',
      surface: '#fff7ed',
      card: '#ffffff',
      text: '#9a3412',
      textSecondary: '#ea580c',
      border: '#fed7aa',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // Apply CSS variables
    const root = document.documentElement;
    const theme = themes[currentTheme];
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme: themes[currentTheme],
      themes,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};