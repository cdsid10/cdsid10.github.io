import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

/**
 * CONFIGURATION CONSTANTS
 * [GLOBAL]
 * Centralized settings for the themeing system to ensure consistency 
 * and easy adjustments to storage keys or animation speeds.
 */
const THEME_CONFIG = {
  STORAGE_KEY: 'theme',
  DARK_CLASS: 'dark',
  TRANSITION_DURATION: 'duration-150', // Speed of icon rotation/fade
};

interface ThemeToggleProps {
  hideText?: boolean;
  iconSize?: number;
}

export default function ThemeToggle({ 
  hideText = false, 
  iconSize = 16 
}: ThemeToggleProps) {
  // --- STATE ---
  const [isDark, setIsDark] = useState(false);

  /**
   * [GLOBAL] Theme Initialization
   * This effect runs once on mount to synchronize the UI state with the 
   * user's saved preference or their operating system's dark mode setting.
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Logic: LocalStorage takes priority, otherwise fallback to System Settings
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add(THEME_CONFIG.DARK_CLASS);
    } else {
      document.documentElement.classList.remove(THEME_CONFIG.DARK_CLASS);
    }
  }, []);

  /**
   * [GLOBAL] Theme Switcher Logic
   * Handles the manual override of the theme. 
   * It updates: 
   * 1. The React state (for icon animation)
   * 2. The Document Root class (for Tailwind CSS dark: variants)
   * 3. LocalStorage (for persistence across sessions)
   */
  const toggleTheme = () => {
    const newDarkStatus = !isDark;
    
    setIsDark(newDarkStatus);
    
    if (newDarkStatus) {
      document.documentElement.classList.add(THEME_CONFIG.DARK_CLASS);
      localStorage.setItem(THEME_CONFIG.STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove(THEME_CONFIG.DARK_CLASS);
      localStorage.setItem(THEME_CONFIG.STORAGE_KEY, 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 py-1 text-sm text-muted opacity-60 transition-all duration-150 group",
        "hover:opacity-100" // [DESKTOP] Visual feedback on mouse hover
      )}
      aria-label="Toggle visual theme"
    >
      {/* 
        Icon Container 
        [GLOBAL]
        Uses absolute positioning to stack icons. 
        The theme change triggers a 'rotation + scale' animation for a high-end feel.
      */}
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <Sun 
          size={iconSize} 
          className={cn(
            "absolute inset-0 transition-all",
            THEME_CONFIG.TRANSITION_DURATION,
            isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          )} 
        />
        <Moon 
          size={iconSize} 
          className={cn(
            "absolute inset-0 transition-all",
            THEME_CONFIG.TRANSITION_DURATION,
            isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          )} 
        />
      </div>

      {/* 
        Text Label 
        [MOBILE] 
        Typically hidden in the mobile header (hideText=true) to save horizontal space.
        [DESKTOP] 
        Shown in the Sidebar for clarity.
      */}
      {!hideText && (
        <span className="uppercase tracking-[2px] text-[10px] font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}