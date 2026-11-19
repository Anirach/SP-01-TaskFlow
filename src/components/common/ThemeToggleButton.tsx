import { Moon, Sun } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ThemeToggleButtonProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggleButton({
  showLabel = false,
  className = '',
}: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useWorkspace();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#172B4D] dark:hover:text-white transition-colors shrink-0 ${
        showLabel ? 'px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900' : ''
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-[14px] font-medium whitespace-nowrap">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
}
