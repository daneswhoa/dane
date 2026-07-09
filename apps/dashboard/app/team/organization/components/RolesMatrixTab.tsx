'use client';

import React from 'react';
import { Lock, Wrench, Wallet, Users, Settings, Shield } from 'lucide-react';

export function RolesMatrixTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Roles Hero Banner */}
      <div 
        className="bg-ink-950 dark:bg-black rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-ink-800 shadow-sm min-h-[140px]"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 20, 0.85), rgba(5, 8, 11, 0.95)), url("/roles_matrix_banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-coral-500 font-semibold text-[9.5px] uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Access Control
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Roles & Permissions Matrix</h2>
          <p className="text-[11px] text-ink-300 leading-relaxed">
            Reference table for default workspace roles. Each role defines scoped permissions across properties, tenants, billing, and maintenance modules.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 flex-shrink-0">
          <div className="bg-ink-900/90 backdrop-blur-sm border border-ink-700/50 rounded-lg p-3.5 flex flex-col justify-center min-w-[200px]">
            <div className="text-[9px] font-bold text-coral-500 mb-1 uppercase tracking-wide">Role Scoping</div>
            <div className="space-y-1 mt-1 text-[11px] text-ink-300">
              <div>• 5 predefined workspace roles</div>
              <div>• Custom permission overrides</div>
              <div>• Property-level scope isolation</div>
            </div>
          </div>
        </div>
      </div>

    <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50">
        <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider">Roles Reference</h3>
        <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Scope permissions and capabilities for default workspace roles.</p>
      </div>

      <div className="overflow-x-auto font-sans">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-paper-50 dark:bg-ink-950/20 text-[9px] uppercase font-bold text-paper-500 dark:text-ink-400 tracking-wider border-b border-paper-200 dark:border-ink-700">
            <tr>
              <th className="px-4 py-3.5">Role Name</th>
              <th className="px-4 py-3.5">Scope Description</th>
              <th className="px-4 py-3.5">Properties Scope</th>
              <th className="px-4 py-3.5">Tenants & Leases</th>
              <th className="px-4 py-3.5">Billing & Ledger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-100 dark:divide-ink-700/50">
            <tr className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
              <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-coral-500 animate-spin-slow" /> Operations Lead
              </td>
              <td className="px-4 py-3.5 text-paper-600 dark:text-ink-300">
                Full administrative capability. Access to config parameters, email dispatches, and moderator functions.
              </td>
              <td className="px-4 py-3.5 text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider text-[10px]">Full Access</td>
              <td className="px-4 py-3.5 font-medium">Global (All properties)</td>
              <td className="px-4 py-3.5 text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider text-[10px]">Full Access</td>
            </tr>
            <tr className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
              <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Property Manager
              </td>
              <td className="px-4 py-3.5 text-paper-600 dark:text-ink-300">
                Manage assigned property boundaries. Setup tenancies, edit unit listings, and resolve maintenance logs.
              </td>
              <td className="px-4 py-3.5 text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Scoped Access</td>
              <td className="px-4 py-3.5 font-medium">Assigned properties only</td>
              <td className="px-4 py-3.5 text-red-500 dark:text-red-400/80 font-semibold uppercase tracking-wider text-[10px]">Blocked</td>
            </tr>
            <tr className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
              <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-500" /> Maintenance Tech
              </td>
              <td className="px-4 py-3.5 text-paper-600 dark:text-ink-300">
                Operational tech focus. Full access on ticket assignment and contractor directory. Read-only to properties.
              </td>
              <td className="px-4 py-3.5 text-red-500 dark:text-red-400/80 font-semibold uppercase tracking-wider text-[10px]">Blocked</td>
              <td className="px-4 py-3.5 font-medium">Scoped properties only</td>
              <td className="px-4 py-3.5 text-red-500 dark:text-red-400/80 font-semibold uppercase tracking-wider text-[10px]">Blocked</td>
            </tr>
            <tr className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
              <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Accountant
              </td>
              <td className="px-4 py-3.5 text-paper-600 dark:text-ink-300">
                Financial auditing. View ledgers, process payments, issue refunds. Read-only to properties & tenants.
              </td>
              <td className="px-4 py-3.5 text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider text-[10px]">Full Access</td>
              <td className="px-4 py-3.5 font-medium">Global (All properties)</td>
              <td className="px-4 py-3.5 text-red-500 dark:text-red-400/80 font-semibold uppercase tracking-wider text-[10px]">Blocked</td>
            </tr>
            <tr className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-colors">
              <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-paper-500" /> Landlord (Read-Only)
              </td>
              <td className="px-4 py-3.5 text-paper-600 dark:text-ink-300">
                Auditing partner access. Read-only capability across all properties, tenants, and maintenance lists.
              </td>
              <td className="px-4 py-3.5 text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px]">Read-Only</td>
              <td className="px-4 py-3.5 font-medium">Global or Scoped</td>
              <td className="px-4 py-3.5 text-red-500 dark:text-red-400/80 font-semibold uppercase tracking-wider text-[10px]">Blocked</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
