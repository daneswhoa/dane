import React from 'react';
import { ClipboardList, ShieldCheck, AlertCircle, Building } from 'lucide-react';

interface ManagerStatsProps {
  totalManagers: number;
  activeCount: number;
  suspendedCount: number;
  totalProperties: number;
}

export default function ManagerStats({
  totalManagers,
  activeCount,
  suspendedCount,
  totalProperties
}: ManagerStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Managers */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Total Managers</p>
          <p className="text-xl font-black text-paper-900 dark:text-white mt-1 font-mono">{totalManagers}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-coral-50 dark:bg-coral-500/10 border border-coral-100 dark:border-coral-500/20 flex items-center justify-center text-coral-500">
          <ClipboardList className="w-5 h-5" />
        </div>
      </div>
      
      {/* Active Manager Accounts */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Active Managers</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{activeCount}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Suspended Accounts */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Suspended Profiles</p>
          <p className="text-xl font-black text-red-500 mt-1 font-mono">{suspendedCount}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Total Managed Properties */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Managed Properties</p>
          <p className="text-xl font-black text-purple-500 mt-1 font-mono">{totalProperties}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-500">
          <Building className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
