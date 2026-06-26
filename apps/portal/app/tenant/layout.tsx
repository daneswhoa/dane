'use client';

import React from 'react';
import { TenantProvider, useTenant } from './TenantContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import InvoiceModal from './components/InvoiceModal';
import MaintenanceModal from './components/MaintenanceModal';
import ProfileWizardModal from './components/ProfileWizardModal';
import InviteCodeModal from './components/InviteCodeModal';
import { Home } from 'lucide-react';

function TenantLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    profile,
    loading,
    isDark,
    toggleTheme,
    isProfileWizardOpen,
    setIsProfileWizardOpen,
    isInviteCodeModalOpen,
    setIsInviteCodeModalOpen,
    isMaintenanceModalOpen,
    setIsMaintenanceModalOpen,
    invoiceModalId,
    setInvoiceModalId,
    handleActionClick
  } = useTenant();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper-50 dark:bg-ink-950 transition-colors duration-500 overflow-hidden">
        
        <div className="relative flex items-center justify-center mb-8">
          {/* Pulsing abstract rings */}
          <div className="absolute w-24 h-24 bg-coral-500/10 dark:bg-coral-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-32 h-32 border border-coral-500/20 dark:border-coral-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute w-16 h-16 bg-coral-500/20 dark:bg-coral-500/30 rounded-full animate-pulse"></div>
          
          {/* Core glassmorphic icon */}
          <div className="relative z-10 w-14 h-14 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border border-white dark:border-ink-700 rounded-2xl shadow-xl flex items-center justify-center text-coral-500">
             <Home className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight mb-2 animate-fade-in">
          Authenticating
        </h2>
        <p className="text-sm text-paper-500 dark:text-ink-400 mb-8 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          Preparing your resident portal
        </p>
        
        {/* Sleek indeterminate progress bar */}
        <div className="w-48 h-1 bg-paper-200 dark:bg-ink-800 rounded-full overflow-hidden shadow-inner relative animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-coral-400 to-coral-600 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite_alternate]"></div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-paper-50 dark:bg-ink-950 font-sans text-paper-900 dark:text-ink-50 trans-theme overflow-hidden selection:bg-coral-500/30">
      
      <Sidebar profile={profile} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Topbar 
          isDark={isDark} 
          onToggleTheme={toggleTheme} 
          onActionClick={handleActionClick} 
        />
        
        <div className="flex-1 overflow-y-auto relative scroll-smooth p-0 md:p-4">
          {children}
        </div>
      </main>

      {/* Modals */}
      <InvoiceModal 
        invoiceId={invoiceModalId} 
        onClose={() => setInvoiceModalId(null)} 
        profile={profile} 
      />
      
      <MaintenanceModal 
        isOpen={isMaintenanceModalOpen} 
        onClose={() => setIsMaintenanceModalOpen(false)} 
      />
      
      <ProfileWizardModal 
        isOpen={isProfileWizardOpen} 
        onClose={() => setIsProfileWizardOpen(false)} 
        profile={profile} 
      />

      <InviteCodeModal 
        isOpen={isInviteCodeModalOpen} 
        onClose={() => setIsInviteCodeModalOpen(false)} 
      />

    </div>
  );
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <TenantLayoutContent>{children}</TenantLayoutContent>
    </TenantProvider>
  );
}
