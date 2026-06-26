import React from 'react';
import ModLayout from '../components/ModLayout';
import { Activity, Users, Building, AlertTriangle } from 'lucide-react';

export default function OverviewPage() {
  return (
    <ModLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-paper-900 dark:text-white">Platform Overview</h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">High-level view of the entire LandlordNL ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Active Users', value: '14,209', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { title: 'Managed Properties', value: '1,842', icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { title: 'System Alerts', value: '3', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { title: 'API Requests / min', value: '842', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-ink-900 p-5 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-black text-paper-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="h-96 rounded-2xl border border-dashed border-paper-300 dark:border-ink-700 flex flex-col items-center justify-center text-paper-400 dark:text-ink-600 bg-paper-50/50 dark:bg-ink-950/50">
          <Activity className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">Detailed Analytics Chart Coming Soon</span>
        </div>
      </div>
    </ModLayout>
  );
}
