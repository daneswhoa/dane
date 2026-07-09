import React from 'react';
import ModLayout from '../components/ModLayout';
import { Users, Building, Globe, Briefcase, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OverviewPage() {
  return (
    <ModLayout title="Overview">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">System Status: Active</h1>
            <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">Platform administration control center and security monitor.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Registered Users', value: '8,429', icon: Users, color: 'text-coral-500', bg: 'bg-coral-50 dark:bg-coral-500/10 border-coral-100 dark:border-coral-500/20' },
            { title: 'Active Properties', value: '412', icon: Building, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
            { title: 'Syndicated Units', value: '184', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
            { title: 'Managed Organizations', value: '29', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-xl border bg-white dark:bg-ink-900 shadow-sm flex items-center justify-between trans-theme ${stat.bg}`}>
              <div>
                <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-black text-paper-900 dark:text-white mt-1 font-mono">{stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Lower Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-ink-900 to-ink-950 border border-ink-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-coral-500/10 blur-[40px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-coral-500/20"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-ink-300">
                  <ShieldCheck className="w-5 h-5 text-coral-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-200">Security Node Status</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ALL SYSTEMS OPERATIONAL
                </span>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Firewall Monitor</h2>
                <p className="text-xs text-ink-300 mt-1 max-w-md">No malicious spikes or auth attacks detected within the past 24 hours.</p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-ink-800 hover:bg-ink-700 text-white rounded-lg text-xs font-bold border border-ink-800 trans-subtle">
                  System Diagnostics
                </button>
                <button className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-coral-500/20 trans-subtle">
                  Firewall Settings
                </button>
              </div>
            </div>
          </div>
 
          {/* Right Card: Platform Activity */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between trans-theme">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-coral-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-paper-500 dark:text-ink-400">Activity Log</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { text: 'Auth token created for Landlord NL', time: '2m ago' },
                  { text: 'Syndicated listing unlisted (Unit 4B)', time: '14m ago' },
                  { text: 'Contractor license verified (TechFix)', time: '1h ago' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-paper-100 dark:border-ink-800 pb-2">
                    <span className="text-paper-700 dark:text-ink-200 truncate pr-4">{item.text}</span>
                    <span className="text-[10px] text-paper-400 dark:text-ink-500 shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
 
            <div className="pt-4 border-t border-paper-100 dark:border-ink-800">
              <button className="w-full py-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-900 border border-paper-200 dark:border-ink-800 text-xs font-bold text-paper-800 dark:text-ink-200 rounded-lg trans-subtle">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModLayout>
  );
}
