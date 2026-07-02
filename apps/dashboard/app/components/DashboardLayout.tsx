'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from '@repo/auth';
import { Building, Camera } from 'lucide-react';
import { usePermissionsStore } from '../store/usePermissionsStore';
import { io } from 'socket.io-client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProfileSettingsModal from './ProfileSettingsModal';

interface SidebarMetrics {
  properties: { count: number; hasPending: boolean };
  tenants: { count: number };
  invoices: { count: number; hasOverdue: boolean };
  maintenance: { count: number; hasNonReviewed: boolean; hasCompletedUnpaid: boolean };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { syncUser } = usePermissionsStore();

  const [metrics, setMetrics] = useState<SidebarMetrics | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [redirectPopup, setRedirectPopup] = useState<{ active: boolean; path: string; secondsLeft: number } | null>(null);
  const [profileOrgName, setProfileOrgName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/profile`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProfileOrgName(data.organizationName);
          // Sync permissions using the full profile from DB (which includes the real role)
          syncUser(data);
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [session]);

  // Sync client-side navigation logging to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      try {
        const historyStr = localStorage.getItem('sophia_navigation_history') || '[]';
        let history = JSON.parse(historyStr);
        if (!Array.isArray(history)) history = [];

        // Log page view if list is empty or the path changes
        if (history.length === 0 || history[history.length - 1].path !== pathname) {
          history.push({
            path: pathname,
            timestamp: new Date().toISOString(),
          });
          // Cap at 30 items
          localStorage.setItem('sophia_navigation_history', JSON.stringify(history.slice(-30)));
        }
      } catch (e) {
        console.error('Error logging navigation history:', e);
      }
    }
  }, [pathname]);

  // Connect to Sophia's WebSocket event gateway
  useEffect(() => {
    if (!session?.user) return;

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`) + '/events';
    const socketClient = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socketClient);

    socketClient.on('sophia-action', (action: { type: string; theme?: 'dark' | 'light'; action?: 'expand' | 'collapse'; path?: string }) => {
      if (action.type === 'theme' && action.theme) {
        const root = document.documentElement;
        if (action.theme === 'dark') {
          root.setAttribute('data-theme', 'dark');
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          setIsDark(true);
        } else {
          root.setAttribute('data-theme', 'light');
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
          setIsDark(false);
        }
      } else if (action.type === 'sidebar' && action.action) {
        setSidebarCollapsed(action.action === 'collapse');
      } else if (action.type === 'navigate' && action.path) {
        // Show redirection countdown
        setRedirectPopup({
          active: true,
          path: action.path,
          secondsLeft: 5,
        });
      }
    });

    return () => {
      socketClient.disconnect();
    };
  }, [session]);

  // Handle countdown redirects
  useEffect(() => {
    if (!redirectPopup || !redirectPopup.active) return;

    if (redirectPopup.secondsLeft <= 0) {
      router.push(redirectPopup.path);
      setRedirectPopup(null);
      return;
    }

    const timer = setTimeout(() => {
      setRedirectPopup(prev => prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectPopup, router]);

  const handleCancelRedirect = () => {
    if (socket && redirectPopup) {
      socket.emit('sophia-message', {
        message: `[System Notification: User cancelled the redirection to "${redirectPopup.path}"]`,
        navigationHistory: JSON.parse(localStorage.getItem('sophia_navigation_history') || '[]')
      });
    }
    setRedirectPopup(null);
  };

  // NOTE: syncUser is called inside the profile fetch effect above,
  // using the full DB profile (which includes the real `role` field).
  // Do NOT call syncUser(session.user) — better-auth session does not include custom fields.

  useEffect(() => {
    if (!session?.user) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/sidebar-metrics`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch sidebar metrics:', err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [session]);

  // Determine activeTab from current path
  const getActiveTabFromPathname = (path: string): string => {
    if (path.startsWith('/finance/expenses')) return 'expenses';
    if (path.startsWith('/finance/invoices')) return 'invoices';
    if (path.startsWith('/finance/wallet')) return 'wallet';
    if (path.startsWith('/communication/announcements')) return 'announcements';
    if (path.startsWith('/communication/broadcasts')) return 'broadcasts';
    if (path.startsWith('/communication/automations')) return 'automations';
    if (path.startsWith('/communication/templates')) return 'templates';
    if (path.startsWith('/sophia')) return 'sophia';
    if (path.startsWith('/workspace')) return 'sophia';
    
    // Remove leading slash to get tab name
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'expenses';
    return parts[0];
  };

  const activeTab = getActiveTabFromPathname(pathname);

  // Set page path helper
  const navigateToTab = (tabId: string) => {
    if (tabId === 'expenses') router.push('/finance/expenses');
    else if (tabId === 'invoices') router.push('/finance/invoices');
    else if (tabId === 'wallet') router.push('/finance/wallet');
    else if (tabId === 'announcements') router.push('/communication/announcements');
    else if (tabId === 'broadcasts') router.push('/communication/broadcasts');
    else if (tabId === 'automations') router.push('/communication/automations');
    else if (tabId === 'templates') router.push('/communication/templates');
    else if (tabId === 'sophia') router.push('/sophia');
    else if (tabId === 'workspace') router.push('/sophia');
    else router.push(`/${tabId}`);
  };

  // Theme state
  const [isDark, setIsDark] = useState(true);
  const [loadingFact, setLoadingFact] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  // Sync initial theme
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    setIsDark(currentTheme === 'dark');
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const facts = [
      "Sophia can automatically monitor utility usage anomalies to prevent unexpected leaks.",
      "Landlords using Dane Properties report up to 40% faster maintenance ticket resolution.",
      "Did you know? Consistent tenant communications reduce lease renewal drop-offs by 25%.",
      "You can configure quiet hours to silence non-emergency maintenance notifications."
    ];
    setLoadingFact(facts[Math.floor(Math.random() * facts.length)]);
  }, []);



  // Check auth session
  useEffect(() => {
    if (!isPending) {
      if (!session) {
        const loginUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
        const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
        router.push(`${loginUrl}/login?redirect=${encodeURIComponent(currentUrl)}`);
      } else {
        const role = (session.user as any)?.role;
        if (role === 'tenant' || role === 'contractor') {
          const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
          router.push(role === 'tenant' ? `${portalUrl}/tenant` : `${portalUrl}/contractor`);
        }
      }
    }
  }, [session, isPending, router]);

  // Handle Log Out
  const handleSignOut = async () => {
    await signOut();
    const loginUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
    router.push(`${loginUrl}/login`);
  };

  // Toggle Theme
  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  const handleSetupOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setSetupError('');
    setSetupLoading(true);

    const form = e.target as HTMLFormElement;
    const orgName = (form.elements.namedItem('orgName') as HTMLInputElement).value;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const logoInput = form.elements.namedItem('logo') as HTMLInputElement;

    const formData = new FormData();
    formData.append('organizationName', orgName);
    formData.append('username', username);
    formData.append('userId', session.user.id);
    if (logoInput.files && logoInput.files[0]) {
      formData.append('logo', logoInput.files[0]);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/setup`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to setup organization');
      }

      // Reload window to refresh session and remove forced modal
      window.location.reload();
    } catch (err: any) {
      setSetupError(err.message || 'Failed to setup organization');
    } finally {
      setSetupLoading(false);
    }
  };

  // Loading screen
  if (isPending || !session) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ink-950 transition-colors duration-500 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-coral-500/10 via-ink-950 to-ink-950 opacity-60"></div>
        
        <div className="relative flex items-center justify-center mb-12">
          {/* Abstract HUD Rings */}
          <div className="absolute w-40 h-40 border border-coral-500/10 rounded-full animate-[spin_8s_linear_infinite]"></div>
          <div className="absolute w-32 h-32 border-t border-r border-coral-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
          <div className="absolute w-24 h-24 bg-coral-500/5 rounded-full animate-pulse shadow-[0_0_40px_rgba(255,107,107,0.2)]"></div>
          
          {/* Central Logo */}
          <div className="relative z-10 w-16 h-16 bg-ink-900/80 backdrop-blur-xl border border-ink-800 rounded-2xl shadow-2xl flex items-center justify-center">
            <Building className="w-8 h-8 text-coral-500 animate-pulse" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm text-center px-6">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2 animate-fade-in">
            Initializing Workspace
          </h2>
          <p className="text-xs text-ink-400 mb-8 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            Syncing properties, tenants, and financial data...
          </p>
          
          {/* Sleek indeterminate progress bar */}
          <div className="w-full h-1 bg-ink-900 rounded-full overflow-hidden shadow-inner relative animate-fade-in mb-8" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-coral-500 to-transparent rounded-full animate-[shimmer_2s_ease-in-out_infinite_alternate]"></div>
          </div>

          {/* Sophia Insight Card */}
          <div className="bg-ink-900/50 backdrop-blur-md border border-ink-800/50 rounded-xl p-4 text-left animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
             <div className="text-[9px] font-bold text-coral-500 tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse"></span>
                Sophia Insight
             </div>
             <p className="text-xs text-ink-300 leading-relaxed font-medium">
               {loadingFact || "Loading your intelligent property dashboard..."}
             </p>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer {
            0% { transform: translateX(-200%); }
            100% { transform: translateX(300%); }
          }
        `}} />
      </div>
    );
  }

  // Initials for User Avatar
  const userInitials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'JD';

  // Breadcrumbs mapping
  const getCrumbs = (tab: string): string[] => {
    switch (tab) {
      case 'overview':
        return ['Overview', 'Q3 Performance'];
      case 'workspace':
      case 'sophia':
        return ['Agent Workspace', 'Sophia AI'];
      case 'properties':
        return ['Core', 'Properties'];
      case 'tenants':
        return ['Core', 'Tenants'];
      case 'expenses':
        return ['Finance', 'Payments & Expenses'];
      case 'invoices':
        return ['Finance', 'Invoices'];
      case 'wallet':
        return ['Finance', 'Wallet'];
      case 'maintenance':
        return ['Operations', 'Maintenance Hub'];
      case 'contractors':
        return ['Operations', 'Contractors'];
      case 'announcements':
        return ['Operations', 'Communication', 'Announcements'];
      case 'broadcasts':
        return ['Operations', 'Communication', 'Email Broadcasts'];
      case 'automations':
        return ['Operations', 'Communication', 'Automations'];
      case 'templates':
        return ['Operations', 'Communication', 'Templates'];
      case 'analytics':
        return ['Analytics', 'Business Intelligence'];
      case 'security':
        return ['Administration', 'Security & Audit'];
      case 'team':
        return ['Administration', 'Organization'];
      case 'settings':
        return ['Settings', 'System Configuration'];
      default:
        return ['Dashboard', 'Home'];
    }
  };

  const crumbs = getCrumbs(activeTab);

  // Check if organization exists
  const hasOrganization = loadingProfile ? true : !!profileOrgName;

  return (
    <div className="flex min-h-screen text-sm bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-ink-50 transition-colors duration-200 w-full relative">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        userName={session.user?.name || 'Jane Doe'}
        userRole="Regional Manager"
        userInitials={userInitials}
        onSignOut={handleSignOut}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
        userOrganizationName={profileOrgName || (session.user as any)?.organizationName}
        userOrganizationLogo={(session.user as any)?.image}
        metrics={metrics}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <main className="flex-1 min-w-0 flex flex-col relative h-screen overflow-y-auto">
        <Topbar
          activeTabLabel={crumbs[0]}
          activeSubLabel={crumbs[1] || ''}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          activeTab={activeTab}
          crumbs={crumbs}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        {!hasOrganization && (
          <div className="bg-coral-500/10 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400 text-xs py-3 px-4 text-center font-bold border-b border-coral-500/20 flex items-center justify-center gap-2 relative z-30 animate-fade-in">
            <span>⚠️ You don't have an active organization yet. Create one in the Team settings to unlock all features.</span>
            <button 
              onClick={() => navigateToTab('team')} 
              className="underline hover:text-coral-700 dark:hover:text-coral-300 transition-colors font-extrabold"
            >
              Set up organization &rarr;
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Redirection Countdown Popup Banner */}
      {redirectPopup && redirectPopup.active && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-slide-up">
          <div className="flex-1">
            <h4 className="text-xs font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping"></span>
              Sophia is redirecting you...
            </h4>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1">
              Taking you to: <span className="font-semibold text-coral-500">{redirectPopup.path}</span> in {redirectPopup.secondsLeft}s
            </p>
          </div>
          <button 
            onClick={handleCancelRedirect}
            className="px-3 py-1.5 bg-paper-100 dark:bg-ink-850 border border-paper-200 dark:border-ink-700 hover:bg-paper-200 dark:hover:bg-ink-800 text-xs font-bold rounded-lg text-paper-700 dark:text-ink-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Profile Settings Modal */}
      {isProfileSettingsOpen && (
        <ProfileSettingsModal
          user={session.user}
          onClose={() => setIsProfileSettingsOpen(false)}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}
