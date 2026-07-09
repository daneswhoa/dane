import React from 'react';
import { Briefcase, Building, MailOpen, AlertCircle } from 'lucide-react';

interface OrganizationStatsProps {
  totalOrgs: number;
  totalProperties: number;
  totalPendingInvites: number;
  suspendedCount: number;
}

export default function OrganizationStats({
  totalOrgs,
  totalProperties,
  totalPendingInvites,
  suspendedCount
}: OrganizationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Organizations */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Registered Orgs</p>
          <p className="text-xl font-black text-paper-900 dark:text-white mt-1 font-mono">{totalOrgs}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-coral-50 dark:bg-coral-500/10 border border-coral-100 dark:border-coral-500/20 flex items-center justify-center text-coral-500">
          <Briefcase className="w-5 h-5" />
        </div>
      </div>
      
      {/* Total Managed Properties */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Properties Managed</p>
          <p className="text-xl font-black text-purple-500 mt-1 font-mono">{totalProperties}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-500">
          <Building className="w-5 h-5" />
        </div>
      </div>

      {/* Active Pending Invitations */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Pending Invites</p>
          <p className="text-xl font-black text-amber-500 mt-1 font-mono">{totalPendingInvites}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500">
          <MailOpen className="w-5 h-5" />
        </div>
      </div>

      {/* Suspended Organizations */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Suspended Orgs</p>
          <p className="text-xl font-black text-red-500 mt-1 font-mono">{suspendedCount}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
