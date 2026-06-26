'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@repo/auth';
import { ShieldAlert, Users, CreditCard, Building2, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;

  if (!user) return <DashboardLayout>{children}</DashboardLayout>;
  if (!user?.organizationName) return <DashboardLayout>{children}</DashboardLayout>;

  const tabs = [
    { id: 'organization', label: 'Org Profile', path: '/team/organization' },
    { id: 'invites', label: 'Team & Access', path: '/team/invites' },
    { id: 'billing', label: 'Billing & Expenses', path: '/team/billing' }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full space-y-6 animate-fade-in pb-32">
        {/* Compact Header */}
        <div className="relative border-b border-paper-200 dark:border-ink-800 pb-0">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-coral-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="pb-4">
              <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[10px] uppercase tracking-widest mb-1.5">
                <span>Core Setup</span> <ChevronRight className="w-3 h-3" /> <span>{user.organizationName}</span>
              </div>
              <h1 className="text-xl font-semibold text-paper-900 dark:text-white tracking-tight mb-1">
                {user.organizationName}
              </h1>
              <p className="text-xs text-paper-500 dark:text-ink-400 max-w-xl">
                Configure global infrastructure, manage personnel access rules, and monitor enterprise resource utilization.
              </p>
            </div>
            
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pt-2">
              {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.path);
                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.path)}
                    className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-coral-500 text-coral-500'
                        : 'border-transparent text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-ink-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Child Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}
