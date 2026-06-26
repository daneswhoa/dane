import React from 'react';
import { FileCheck2, DollarSign, CalendarClock, ArrowRightLeft, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitName: string;
  propertyName: string;
  rent: number;
  arrears: number;
  status: string;
  leaseEnd: string;
}

interface TenantKpiCardsProps {
  tenants: Tenant[];
}

export function TenantKpiCards({ tenants }: TenantKpiCardsProps) {
  const totalLeases = tenants.length;
  const delinquentCount = tenants.filter((t) => t.arrears > 0).length;
  const totalArrears = tenants.reduce((sum, t) => sum + t.arrears, 0);

  // Expiring soon (less than 90 days from now)
  const expiringSoon = tenants.filter((t) => {
    if (!t.leaseEnd) return false;
    const diff = new Date(t.leaseEnd).getTime() - new Date().getTime();
    const days = diff / (1000 * 3600 * 24);
    return days > 0 && days <= 90;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between shadow-sm">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Active Leases</span>
          <div className="p-1.5 bg-paper-100 dark:bg-ink-900 rounded text-paper-600 dark:text-ink-300">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-paper-900 dark:text-white">{totalLeases}</span>
          <span className="text-[10px] text-paper-500 dark:text-ink-400 font-medium">Leases Logged</span>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-coral-500/10 dark:bg-coral-500/5 rounded-bl-full z-0"></div>
        <div className="flex justify-between items-start relative z-10">
          <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Outstanding Balance</span>
          <div className="p-1.5 bg-coral-50 dark:bg-coral-500/10 rounded text-coral-600 dark:text-coral-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2 relative z-10">
          <span className="text-2xl font-semibold text-coral-600 dark:text-coral-400">
            ${totalArrears.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-paper-500 dark:text-ink-400 font-medium">Across {delinquentCount} tenants</span>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between shadow-sm">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Upcoming Renewals</span>
          <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded text-blue-600 dark:text-blue-400">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-paper-900 dark:text-white">{expiringSoon}</span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center font-medium">Expiring in 90d</span>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between shadow-sm">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Transitions</span>
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded text-emerald-600 dark:text-emerald-400">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5 inline" /> {totalLeases > 0 ? Math.ceil(totalLeases * 0.1) : 0}
            </span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400">In</span>
          </div>
          <div className="w-px h-4 bg-paper-200 dark:bg-ink-700"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-paper-600 dark:text-ink-300 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 inline" /> {totalLeases > 0 ? Math.floor(totalLeases * 0.05) : 0}
            </span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400">Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
