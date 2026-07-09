import React from 'react';
import { Building, Percent, DollarSign, Wrench } from 'lucide-react';

interface PropertyStatsProps {
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  grossBilling: number;
  activeTickets: number;
}

export default function PropertyStats({
  totalProperties,
  totalUnits,
  occupancyRate,
  grossBilling,
  activeTickets
}: PropertyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Properties */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Properties</p>
          <p className="text-xl font-black text-paper-900 dark:text-white mt-1 font-mono">{totalProperties}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-coral-50 dark:bg-coral-500/10 border border-coral-100 dark:border-coral-500/20 flex items-center justify-center text-coral-500">
          <Building className="w-5 h-5" />
        </div>
      </div>
      
      {/* Total Units */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Total Units</p>
          <p className="text-xl font-black text-purple-500 mt-1 font-mono">{totalUnits}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-500">
          <BuildingCircleIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{occupancyRate}%</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <Percent className="w-5 h-5" />
        </div>
      </div>

      {/* Gross Billing */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Est. Gross Billing</p>
          <p className="text-xl font-black text-blue-500 mt-1 font-mono">${grossBilling.toLocaleString()}/mo</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-500">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Open Work Orders */}
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm trans-theme flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Open Tickets</p>
          <p className="text-xl font-black text-amber-500 mt-1 font-mono">{activeTickets}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500">
          <Wrench className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function BuildingCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
    </svg>
  );
}
