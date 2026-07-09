import React from 'react';
import { Users, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';

interface TenantStatsProps {
  totalTenants: number;
  activeSessions: number;
  restrictedCount: number;
  warningsIssued: number;
}

export default function TenantStats({
  totalTenants,
  activeSessions,
  restrictedCount,
  warningsIssued,
}: TenantStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tenants */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Total Tenants</p>
          <p className="text-xl font-black text-paper-900 dark:text-white mt-1 font-mono">{totalTenants}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-coral-50 dark:bg-coral-500/10 border border-coral-100 dark:border-coral-500/20 flex items-center justify-center text-coral-500">
          <Users className="w-5 h-5" />
        </div>
      </div>
      
      {/* Active Platform Users */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Active Sessions (24h)</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{activeSessions}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Restricted Accounts */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Restricted Profiles</p>
          <p className="text-xl font-black text-red-500 mt-1 font-mono">{restrictedCount}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Platform Flagged / Warnings */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Flagged Warnings</p>
          <p className="text-xl font-black text-amber-500 mt-1 font-mono">{warningsIssued}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
