import React, { useState, useEffect } from 'react';
import {
  Building2,
  LayoutDashboard,
  Building,
  Users,
  Wallet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wrench,
  HardHat,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  Sparkles,
  X,
  // Sub-items
  TrendingUp,
  Receipt,
  CreditCard,
  Inbox as InboxIcon,
  Send,
  Cpu,
  ClipboardList,
  MessageCircle,
  Megaphone
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  userRole: string;
  userInitials: string;
  onSignOut: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenProfileSettings?: () => void;
  userOrganizationName?: string | null;
  userOrganizationLogo?: string | null;
  metrics?: {
    properties: { count: number; hasPending: boolean };
    tenants: { count: number };
    invoices: { count: number; hasOverdue: boolean };
    maintenance: { count: number; hasNonReviewed: boolean; hasCompletedUnpaid: boolean };
  } | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userName,
  userRole,
  userInitials,
  onSignOut,
  collapsed = false,
  onToggleCollapse,
  onOpenProfileSettings,
  userOrganizationName,
  userOrganizationLogo,
  metrics,
  mobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  // Finance Dropdown state
  const [financeOpen, setFinanceOpen] = useState(true);
  // Communication Dropdown state
  const [communicationOpen, setCommunicationOpen] = useState(true);

  // Auto-open finance menu if a finance tab is active
  useEffect(() => {
    if (['expenses', 'invoices', 'wallet'].includes(activeTab)) {
      setFinanceOpen(true);
    }
  }, [activeTab]);

  // Auto-open communication menu if a communication tab is active
  useEffect(() => {
    if (['announcements', 'broadcasts', 'automations', 'templates'].includes(activeTab)) {
      setCommunicationOpen(true);
    }
  }, [activeTab]);

  const renderLink = (id: string, label: string, Icon: any, options?: { badge?: string; dot?: boolean; dots?: ('red' | 'yellow')[] }) => {
    const isActive = activeTab === id;
    const isSophia = id === 'sophia';
    const isTeam = id === 'team';
    
    return (
      <button
        key={id}
        onClick={() => {
          setActiveTab(id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center transition-all duration-150 relative ${
          collapsed && !mobileOpen
            ? 'justify-center px-0 py-1.5 group-hover/sidebar:justify-between group-hover/sidebar:px-2.5'
            : 'justify-between px-2.5 py-1.5'
        } rounded-md text-left ${
          isActive
            ? isSophia
              ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-semibold'
              : 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-medium'
            : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
        }`}
      >
        {isActive && (
          <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-md bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)]"></span>
        )}
        <div className={`flex items-center min-w-0 ${
          collapsed && !mobileOpen
            ? 'gap-0 group-hover/sidebar:gap-2.5'
            : 'gap-2.5'
        }`}>
          {isSophia ? (
            <img 
              src="/sophia_avatar.png" 
              alt="Sophia Avatar" 
              className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-coral-300/30 dark:border-coral-500/30 shadow-[0_0_8px_rgba(255,107,107,0.3)] animate-[pulse_3s_ease-in-out_infinite]"
            />
          ) : isTeam && userOrganizationLogo ? (
            <img 
              src={userOrganizationLogo} 
              alt="Organization Logo" 
              className="w-4 h-4 rounded object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Icon className="w-4 h-4 flex-shrink-0" />
          )}
          <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
            collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0.5' : 'w-auto opacity-100'
          } ${isSophia ? 'bg-gradient-to-r from-coral-500 to-amber-500 bg-clip-text text-transparent font-bold tracking-wide' : ''}`}>
            {label}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 transition-all duration-300 ${
          collapsed && !mobileOpen ? 'w-0 h-0 overflow-hidden opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:opacity-100' : 'opacity-100'
        }`}>
          {options?.badge && (
            <span className={`text-[10px] border px-1.5 py-0.5 rounded leading-none ${
              isActive
                ? 'bg-coral-100 dark:bg-coral-500/20 border-coral-200 dark:border-coral-500/30 text-coral-700 dark:text-coral-300'
                : 'bg-paper-200 dark:bg-ink-800 border-paper-300 dark:border-ink-700 text-paper-700 dark:text-ink-200'
            }`}>
              {options.badge}
            </span>
          )}
          {options?.dots && options.dots.map((color, idx) => (
            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${
              color === 'red'
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse'
            }`}></span>
          ))}
          {options?.dot && !options?.dots && (
            <span className="w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.6)] animate-pulse"></span>
          )}
        </div>
      </button>
    );
  };

  const renderSubLink = (id: string, label: string, Icon: any, options?: { badge?: string; dot?: boolean }) => {
    const isActive = activeTab === id;
    const isMobileOrExpanded = mobileOpen || !collapsed;
    return (
      <button
        key={id}
        onClick={() => {
          setActiveTab(id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center transition-all duration-150 relative ${
          collapsed && !mobileOpen
            ? 'justify-center px-0 py-1.5 group-hover/sidebar:justify-between group-hover/sidebar:px-2.5 group-hover/sidebar:pl-7'
            : 'justify-between pl-7 pr-2.5 py-1.5'
        } ${
          isActive
            ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-semibold'
            : 'text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800'
        } rounded-md text-left`}
      >
        {isActive && isMobileOrExpanded && (
          <span className="absolute left-[15px] top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-md bg-coral-500"></span>
        )}
        {isActive && !isMobileOrExpanded && (
          <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-md bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)]"></span>
        )}
        <div className={`flex items-center min-w-0 ${
          collapsed && !mobileOpen
            ? 'gap-0 group-hover/sidebar:gap-2.5'
            : 'gap-2.5'
        }`}>
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className={`text-xs transition-all duration-300 overflow-hidden whitespace-nowrap ${
            collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0.5' : 'w-auto opacity-100'
          }`}>
            {label}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 transition-all duration-300 ${
          collapsed && !mobileOpen ? 'w-0 h-0 overflow-hidden opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:h-auto group-hover/sidebar:opacity-100' : 'opacity-100'
        }`}>
          {options?.badge && (
            <span className={`text-[9px] border px-1 py-0.5 rounded leading-none ${
              isActive
                ? 'bg-coral-100 dark:bg-coral-500/20 border-coral-200 dark:border-coral-500/30 text-coral-700 dark:text-coral-300'
                : 'bg-paper-200 dark:bg-ink-800 border-paper-300 dark:border-ink-700 text-paper-700 dark:text-ink-200'
            }`}>
              {options.badge}
            </span>
          )}
          {options?.dot && (
            <span className="w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.6)] animate-pulse"></span>
          )}
        </div>
      </button>
    );
  };

  const maintenanceDots: ('red' | 'yellow')[] = [];
  if (metrics?.maintenance?.hasNonReviewed) maintenanceDots.push('yellow');
  if (metrics?.maintenance?.hasCompletedUnpaid) maintenanceDots.push('red');

  const isSidebarExpanded = !collapsed || mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-paper-900/40 dark:bg-ink-950/60 z-30 backdrop-blur-sm transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}
      
      <aside className={`flex-shrink-0 border-r border-paper-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col transition-all duration-300 z-40 ${
        mobileOpen
          ? 'fixed left-0 top-0 h-screen w-56 shadow-2xl'
          : 'hidden md:flex sticky top-0 h-screen'
      } ${
        collapsed && !mobileOpen
          ? 'w-14 hover:w-56 group/sidebar shadow-sm hover:shadow-xl' 
          : 'w-56'
      }`}>
        {/* Brand Header */}
        <div className="h-12 border-b border-paper-200 dark:border-ink-800 flex items-center justify-between px-3 gap-2 transition-colors duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logomark.png" alt="Dane Properties" className="w-6 h-6 object-contain flex-shrink-0" />
            <span className={`font-semibold text-paper-900 dark:text-white tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap ${
              collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0.5' : 'w-auto opacity-100'
            }`}>
              Dane Properties
            </span>
          </div>
          {mobileOpen && onCloseMobile ? (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded hover:bg-paper-250 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          ) : onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1 rounded hover:bg-paper-250 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400 transition-all ${
                collapsed ? 'hidden group-hover/sidebar:block' : 'block'
              }`}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* Section: Primary */}
          {renderLink('overview', 'Overview', LayoutDashboard)}
          {renderLink('sophia', 'Sophia AI', Sparkles)}

          {/* Section: Core */}
          <div className={`pt-2 pb-1 overflow-hidden whitespace-nowrap ${
            collapsed && !mobileOpen
              ? 'text-center px-0'
              : 'px-2'
          }`}>
            <p className="text-[10px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-400 transition-all duration-300">
              {collapsed && !mobileOpen ? (
                <>
                  <span className="group-hover/sidebar:hidden block w-full text-center">C</span>
                  <span className="hidden group-hover/sidebar:inline pl-2">Core</span>
                </>
              ) : (
                <span>Core</span>
              )}
            </p>
          </div>
          {renderLink('properties', 'Properties', Building, { 
            badge: metrics?.properties ? String(metrics.properties.count) : undefined,
            dots: metrics?.properties?.hasPending ? ['yellow'] : undefined
          })}
          {renderLink('tenants', 'Tenants', Users, { 
            badge: metrics?.tenants ? String(metrics.tenants.count) : undefined 
          })}

          {/* Redesigned Finance Dropdown */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md w-full transition-all duration-150 ${
                ['expenses', 'invoices', 'wallet'].includes(activeTab)
                  ? 'text-paper-900 dark:text-white bg-paper-200/50 dark:bg-ink-800/50 hover:bg-paper-200 dark:hover:bg-ink-800'
                  : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2.5 font-medium min-w-0">
                <Wallet className="w-4 h-4 flex-shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0.5' : 'w-auto opacity-100'
                }`}>
                  Finance
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${financeOpen ? 'rotate-180' : ''} ${
                collapsed && !mobileOpen ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
              }`} />
            </button>
            
            {financeOpen && (
              <div className="flex flex-col gap-0.5 pl-0 pr-0 mt-0.5 relative">
                <div className={`absolute left-[15px] top-0 bottom-2 w-px bg-paper-200 dark:bg-ink-800 transition-all duration-300 ${
                  collapsed && !mobileOpen ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
                }`}></div>
                
                {renderSubLink('expenses', 'Payments & Expenses', TrendingUp)}
                
                {renderSubLink('invoices', 'Invoices', Receipt, {
                  badge: metrics?.invoices ? String(metrics.invoices.count) : undefined,
                  dot: metrics?.invoices?.hasOverdue
                })}
                
                {renderSubLink('wallet', 'Wallet', CreditCard)}
              </div>
            )}
          </div>

          {/* Section: Operations */}
          <div className={`pt-2 pb-1 overflow-hidden whitespace-nowrap ${
            collapsed && !mobileOpen
              ? 'text-center px-0'
              : 'px-2'
          }`}>
            <p className="text-[10px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-400 transition-all duration-300">
              {collapsed && !mobileOpen ? (
                <>
                  <span className="group-hover/sidebar:hidden block w-full text-center">O</span>
                  <span className="hidden group-hover/sidebar:inline pl-2">Operations</span>
                </>
              ) : (
                <span>Operations</span>
              )}
            </p>
          </div>
          {renderLink('maintenance', 'Maintenance', Wrench, { 
            badge: metrics?.maintenance ? String(metrics.maintenance.count) : undefined,
            dots: maintenanceDots.length > 0 ? maintenanceDots : undefined
          })}
          {renderLink('contractors', 'Contractors', HardHat)}
          
          {/* Redesigned Communication Dropdown */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setCommunicationOpen(!communicationOpen)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md w-full transition-all duration-150 ${
                ['inbox', 'broadcasts', 'automations', 'templates'].includes(activeTab)
                  ? 'text-paper-900 dark:text-white bg-paper-200/50 dark:bg-ink-800/50 hover:bg-paper-200 dark:hover:bg-ink-800'
                  : 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2.5 font-medium min-w-0">
                <MessageSquare className="w-4 h-4 text-coral-500 flex-shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0.5' : 'w-auto opacity-100'
                }`}>
                  Communication
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${communicationOpen ? 'rotate-180' : ''} ${
                collapsed && !mobileOpen ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
              }`} />
            </button>
            
            {communicationOpen && (
              <div className="flex flex-col gap-0.5 pl-0 pr-0 mt-0.5 relative">
                <div className={`absolute left-[15px] top-0 bottom-2 w-px bg-paper-200 dark:bg-ink-800 transition-all duration-300 ${
                  collapsed && !mobileOpen ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
                }`}></div>
                
                {renderSubLink('announcements', 'Announcements', Megaphone)}
                
                {renderSubLink('broadcasts', 'Email Broadcasts', Send, {
                  dot: true
                })}
                
                {renderSubLink('automations', 'Automations', Cpu)}
                
                {renderSubLink('templates', 'Templates', ClipboardList)}
                
                {/* SMS / Voice (Locked) */}
                <div className={`w-full flex items-center justify-between py-1.5 rounded-md text-left text-xs text-paper-400 dark:text-ink-500 cursor-not-allowed select-none z-10 ${
                  collapsed && !mobileOpen
                    ? 'px-2.5 justify-center'
                    : 'pl-7 pr-2.5'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                      collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-0.5' : 'w-auto opacity-100'
                    }`}>
                      SMS / Voice
                    </span>
                  </div>
                  <span className={`text-[9px] bg-paper-100 dark:bg-ink-900 text-paper-400 dark:text-ink-600 border border-paper-200 dark:border-ink-800 px-1 py-0.5 rounded flex items-center gap-0.5 font-semibold transition-all duration-300 ${
                    collapsed && !mobileOpen ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
                  }`}>
                    PRO
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Administration */}
          <div className={`pt-2 pb-1 overflow-hidden whitespace-nowrap ${
            collapsed && !mobileOpen
              ? 'text-center px-0'
              : 'px-2'
          }`}>
            <p className="text-[10px] uppercase font-bold tracking-wider text-paper-400 dark:text-ink-400 transition-all duration-300">
              {collapsed && !mobileOpen ? (
                <>
                  <span className="group-hover/sidebar:hidden block w-full text-center">A</span>
                  <span className="hidden group-hover/sidebar:inline pl-2">Administration</span>
                </>
              ) : (
                <span>Administration</span>
              )}
            </p>
          </div>
          {renderLink('analytics', 'Analytics', BarChart3)}
          {renderLink('security', 'Security & Audit', ShieldCheck)}
          {renderLink('team', userOrganizationName || 'Organization', Building2)}
        </nav>
 
        {/* User Profile (Bottom) */}
        <div className={`p-2 border-t border-paper-200 dark:border-ink-800 transition-colors duration-200 ${
          collapsed && !mobileOpen ? 'flex justify-center' : ''
        }`}>
          <button
            onClick={onOpenProfileSettings || onSignOut}
            className={`w-full flex items-center rounded-md hover:bg-paper-200 dark:hover:bg-ink-800 transition-all duration-150 text-left relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-coral-500/50 ${
              collapsed && !mobileOpen
                ? 'justify-center p-1 group-hover/sidebar:justify-between group-hover/sidebar:p-2'
                : 'justify-between p-2'
            }`}
            title="Account Settings"
          >
            <img
              src={`https://placehold.co/24x24/1a1d24/ffffff?text=${userInitials}`}
              alt="User"
              className="w-6 h-6 rounded bg-ink-800 object-cover flex-shrink-0 group-hover:shadow-md transition-shadow duration-200"
            />
            <div className={`flex-1 min-w-0 transition-all duration-300 ${
              collapsed && !mobileOpen ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-2' : 'w-auto opacity-100 ml-2'
            }`}>
              <p className="text-xs font-bold text-paper-900 dark:text-white truncate group-hover:text-coral-500 transition-colors">{userName}</p>
              <p className="text-[10px] text-paper-500 dark:text-ink-400 truncate">{userRole}</p>
            </div>
            <Settings className={`w-3.5 h-3.5 text-paper-400 dark:text-ink-400 group-hover:rotate-45 group-hover:text-coral-500 transition-all duration-300 ${
              collapsed && !mobileOpen ? 'opacity-0 group-hover/sidebar:opacity-100' : 'opacity-100'
            }`} />
          </button>
        </div>
      </aside>
    </>
  );
}
