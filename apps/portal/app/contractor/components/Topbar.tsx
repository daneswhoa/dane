import React, { useEffect, useRef } from 'react';
import { ChevronRight, Sun, Moon, Menu, Search } from 'lucide-react';
import NotificationPanel from '../../NotificationPanel';

interface TopbarProps {
  activeTab: 'jobs' | 'profile' | 'wallet';
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export default function Topbar({ activeTab, isDark, onToggleTheme, onToggleSidebar }: TopbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTabLabel = () => {
    switch (activeTab) {
      case 'jobs': return 'Job Board';
      case 'profile': return 'Profile & Network';
      case 'wallet': return 'Earnings & Wallet';
    }
  };

  return (
    <header className="h-14 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-paper-200 dark:border-ink-800 flex items-center justify-between px-4 sticky top-0 z-20 trans-theme">
      <div className="flex items-center gap-2 text-paper-700 dark:text-ink-200">
        <button onClick={onToggleSidebar} className="p-1.5 hover:bg-paper-200 dark:hover:bg-ink-800 rounded-md trans-subtle">
          <Menu className="w-4 h-4 text-paper-500 dark:text-ink-400" />
        </button>
        <span className="font-medium hover:text-paper-900 dark:hover:text-white cursor-pointer trans-subtle hidden sm:inline-block">Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400 hidden sm:inline-block" />
        <span className="text-paper-900 dark:text-white font-medium">{getTabLabel()}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900 trans-subtle focus-within:border-coral-500 focus-within:ring-1 focus-within:ring-coral-500 w-64 lg:w-80 group">
          <Search className="w-3.5 h-3.5 text-paper-400 group-focus-within:text-coral-500" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search commands, jobs, or tenants..." 
            className="bg-transparent border-none outline-none text-xs text-paper-900 dark:text-white placeholder:text-paper-400 dark:placeholder:text-ink-500 flex-1"
          />
          <div className="flex items-center gap-1 opacity-70 group-focus-within:opacity-100 trans-subtle">
            <kbd className="px-1.5 py-0.5 text-[9px] font-semibold text-paper-500 dark:text-ink-400 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-sm shadow-sm">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[9px] font-semibold text-paper-500 dark:text-ink-400 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-sm shadow-sm">K</kbd>
          </div>
        </div>

        {/* Notifications */}
        <NotificationPanel />



        <div className="w-px h-5 bg-paper-200 dark:bg-ink-700 hidden sm:block"></div>

        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded-md text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 border border-transparent hover:border-paper-200 dark:hover:border-ink-700 trans-subtle"
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
