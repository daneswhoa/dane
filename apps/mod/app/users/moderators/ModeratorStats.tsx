import React from 'react';
import { Shield, ShieldAlert, AlertCircle, ClipboardList } from 'lucide-react';

interface ModeratorStatsProps {
  totalModerators: number;
  activeCount: number;
  suspendedCount: number;
  totalLogs: number;
}

export default function ModeratorStats({
  totalModerators,
  activeCount,
  suspendedCount,
  totalLogs
}: ModeratorStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Moderators */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Total Moderators</p>
          <p className="text-xl font-black text-paper-900 dark:text-white mt-1 font-mono">{totalModerators}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-coral-50 dark:bg-coral-500/10 border border-coral-100 dark:border-coral-500/20 flex items-center justify-center text-coral-500">
          <Shield className="w-5 h-5" />
        </div>
      </div>
      
      {/* Active Moderator Profiles */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Active Staff</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{activeCount}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      {/* Suspended Accounts */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Access Suspended</p>
          <p className="text-xl font-black text-red-500 mt-1 font-mono">{suspendedCount}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Total Audit Actions Logged */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Audit Log Actions</p>
          <p className="text-xl font-black text-purple-500 mt-1 font-mono">{totalLogs}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-500">
          <ClipboardList className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Simple internal helper icon
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
