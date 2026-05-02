import { Sun, Moon, Sparkles, Wifi, WifiOff, Layers } from 'lucide-react';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenStandup: () => void;
  isConnected: boolean;
  taskCount: number;
}

export function Header({ theme, onToggleTheme, onOpenStandup, isConnected, taskCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700 shadow-sm">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-brand-500 to-violet-600 rounded-xl shadow-md shadow-brand-500/30">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent leading-none">
              SyncBoard
            </h1>
            <p className="text-xs text-surface-400 dark:text-surface-500 leading-none mt-0.5">
              Real-time team coordination
            </p>
          </div>
        </div>

        {/* Centre: live indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Wifi size={13} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff size={13} className="text-red-400" />
              <span className="text-xs font-semibold text-red-500">Offline</span>
            </>
          )}
          <span className="text-xs text-surface-400">·</span>
          <span className="text-xs text-surface-500 dark:text-surface-400">
            {taskCount} task{taskCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Standup button */}
          <button
            id="standup-btn"
            onClick={onOpenStandup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            aria-label="Generate AI standup summary"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Standup</span>
          </button>

          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
