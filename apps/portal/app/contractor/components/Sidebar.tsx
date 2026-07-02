import React from 'react';
import { Wrench, ClipboardList, UserCircle, Wallet, ChevronsUpDown } from 'lucide-react';
import { ContractorProfile } from '../types';

interface SidebarProps {
  activeTab: 'jobs' | 'profile' | 'wallet';
  onTabChange: (tab: 'jobs' | 'profile' | 'wallet') => void;
  profile: ContractorProfile | null;
  newJobsCount: number;
  isCollapsed: boolean;
}

export default function Sidebar({ activeTab, onTabChange, profile, newJobsCount, isCollapsed }: SidebarProps) {
  return (
    <aside className={`flex-shrink-0 border-r border-paper-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col h-screen z-20 trans-theme relative transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      {/* Brand Header */}
      <div className={`h-14 border-b border-paper-200 dark:border-ink-800 flex items-center px-3 trans-theme ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
        <div className="w-6 h-6 rounded bg-coral-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
          <Wrench className="w-4 h-4" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <span className="font-semibold text-paper-900 dark:text-white tracking-tight leading-tight">Dane Properties</span>
            <span className="text-[9px] uppercase font-bold text-coral-600 dark:text-coral-400 tracking-widest leading-none">Pro Portal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        
        <div className={`pt-2 pb-1 px-2 ${isCollapsed ? 'text-center' : ''}`}>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-paper-400 dark:text-ink-400">
            {isCollapsed ? 'W' : 'Work'}
          </p>
        </div>
        
        {/* Job Board Tab Link */}
        <button
          onClick={() => onTabChange('jobs')}
          className={`w-full flex items-center px-2 py-1.5 rounded-md trans-subtle group relative ${isCollapsed ? 'justify-center' : 'justify-between'} ${
            activeTab === 'jobs'
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-medium'
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
          title="Job Board"
        >
          <div className="flex items-center gap-2 relative">
            {activeTab === 'jobs' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <ClipboardList className="w-4 h-4" />
            {!isCollapsed && <span className="whitespace-nowrap">Job Board</span>}
            
            {newJobsCount > 0 && isCollapsed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-coral-500"></span>
            )}
          </div>
          {!isCollapsed && newJobsCount > 0 && (
            <span className="text-[10px] bg-coral-100 dark:bg-coral-500/20 border border-coral-200 dark:border-coral-500/30 text-coral-700 dark:text-coral-300 px-1.5 py-0.5 rounded leading-none">
              {newJobsCount} New
            </span>
          )}
        </button>

        <div className={`pt-2 pb-1 px-2 ${isCollapsed ? 'text-center' : ''}`}>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-paper-400 dark:text-ink-400">
            {isCollapsed ? 'B' : 'Business'}
          </p>
        </div>

        {/* Profile & Network Tab Link */}
        <button
          onClick={() => onTabChange('profile')}
          className={`w-full flex items-center px-2 py-1.5 rounded-md trans-subtle group relative ${isCollapsed ? 'justify-center' : 'justify-between'} ${
            activeTab === 'profile'
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-medium'
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
          title="Profile & Network"
        >
          <div className="flex items-center gap-2 relative">
            {activeTab === 'profile' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <UserCircle className="w-4 h-4" />
            {!isCollapsed && <span className="whitespace-nowrap">Profile & Network</span>}
          </div>
        </button>

        {/* Earnings & Wallet Tab Link */}
        <button
          onClick={() => onTabChange('wallet')}
          className={`w-full flex items-center px-2 py-1.5 rounded-md trans-subtle group relative ${isCollapsed ? 'justify-center' : 'justify-between'} ${
            activeTab === 'wallet'
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-medium'
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
          title="Earnings & Wallet"
        >
          <div className="flex items-center gap-2 relative">
            {activeTab === 'wallet' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <Wallet className="w-4 h-4" />
            {!isCollapsed && <span className="whitespace-nowrap">Earnings & Wallet</span>}
          </div>
        </button>
      </nav>

      {/* Contractor User Profile */}
      <div className="p-2 border-t border-paper-200 dark:border-ink-800 trans-theme">
        <button className={`w-full flex items-center px-2 py-1.5 rounded-md hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle ${isCollapsed ? 'justify-center' : 'gap-2 text-left'}`}>
          <div className="relative shrink-0">
            <img 
              src={profile?.photoUrl || `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=150&h=150`} 
              alt="User" 
              className="w-6 h-6 rounded bg-ink-800 object-cover" 
            />
            {isCollapsed && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-ink-950"></span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-paper-900 dark:text-white truncate">
                  {profile?.name || 'Complete Profile'}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                </p>
              </div>
              <ChevronsUpDown className="w-3 h-3 text-paper-400 dark:text-ink-400 shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
