import React from 'react';
import { ChevronRight, Search, Sun, Moon, Plus, Sparkles, History, ArrowUpRight, Lock, UserPlus, QrCode, DownloadCloud, Menu } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

interface TopbarProps {
  activeTabLabel: string;
  activeSubLabel: string;
  isDark: boolean;
  onToggleTheme: () => void;
  activeTab: string;
  crumbs?: string[];
  onToggleMobileSidebar?: () => void;
}

export default function Topbar({
  activeTabLabel,
  activeSubLabel,
  isDark,
  onToggleTheme,
  activeTab,
  crumbs,
  onToggleMobileSidebar
}: TopbarProps) {
  const isFinanceTab = ['ledger', 'invoices', 'wallet'].includes(activeTab);
  const isSophiaTab = activeTab === 'sophia';
  const isWalletTab = activeTab === 'wallet';
  const isTeamTab = activeTab === 'team';
  const isSecurityTab = activeTab === 'security';

  return (
    <header className="h-12 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-paper-200 dark:border-ink-800 flex items-center justify-between px-4 sticky top-0 z-10 transition-colors duration-200">
      {/* Breadcrumbs / Sophia Status */}
      <div className="flex items-center gap-2 text-paper-700 dark:text-ink-200">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1 mr-1 rounded hover:bg-paper-250 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        {isSophiaTab ? (
          <div className="flex items-center gap-2 bg-coral-50 dark:bg-coral-500/10 px-2 py-1 rounded-md border border-coral-100 dark:border-coral-500/20">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-coral-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
              <Sparkles className="w-3.5 h-3.5 text-coral-600 dark:text-coral-400 relative z-10" />
            </div>
            <span className="font-semibold text-coral-700 dark:text-coral-300 tracking-tight text-xs">Sophia AI Online</span>
          </div>
        ) : crumbs && crumbs.length > 0 ? (
          crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />}
              <span className={`text-xs ${idx === crumbs.length - 1 ? 'font-medium text-paper-900 dark:text-white' : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white cursor-pointer transition-colors'}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))
        ) : (
          <>
            <span className="font-medium hover:text-paper-900 dark:hover:text-white cursor-pointer transition-colors text-xs">
              {activeTabLabel}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400" />
            <span className="text-paper-900 dark:text-white font-medium text-xs">
              {activeSubLabel}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isSophiaTab ? (
          <button className="text-xs text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-all flex items-center gap-1.5 bg-paper-100 dark:bg-ink-800 px-2.5 py-1 rounded-md border border-paper-200 dark:border-ink-700 active:scale-95 shadow-sm">
            <History className="w-3.5 h-3.5" />
            Session History
          </button>
        ) : (
          /* Search */
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isFinanceTab ? "Search transactions, accounts..." : "Search..."}
              className="w-64 pl-7 pr-2 py-1 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors duration-200 placeholder-paper-400 dark:placeholder-ink-400"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <kbd className="font-mono text-[9px] bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300 px-1 rounded border border-paper-300 dark:border-ink-700">⌘</kbd>
              <kbd className="font-mono text-[9px] bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300 px-1 rounded border border-paper-300 dark:border-ink-700">K</kbd>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          id="themeToggle"
          className="w-7 h-7 flex items-center justify-center rounded-md text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 border border-transparent hover:border-paper-200 dark:hover:border-ink-700 transition-all duration-150"
          title="Toggle Theme Mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {!isSophiaTab && (
          <NotificationPanel />
        )}

        {/* Wallet-specific action */}
        {isWalletTab && (
          <>
            <div className="h-4 w-px bg-paper-200 dark:bg-ink-800 transition-colors duration-200"></div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-coral-500 text-white rounded-md hover:bg-coral-600 active:scale-95 transition-all duration-150 shadow-sm shadow-coral-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw Funds
            </button>
          </>
        )}

        {/* Ledger/Invoices action */}
        {isFinanceTab && !isWalletTab && (
          <>
            <div className="h-4 w-px bg-paper-200 dark:bg-ink-800 transition-colors duration-200"></div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-coral-500 text-white rounded-md hover:bg-coral-600 active:scale-95 transition-all duration-150 shadow-sm shadow-coral-500/20">
              <Plus className="w-3.5 h-3.5" />
              Journal Entry
            </button>
          </>
        )}

        {/* Team-specific actions */}
        {isTeamTab && (
          <>
            <div className="h-4 w-px bg-paper-200 dark:bg-ink-800 transition-colors duration-200"></div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-900 dark:text-white rounded-md hover:bg-paper-50 dark:hover:bg-ink-700 transition-all shadow-sm">
              <QrCode className="w-3.5 h-3.5 text-coral-500" />
              Invite Tenant
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-coral-500 text-white rounded-md hover:bg-coral-600 active:scale-95 transition-all duration-150 shadow-sm shadow-coral-500/20">
              <UserPlus className="w-3.5 h-3.5" />
              Add Team Member
            </button>
          </>
        )}

        {/* Security-specific actions */}
        {isSecurityTab && (
          <>
            <div className="h-4 w-px bg-paper-200 dark:bg-ink-800 transition-colors duration-200"></div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-900 dark:text-white rounded-md hover:bg-paper-50 dark:hover:bg-ink-700 transition-all shadow-sm">
              <DownloadCloud className="w-3.5 h-3.5 text-paper-500" />
              Export Logs
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-coral-500 text-white rounded-md hover:bg-coral-600 active:scale-95 transition-all duration-150 shadow-sm shadow-coral-500/20">
              <Lock className="w-3.5 h-3.5" />
              Security Policies
            </button>
          </>
        )}
      </div>
    </header>
  );
}
