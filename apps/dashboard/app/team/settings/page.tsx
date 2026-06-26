'use client';

import React from 'react';
import { useSession } from '@repo/auth';
import { Camera, Save, AlertTriangle, Key, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-6 pb-6">
      
      {/* Brand & Identity Settings */}
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50">
          <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Organization Identity</h3>
          <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Manage your company's core profile, branding, and public metadata.</p>
        </div>
        
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="w-20 h-20 rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900 flex items-center justify-center text-2xl font-bold text-paper-400 dark:text-ink-500 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
              {user.image ? (
                <img src={user.image} alt={user.organizationName} className="w-full h-full object-cover" />
              ) : (
                user.organizationName?.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white mb-0.5" />
              <span className="text-[9px] text-white font-medium uppercase tracking-widest">Update</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-1.5">
              <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                Legal Entity Name <span className="text-coral-500">*</span>
              </label>
              <input 
                type="text" 
                defaultValue={user.organizationName} 
                className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 focus:border-coral-500 transition-all outline-none shadow-sm" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                Unique Identifier (Username) <span className="text-coral-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-paper-400 dark:text-ink-500 font-medium">@</span>
                </div>
                <input 
                  type="text" 
                  defaultValue={user.username} 
                  className="w-full pl-7 pr-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 focus:border-coral-500 transition-all outline-none shadow-sm" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                Primary Root Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Mail className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
                </div>
                <input 
                  type="email" 
                  defaultValue={user.email} 
                  disabled 
                  className="w-full pl-8 pr-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-md text-xs font-medium text-paper-500 dark:text-ink-500 cursor-not-allowed shadow-sm" 
                />
              </div>
              <p className="text-[9px] text-paper-500 dark:text-ink-400 font-medium pt-0.5">
                This is the root account email. It cannot be changed without contacting Enterprise Support.
              </p>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-paper-200 dark:border-ink-700">
              <button className="px-4 py-2 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-medium rounded-md transition-colors shadow-sm flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Identity Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-lg p-5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h3>
            <p className="text-[11px] text-red-500/80 dark:text-red-400/80 font-medium max-w-lg leading-relaxed">
              Permanently delete this organization, terminate all tenant access, erase historical ledgers, and cancel subscriptions. This action cannot be reversed.
            </p>
          </div>
          <button className="flex-shrink-0 px-4 py-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-md transition-colors border border-red-200 dark:border-red-500/20">
            Delete Organization
          </button>
        </div>
      </div>

    </div>
  );
}
