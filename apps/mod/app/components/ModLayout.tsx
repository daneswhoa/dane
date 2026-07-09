'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@repo/auth';
import { 
  ShieldCheck, LayoutDashboard, Users, Building, Globe, Briefcase, 
  LogOut, Bell, Search, Sun, Moon, Menu, ChevronRight, ChevronDown,
  UserCheck, Wrench, Shield, ClipboardList, Sparkles, Flag, BarChart3,
  Activity, ScrollText, Coins
} from 'lucide-react';

interface ModLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function ModLayout({ children, title }: ModLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(true);

  // Initialize and track theme
  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem('theme') || 'dark';
    setIsDark(initialTheme === 'dark');
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Keep dropdown open if we are on a user route
  useEffect(() => {
    if (pathname.startsWith('/users')) {
      setIsUsersDropdownOpen(true);
    }
  }, [pathname]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const coreItems = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Syndication', href: '/syndication', icon: Globe },
    { name: 'Organizations', href: '/organizations', icon: Briefcase },
  ];

  const userItems = [
    { name: 'Tenants', href: '/users/tenants', icon: UserCheck },
    { name: 'Contractors', href: '/users/contractors', icon: Wrench },
    { name: 'Managers', href: '/users/managers', icon: ClipboardList },
    { name: 'Moderators', href: '/users/moderators', icon: Shield },
  ];

  const aiItems = [
    { name: 'Sophia AI', href: '/sophia', icon: Sparkles },
  ];

  const modQueueItems = [
    { name: 'Flags & Reports', href: '/reports', icon: Flag },
  ];

  const systemItems = [
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Rate Limits', href: '/system/limits', icon: Activity },
    { name: 'Audit Trail', href: '/system/audit', icon: ScrollText },
    { name: 'Credits & Ledger', href: '/system/credits', icon: Coins },
  ];

  const user = session?.user;
  const userRole = (user as any)?.role || '';
  const isAuthorized = userRole === 'moderator' || userRole === 'admin';

  // Handle Loading
  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-ink-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-coral-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">Checking auth session...</p>
        </div>
      </div>
    );
  }

  // Handle Unauthorized
  if (!isAuthorized) {
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-ink-50 font-sans p-6">
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center trans-theme">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/25 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-paper-950 dark:text-white leading-tight">Access Restricted</h2>
            <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">
              You do not have the required moderator credentials to view this control panel. 
              {user ? (
                <span> Currently logged in as <strong className="text-paper-900 dark:text-white font-mono">{user.email}</strong> with role <strong className="text-coral-500 uppercase">{userRole}</strong>.</span>
              ) : (
                <span> You are not currently logged in.</span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <a 
              href={`${portalUrl}/login`}
              className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center"
            >
              Sign in with Moderator Account
            </a>
            
            {user && (
              <button 
                onClick={async () => {
                  await signOut();
                  router.push(`${portalUrl}/login`);
                }}
                className="w-full py-2.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-700 dark:text-ink-200 rounded-xl text-xs font-bold transition-colors"
              >
                Log Out Current Session
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const fullName = user?.name || 'Moderator User';
  const roleDisplay = userRole.toUpperCase() || 'PLATFORM MOD';
  
  const getInitials = (name: string) => {
    if (!name) return 'MD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(fullName);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-ink-50 trans-theme">
      {/* Sidebar */}
      <aside 
        className={`flex-shrink-0 border-r border-paper-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col h-full z-20 trans-theme relative transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-56' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-12 border-b border-paper-200 dark:border-ink-800 flex items-center px-3 gap-2 trans-theme overflow-hidden flex-shrink-0">
          <div className="w-6 h-6 rounded bg-coral-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-paper-900 dark:text-white tracking-tight leading-tight">EstateSync</span>
              <span className="text-[9px] uppercase font-bold text-coral-600 dark:text-coral-400 tracking-widest leading-none">Control Center</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* SECTION 1: Core Workspace */}
          <div className="space-y-0.5">
            {isSidebarOpen && (
              <p className="text-[9px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-500 px-2 mb-1.5">Core Workspace</p>
            )}
            {coreItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
                      isActive 
                        ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
                        : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="nav-indicator absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
                      )}
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-coral-500' : 'text-paper-500 dark:text-ink-300'}`} />
                      {isSidebarOpen && <span className="text-xs whitespace-nowrap">{item.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* SECTION 2: Directory & Access */}
          <div className="space-y-0.5">
            {isSidebarOpen && (
              <p className="text-[9px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-500 px-2 mb-1.5">Directories & Access</p>
            )}
            
            {/* Users Tab with Dropdown */}
            <div className="space-y-0.5">
              <div 
                onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md font-medium trans-subtle cursor-pointer ${
                  pathname.startsWith('/users')
                    ? 'bg-paper-200/50 dark:bg-ink-900/50 text-paper-900 dark:text-white' 
                    : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${pathname.startsWith('/users') ? 'text-coral-500' : 'text-paper-500 dark:text-ink-300'}`} />
                  {isSidebarOpen && <span className="text-xs whitespace-nowrap">Users</span>}
                </div>
                {isSidebarOpen && (
                  <ChevronDown className={`w-3.5 h-3.5 text-paper-400 dark:text-ink-500 transition-transform duration-200 ${isUsersDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Users Dropdown Menu */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isUsersDropdownOpen && isSidebarOpen ? 'max-h-48 opacity-100 mt-1 pl-4 space-y-0.5 border-l border-paper-200 dark:border-ink-800 ml-4' : 'max-h-0 opacity-0 pointer-events-none'
              }`}>
                {userItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div 
                        className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer relative ${
                          isActive 
                            ? 'text-coral-500 font-semibold' 
                            : 'text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-coral-500"></span>
                        )}
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: AI Assistance */}
          <div className="space-y-0.5">
            {isSidebarOpen && (
              <p className="text-[9px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-500 px-2 mb-1.5">AI Assistance</p>
            )}
            {aiItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`flex items-center px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
                      isActive 
                        ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
                        : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="nav-indicator absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
                      )}
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-coral-500' : 'text-paper-500 dark:text-ink-300'}`} />
                      {isSidebarOpen && <span className="text-xs whitespace-nowrap">{item.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* SECTION 4: Moderation Queue */}
          <div className="space-y-0.5">
            {isSidebarOpen && (
              <p className="text-[9px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-500 px-2 mb-1.5">Moderation Queue</p>
            )}
            {modQueueItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`flex items-center px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
                      isActive 
                        ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
                        : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="nav-indicator absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
                      )}
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-coral-500' : 'text-paper-500 dark:text-ink-300'}`} />
                      {isSidebarOpen && <span className="text-xs whitespace-nowrap">{item.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* SECTION 5: System Controls */}
          <div className="space-y-0.5">
            {isSidebarOpen && (
              <p className="text-[9px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-500 px-2 mb-1.5">System Controls</p>
            )}
            {systemItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`flex items-center px-2 py-1.5 rounded-md font-medium trans-subtle relative group cursor-pointer ${
                      isActive 
                        ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400' 
                        : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="nav-indicator absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse-slow"></span>
                      )}
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-coral-500' : 'text-paper-500 dark:text-ink-300'}`} />
                      {isSidebarOpen && <span className="text-xs whitespace-nowrap">{item.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin User Profile */}
        <div className="p-2 border-t border-paper-200 dark:border-ink-800 trans-theme overflow-hidden flex-shrink-0">
          {isSidebarOpen ? (
            <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-paper-50 dark:bg-ink-900/50 border border-paper-200/50 dark:border-ink-800/50">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-coral-500 to-coral-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-paper-900 dark:text-white truncate leading-none">{fullName}</p>
                <p className="text-[9px] text-coral-600 dark:text-coral-400 font-medium tracking-wide mt-0.5">{roleDisplay}</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center py-1">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-coral-500 to-coral-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                {initials}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-12 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-paper-200 dark:border-ink-800 flex items-center justify-between px-4 sticky top-0 z-10 trans-theme flex-shrink-0">
          <div className="flex items-center gap-2 text-paper-700 dark:text-ink-200">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-300 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="font-medium text-xs hover:text-paper-900 dark:hover:text-white cursor-pointer trans-subtle">Control Center</span>
            <ChevronRight className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400" />
            <span className="text-paper-900 dark:text-white font-semibold text-xs">{title}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg text-paper-500 dark:text-ink-400">
              <Search className="w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-transparent border-none outline-none text-[11px] w-40 focus:w-56 transition-all placeholder:text-paper-400 dark:placeholder:text-ink-600"
              />
            </div>

            <div className="h-4 w-px bg-paper-200 dark:bg-ink-800 trans-theme"></div>

            {/* Notification Badge */}
            <button className="relative p-1.5 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-300 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-coral-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
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

        {/* Tab Content Wrap */}
        <div className="flex-1 overflow-y-auto bg-paper-50 dark:bg-ink-900 p-6">
          <div className="w-full animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
