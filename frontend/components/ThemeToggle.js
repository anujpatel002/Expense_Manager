import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

const ThemeToggle = () => {
  const { currentTheme, themes, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-surface border border-border hover:bg-card transition-all duration-200 hover:scale-105"
        title="Change Theme"
      >
        <Palette className="h-5 w-5 text-text" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-48 bg-card border border-border rounded-xl shadow-2xl p-2">
            <div className="text-sm font-medium text-text mb-2 px-3 py-1">
              Choose Theme
            </div>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  toggleTheme(key);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-border"
                    style={{ background: theme.colors.gradient }}
                  />
                  <span className="text-text text-sm">{theme.name}</span>
                </div>
                {currentTheme === key && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;