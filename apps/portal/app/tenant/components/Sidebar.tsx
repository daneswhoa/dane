'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  LayoutDashboard, 
  UserCircle, 
  CreditCard, 
  Wrench, 
  FileText, 
  MessageSquare, 
  Megaphone, 
  ChevronsUpDown,
  Sparkles
} from 'lucide-react';
import { TenantProfile } from '../types';

interface SidebarProps {
  profile: TenantProfile | null;
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const activeTab = pathname === '/tenant' ? 'home' : pathname.split('/').pop() || 'home';

  return (
    <aside className="w-56 flex-shrink-0 border-r border-paper-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col h-screen z-20 trans-theme relative hidden md:flex">
      {/* Brand Header */}
      <div className="h-12 border-b border-paper-200 dark:border-ink-800 flex items-center px-3 gap-2 trans-theme">
        <div className="w-6 h-6 rounded bg-coral-500 text-white flex items-center justify-center shadow-sm">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-paper-900 dark:text-white tracking-tight leading-tight">Landlord.nl</span>
          <span className="text-[9px] uppercase font-bold text-coral-600 dark:text-coral-400 tracking-widest leading-none">Resident Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        
        {/* Home Tab */}
        <Link 
          href="/tenant"
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
            activeTab === 'home' 
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'home' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <LayoutDashboard className="w-4 h-4" /> Home
          </div>
        </Link>

        {/* Profile Tab */}
        <Link 
          href="/tenant/profile"
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
            activeTab === 'profile' 
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'profile' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <UserCircle className="w-4 h-4" /> My Profile
          </div>
        </Link>
        
        <div className="pt-3 pb-1 px-2">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-paper-400 dark:text-ink-400">My Home</p>
        </div>

        {/* Payments Tab */}
        <Link 
          href="/tenant/payments"
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
            activeTab === 'payments' 
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'payments' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <CreditCard className="w-4 h-4" /> Payments & Invoices
          </div>
        </Link>

        {/* Maintenance Tab */}
        <Link 
          href="/tenant/maintenance"
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
            activeTab === 'maintenance' 
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'maintenance' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <Wrench className="w-4 h-4" /> Maintenance
          </div>
          <span className="text-[10px] bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-paper-600 dark:text-ink-300 px-1.5 py-0.5 rounded leading-none">1 Open</span>
        </Link>

        {/* Sophia AI Assistant */}
        <Link 
          href="/tenant/sophia"
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
            activeTab === 'sophia' 
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'sophia' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <Sparkles className="w-4 h-4 text-coral-500" /> Sophia AI
          </div>
        </Link>
        
        <div className="pt-3 pb-1 px-2">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-paper-400 dark:text-ink-400">Community</p>
        </div>

        {/* Communications Tab */}
        <Link 
          href="/tenant/communications"
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
            activeTab === 'communications' 
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
              : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeTab === 'communications' && (
              <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
            )}
            <MessageSquare className="w-4 h-4" /> Communications
          </div>
          <span className="text-[10px] bg-coral-100 dark:bg-coral-500/20 border border-coral-200 dark:border-coral-500/30 text-coral-700 dark:text-coral-300 px-1.5 py-0.5 rounded leading-none">2 New</span>
        </Link>
        
        {/* Inactive Announcements */}
        <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle opacity-60 cursor-not-allowed">
          <Megaphone className="w-4 h-4" /> Announcements
        </div>
      </nav>

      {/* Tenant User Profile */}
      <div className="p-2 border-t border-paper-200 dark:border-ink-800 trans-theme">
        <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle text-left">
          <img src={profile?.photoUrl || `https://placehold.co/24x24/1e2129/ffffff?text=${profile?.name?.charAt(0) || 'U'}`} alt="User" className="w-6 h-6 rounded bg-ink-800 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-paper-900 dark:text-white truncate">{profile?.name || 'Resident'}</p>
            <p className="text-[10px] text-paper-500 dark:text-ink-400 truncate flex items-center gap-1">
              {profile?.building ? `${profile.building}, Unit ${profile.unit}` : 'No Active Property'}
            </p>
          </div>
          <ChevronsUpDown className="w-3 h-3 text-paper-400 dark:text-ink-400" />
        </div>
      </div>
    </aside>
  );
}
