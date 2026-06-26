'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  ChevronRight, 
  Sun, 
  Moon, 
  Wrench, 
  Edit2, 
  Wallet, 
  Plus, 
  PenSquare 
} from 'lucide-react';
import NotificationPanel from '../../NotificationPanel';

interface TopbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onActionClick: (action: string) => void;
}

export default function Topbar({ isDark, onToggleTheme, onActionClick }: TopbarProps) {
  const pathname = usePathname();
  const activeTab = pathname === '/tenant' ? 'home' : pathname.split('/').pop() || 'home';
  
  const getTabTitle = () => {
    switch(activeTab) {
      case 'home': return 'Overview';
      case 'profile': return 'My Profile';
      case 'payments': return 'Payments & Invoices';
      case 'maintenance': return 'Maintenance';
      case 'communications': return 'Communications';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-12 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-paper-200 dark:border-ink-800 flex items-center justify-between px-4 sticky top-0 z-20 trans-theme">
      <div className="flex items-center gap-2 text-paper-700 dark:text-ink-200">
        <span className="font-medium hover:text-paper-900 dark:hover:text-white cursor-pointer trans-subtle hidden sm:inline">Resident Portal</span>
        <ChevronRight className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400 hidden sm:block" />
        <span className="text-paper-900 dark:text-white font-medium">{getTabTitle()}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded-md text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 border border-transparent hover:border-paper-200 dark:hover:border-ink-700 trans-subtle"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <NotificationPanel />
        
        <div className="h-4 w-px bg-paper-200 dark:bg-ink-800 trans-theme"></div>
        
        {/* Dynamic Contextual Actions */}
        {activeTab === 'home' && (
          <button onClick={() => onActionClick('new_request')} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-paper-200 dark:bg-ink-800 text-paper-900 dark:text-white border border-paper-300 dark:border-ink-700 rounded-md hover:bg-paper-300 dark:hover:bg-ink-700 active:scale-95 trans-subtle shadow-sm">
            <Wrench className="w-3.5 h-3.5" /> New Request
          </button>
        )}
        
        {activeTab === 'profile' && (
          <button onClick={() => onActionClick('edit_profile')} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-paper-200 dark:bg-ink-800 text-paper-900 dark:text-white border border-transparent rounded-md hover:bg-paper-300 dark:hover:bg-ink-700 active:scale-95 trans-subtle">
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
        
        {activeTab === 'payments' && (
          <button onClick={() => onActionClick('pay_balance')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-coral-500 hover:bg-coral-600 text-white rounded-lg shadow-sm shadow-coral-500/20 active:scale-95 trans-subtle">
            <Wallet className="w-3.5 h-3.5" /> Pay Balance
          </button>
        )}
        
        {activeTab === 'maintenance' && (
          <button onClick={() => onActionClick('new_request')} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-coral-500 text-white border border-transparent rounded-md hover:bg-coral-600 active:scale-95 trans-subtle shadow-sm shadow-coral-500/20">
            <Plus className="w-3.5 h-3.5" /> Submit Request
          </button>
        )}
        
        {activeTab === 'communications' && (
          <button onClick={() => onActionClick('new_message')} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-coral-500 hover:bg-coral-600 text-white rounded-md shadow-sm shadow-coral-500/20 active:scale-95 trans-subtle">
            <PenSquare className="w-3.5 h-3.5" /> New Message
          </button>
        )}
      </div>
    </header>
  );
}
