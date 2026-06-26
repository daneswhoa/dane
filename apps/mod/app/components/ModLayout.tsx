'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, Users, UserCog, UserCheck, HardHat, 
  ChevronDown, ChevronRight, Settings, Activity, Building, Briefcase, 
  LogOut, Bell, Search, Globe, ChevronLeft, Menu
} from 'lucide-react';

interface ModLayoutProps {
  children: React.ReactNode;
}

export default function ModLayout({ children }: ModLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);

  // Auto-expand dropdown if active
  useEffect(() => {
    if (pathname.startsWith('/users')) {
      setUsersDropdownOpen(true);
    }
  }, [pathname]);

  const navItems = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard },
    { name: 'Platform Activity', href: '/activity', icon: Activity },
    { name: 'Organizations', href: '/organizations', icon: Briefcase },
    { name: 'Properties', href: '/properties', icon: Building },
  ];

  const userItems = [
    { name: 'Landlords', href: '/users/landlords', icon: UserCog },
    { name: 'Tenants', href: '/users/tenants', icon: UserCheck },
    { name: 'Contractors', href: '/users/contractors', icon: HardHat },
    { name: 'Platform Admins', href: '/users/admins', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 font-sans text-paper-900 dark:text-ink-50 flex overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-50 h-full transition-all duration-300 ease-in-out border-r border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-900 flex flex-col ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-paper-200 dark:border-ink-800 flex-shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'md:justify-center'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap">
                <h1 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 uppercase">
                  Admin Control
                </h1>
                <p className="text-[9px] text-paper-500 dark:text-ink-400 font-medium tracking-wider">System Administration</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
          
          <div className="mb-4">
            {isSidebarOpen && <p className="px-3 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-2">Core Functions</p>}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1 ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm shadow-indigo-500/5' 
                      : 'text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'
                  }`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-paper-400 dark:text-ink-500'}`} />
                    {isSidebarOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mb-4">
            {isSidebarOpen && <p className="px-3 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-2 mt-6">Directory</p>}
            
            {/* Dropdown Toggle */}
            <div 
              onClick={() => {
                if (!isSidebarOpen) setIsSidebarOpen(true);
                setUsersDropdownOpen(!usersDropdownOpen);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                pathname.startsWith('/users') 
                  ? 'bg-paper-100 dark:bg-ink-800/80 text-paper-900 dark:text-white font-semibold' 
                  : 'text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/users') ? 'text-indigo-500' : 'text-paper-400 dark:text-ink-500'}`} />
                {isSidebarOpen && <span className="text-sm whitespace-nowrap">User Management</span>}
              </div>
              {isSidebarOpen && (
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${usersDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </div>

            {/* Dropdown Items */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isSidebarOpen && usersDropdownOpen ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'
            }`}>
              <div className="pl-11 pr-2 py-1 space-y-1 border-l-2 border-paper-100 dark:border-ink-800 ml-5">
                {userItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                          : 'text-paper-500 dark:text-ink-400 hover:bg-paper-50 dark:hover:bg-ink-800/60 hover:text-paper-800 dark:hover:text-ink-200'
                      }`}>
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'opacity-70'}`} />
                        <span className="text-[13px] whitespace-nowrap">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-4">
            {isSidebarOpen && <p className="px-3 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-2 mt-6">System</p>}
            <Link href="/settings">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                pathname === '/settings' 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}>
                <Settings className={`w-5 h-5 flex-shrink-0 ${pathname === '/settings' ? 'text-indigo-600' : 'text-paper-400'}`} />
                {isSidebarOpen && <span className="text-sm whitespace-nowrap">Global Settings</span>}
              </div>
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-paper-200 dark:border-ink-800">
          <button className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-paper-600 dark:text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-paper-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-paper-500 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-paper-100 dark:bg-ink-950 rounded-lg text-paper-500 dark:text-ink-400">
              <Search className="w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search ID, Email, IP..." 
                className="bg-transparent border-none outline-none text-xs w-48 lg:w-64 focus:w-72 transition-all placeholder:text-paper-400 dark:placeholder:text-ink-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-paper-500 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors">
              <Globe className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-ink-900"></span>
            </button>
            <button className="relative p-2 rounded-full text-paper-500 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-ink-900 flex items-center justify-center text-[9px] text-white font-bold">
                3
              </span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-white dark:border-ink-900 shadow-sm ml-2 cursor-pointer flex items-center justify-center text-white text-xs font-bold">
              SYS
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>

      </main>

    </div>
  );
}
