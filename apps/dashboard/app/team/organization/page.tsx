'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@repo/auth';
import { Camera, TrendingUp, Users, Home, Zap, MapPin, Save, AlertTriangle, Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function OrganizationPage() {
  const { data: session, refetch } = useSession();
  const user = session?.user as any;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUnits: 0,
    activeTenants: 0,
    occupancyRate: '0%',
    aumValue: '$0',
    geography: []
  });

  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setOrgName(user.organizationName || '');
      setUsername(user.username || '');
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/org-stats`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch org stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !username) return;

    setIsSaving(true);
    setSaveStatus('saving');
    setErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/org-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName: orgName, username }),
        credentials: 'include'
      });

      if (res.ok) {
        setSaveStatus('success');
        // Update session so layout updates organization name
        if (refetch) {
          await refetch();
        }
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update organization settings.');
      }
    } catch (e: any) {
      console.error(e);
      setSaveStatus('error');
      setErrorMessage(e.message || 'Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column - Core Identity & Stats */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Identity Card */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col items-center text-center space-y-3 relative z-10">
            <div className="relative group/logo cursor-pointer">
              <div className="w-16 h-16 rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-900 flex items-center justify-center text-xl font-bold text-paper-400 dark:text-ink-500 shadow-sm overflow-hidden transform group-hover/logo:scale-105 transition-all duration-300">
                {user.image ? (
                  <img src={user.image} alt={orgName} className="w-full h-full object-cover" />
                ) : (
                  orgName?.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[9px] text-white font-medium uppercase tracking-widest">Update</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-base font-semibold text-paper-900 dark:text-white tracking-tight">{orgName}</h2>
              <div className="text-xs font-medium text-coral-500 mt-0.5 mb-1">@{username || 'company'}</div>
              <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-relaxed px-2">
                Enterprise real estate management firm specializing in high-yield multi-family residential portfolios.
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-paper-200 dark:via-ink-700 to-transparent my-2" />
            
            <div className="flex justify-between w-full text-left px-1">
              <div>
                <div className="text-[9px] font-medium text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-0.5">Owner</div>
                <div className="text-xs font-medium text-paper-900 dark:text-white">{user.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-medium text-paper-400 dark:text-ink-500 uppercase tracking-wider mb-0.5">Established</div>
                <div className="text-xs font-medium text-paper-900 dark:text-white">June 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dense Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
            <Home className="w-4 h-4 text-blue-500 mb-2" />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
            ) : (
              <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.totalUnits}</div>
            )}
            <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">Total Units</div>
          </div>
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
            <Users className="w-4 h-4 text-emerald-500 mb-2" />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
            ) : (
              <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.activeTenants}</div>
            )}
            <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">Active Tenants</div>
          </div>
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
            <Zap className="w-4 h-4 text-coral-500 mb-2" />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
            ) : (
              <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.occupancyRate}</div>
            )}
            <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">Occupancy</div>
          </div>
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3.5 shadow-sm hover:border-paper-300 dark:hover:border-ink-600 transition-colors">
            <TrendingUp className="w-4 h-4 text-purple-500 mb-2" />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-paper-400" />
            ) : (
              <div className="text-lg font-semibold text-paper-900 dark:text-white mb-0.5">{stats.aumValue}</div>
            )}
            <div className="text-[10px] text-paper-500 dark:text-ink-400 uppercase tracking-wider font-medium">AUM Value</div>
          </div>
        </div>

      </div>

      {/* Right Column - Activity & Infrastructure */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Global Infrastructure Map */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-4 sm:p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-coral-500" /> Portfolio Geography
              </h3>
              <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Geographic distribution of your managed assets.</p>
            </div>
            <button className="text-[11px] font-medium text-coral-500 hover:text-coral-600">View Map</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {loading ? (
              <div className="col-span-3 py-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              </div>
            ) : stats.geography && stats.geography.length > 0 ? (
              stats.geography.map((loc: any, i: number) => (
                <div key={i} className="p-3 rounded-md bg-paper-50 dark:bg-ink-900/50 border border-paper-200 dark:border-ink-700 hover:border-coral-500/30 transition-colors">
                  <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2">{loc.region}</div>
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Units</div>
                    <div className="text-xs font-semibold text-paper-900 dark:text-white">{loc.units}</div>
                  </div>
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-wider">Revenue</div>
                    <div className="text-xs font-semibold text-paper-900 dark:text-white">{loc.revenue}</div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-medium uppercase tracking-wider rounded">
                    <CheckCircle2 className="w-3 h-3" /> {loc.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-paper-400">No geographic data found.</div>
            )}
          </div>
        </div>

        {/* Brand & Identity Settings */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50">
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Organization Identity</h3>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Manage your company's core profile, branding, and public metadata.</p>
          </div>
          
          <form onSubmit={handleSaveIdentity} className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1.5">
                <label className="text-[9px] font-medium text-paper-500 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                  Legal Entity Name <span className="text-coral-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={orgName} 
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 focus:border-coral-500 transition-all outline-none shadow-sm" 
                  required
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
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs font-medium text-paper-900 dark:text-white focus:ring-1 focus:ring-coral-500 focus:border-coral-500 transition-all outline-none shadow-sm" 
                    required
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
              </div>

              {saveStatus === 'success' && (
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Changes saved successfully!
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {errorMessage}
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t border-paper-200 dark:border-ink-700">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-medium rounded-md transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Identity Changes
                </button>
              </div>
            </div>
          </form>
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
    </div>
  );
}
