'use client';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ContractorProvider, useContractor } from './ContractorContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProfileWizardModal from './components/ProfileWizardModal';
import { Wrench, AlertTriangle, X, Shield } from 'lucide-react';
import { useSession } from '@repo/auth';

function ContractorLayoutInner({ children }: { children: React.ReactNode }) {
  const { profile, jobs, loading, errorMsg, setErrorMsg, fetchData, showProfileWizard, setShowProfileWizard } = useContractor();
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isDark, setIsDark] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;
    if (savedTheme === 'light') {
      htmlElement.classList.remove('dark');
      setIsDark(false);
    } else {
      htmlElement.classList.add('dark');
      setIsDark(true);
    }
    
    // Auto show profile wizard if loaded and no profile
    if (!loading && !profile && session?.user?.id) {
      setShowProfileWizard(true);
    }
  }, [loading, profile, session]);

  const handleToggleTheme = () => {
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (isPending || !session) {
    return (
      <div className="fixed inset-0 z-[100] bg-paper-50 dark:bg-ink-950 flex flex-col items-center justify-center trans-theme">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-coral-500/20 blur-xl rounded-full w-16 h-16 animate-pulse-slow"></div>
          <div className="absolute w-20 h-20 rounded-full border border-paper-200 dark:border-ink-800 border-t-coral-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
          <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 text-white flex items-center justify-center shadow-lg shadow-coral-500/30">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  const activeTab = pathname.includes('/network') ? 'profile' : pathname.includes('/earnings') ? 'wallet' : 'jobs';
  const newJobsCount = jobs.filter(j => j.status === 'open' || j.status === 'assigned').length;

  return (
    <div className="flex min-h-screen text-sm bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-ink-50 trans-theme overflow-hidden">
      <Sidebar 
        activeTab={activeTab as any} 
        onTabChange={(tab) => {
          const route = tab === 'profile' ? 'network' : tab === 'wallet' ? 'earnings' : 'jobs';
          router.push(`/contractor/${route}`);
        }} 
        profile={profile} 
        newJobsCount={newJobsCount} 
        isCollapsed={isSidebarCollapsed}
      />
      <div className="flex-1 min-w-0 flex flex-col relative h-screen overflow-y-auto bg-paper-50 dark:bg-ink-900 pb-16 md:pb-0">
        <Topbar 
          activeTab={activeTab as any} 
          isDark={isDark} 
          onToggleTheme={handleToggleTheme} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 min-w-0 flex flex-col">
          {errorMsg && (
            <div className="m-6 p-4 bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 text-coral-700 dark:text-coral-400 rounded-xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-semibold">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-coral-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!profile && !loading && (
            <div className="m-6 p-6 bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 rounded-2xl text-left space-y-3 flex-shrink-0">
              <h3 className="text-sm font-bold text-coral-600 dark:text-coral-400 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Complete Your Contractor Profile
              </h3>
              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Welcome to Dane Properties! Please take 60 seconds to finish setting up your profile details. This enables property managers to view your hourly rate, specialty, and request maintenance work orders.
              </p>
              <button 
                onClick={() => setShowProfileWizard(true)}
                className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Complete Profile
              </button>
            </div>
          )}

          {profile && profile.status === 'offline' && (
             <div className="bg-coral-500 text-white text-xs font-bold py-2 text-center uppercase tracking-widest animate-pulse-slow">
               ⚠️ You are currently Off-Duty. Managers cannot hire you and your profile is hidden from the marketplace.
             </div>
          )}

          {children}
        </main>
      </div>

      {showProfileWizard && (
        <ProfileWizardModal 
          userId={session.user.id}
          profile={profile}
          onClose={() => profile ? setShowProfileWizard(false) : setErrorMsg('Please complete your profile configuration first.')}
          onSaveSuccess={async () => {
            await fetchData();
            setShowProfileWizard(false);
          }}
        />
      )}
    </div>
  );
}

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContractorProvider>
      <ContractorLayoutInner>{children}</ContractorLayoutInner>
    </ContractorProvider>
  );
}
