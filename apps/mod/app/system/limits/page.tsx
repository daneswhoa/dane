'use client';

import React, { useState, useEffect } from 'react';
import ModLayout from '../../components/ModLayout';
import { 
  Activity, Key, ShieldAlert, Trash2, Save, ShieldCheck, Users, Search, RefreshCw, Sliders
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  scope: string;
  rateLimit: string;
  status: 'Active' | 'Suspended';
}

const INITIAL_KEYS: APIKey[] = [
  { id: 'KEY-7719', name: 'Portal Fetch client', scope: 'Read-Only Vacancies', rateLimit: '1,000 req/min', status: 'Active' },
  { id: 'KEY-8820', name: 'Search Index Sync', scope: 'Read-Write Search', rateLimit: '5,000 req/min', status: 'Active' },
  { id: 'KEY-9041', name: 'Legacy Mobile API client', scope: 'All Read', rateLimit: '200 req/min', status: 'Suspended' }
];

export default function RateLimitsPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'pacing'>('pacing');
  const [loading, setLoading] = useState(true);
  
  // Rate limits inputs (Global Categories)
  const [readLimit, setReadLimit] = useState(100);
  const [readTtl, setReadTtl] = useState(60);
  const [writeLimit, setWriteLimit] = useState(30);
  const [writeTtl, setWriteTtl] = useState(60);
  const [heavyLimit, setHeavyLimit] = useState(5);
  const [heavyTtl, setHeavyTtl] = useState(60);

  // Multiplier Tiers
  const [multipliers, setMultipliers] = useState({
    standard: 1.0,
    enterprise: 3.0,
    restricted: 0.1
  });

  // Managers Roster
  const [managers, setManagers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // API Keys (from mock UI)
  const [keys, setKeys] = useState<APIKey[]>(INITIAL_KEYS);
  
  // IP Blacklist (from mock UI)
  const [blacklist, setBlacklist] = useState<string[]>(['192.168.1.105', '102.16.88.42']);
  const [newIp, setNewIp] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/security/limits');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setReadLimit(data.config.read.limit);
          setReadTtl(data.config.read.ttl);
          setWriteLimit(data.config.write.limit);
          setWriteTtl(data.config.write.ttl);
          setHeavyLimit(data.config.heavy.limit);
          setHeavyTtl(data.config.heavy.ttl);
          
          if (data.config.multipliers) {
            setMultipliers({
              standard: data.config.multipliers.standard || 1.0,
              enterprise: data.config.multipliers.enterprise || 3.0,
              restricted: data.config.multipliers.restricted || 0.1
            });
          }
        }
        if (data.users) {
          setManagers(data.users);
        }
      }
    } catch (e) {
      console.error('Failed to load limits configuration', e);
      triggerToast('Error loading config from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const handleSavePacingRules = async () => {
    try {
      const res = await fetch('/api/dashboard/security/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          read: { limit: readLimit, ttl: readTtl },
          write: { limit: writeLimit, ttl: writeTtl },
          heavy: { limit: heavyLimit, ttl: heavyTtl },
          multipliers
        }),
      });
      if (res.ok) {
        triggerToast('Pacing and tier configurations saved to Upstash Redis');
      } else {
        triggerToast('Failed to save rate limits configuration');
      }
    } catch (e) {
      triggerToast('Network error while saving limits');
    }
  };

  const handleSaveUserTier = async (userId: string, tier: string) => {
    try {
      const res = await fetch('/api/dashboard/security/limits/user-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier }),
      });
      if (res.ok) {
        setManagers(prev => prev.map(u => u.id === userId ? { ...u, tier } : u));
        triggerToast(`Account tier updated in Upstash Redis`);
      } else {
        triggerToast('Failed to save account tier');
      }
    } catch (e) {
      triggerToast('Network error updating account tier');
    }
  };

  const handleToggleKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: k.status === 'Active' ? 'Suspended' : 'Active' } : k));
    triggerToast(`API Key ${id} status toggled`);
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setBlacklist(prev => [...prev, newIp]);
    setNewIp('');
    triggerToast(`IP ${newIp} blacklisted`);
  };

  const handleRemoveBlacklist = (ip: string) => {
    setBlacklist(prev => prev.filter(item => item !== ip));
    triggerToast(`IP ${ip} removed from blacklist`);
  };

  const filteredManagers = managers.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModLayout title="System Rate Limits">
      <div className="space-y-6 max-w-5xl mx-auto pb-10 relative">
        
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Custom Tab Switcher */}
        <div className="flex border-b border-paper-200 dark:border-ink-800 pb-px gap-6 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setActiveTab('pacing')}
            className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'pacing' 
                ? 'border-coral-500 text-coral-500 dark:text-coral-400' 
                : 'border-transparent text-paper-400 dark:text-ink-500 hover:text-paper-600'
            }`}
          >
            <Sliders className="w-4.5 h-4.5" /> Pacing & Manager Tiers
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'keys' 
                ? 'border-coral-500 text-coral-500 dark:text-coral-400' 
                : 'border-transparent text-paper-400 dark:text-ink-500 hover:text-paper-600'
            }`}
          >
            <Key className="w-4.5 h-4.5" /> API Keys & IP Bans
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-paper-400 dark:text-ink-500 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-coral-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Fetching rate-limits config...</span>
          </div>
        ) : activeTab === 'pacing' ? (
          <div className="space-y-6">
            
            {/* Pacing Rules Setup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-coral-500" /> Dynamic Endpoint Pacing Category Limits
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Category 1: Read Actions */}
                  <div className="p-3 bg-paper-50 dark:bg-ink-950 border border-paper-100 dark:border-ink-850 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="block font-bold text-paper-800 dark:text-white">Standard Read</span>
                      <span className="block text-[10px] text-paper-400 dark:text-ink-500">GET lists, profile details, configs</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-paper-400">Request Limit</label>
                      <input 
                        type="number"
                        value={readLimit}
                        onChange={(e) => setReadLimit(Number(e.target.value))}
                        className="w-full bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-paper-400">Time Window (TTL Secs)</label>
                      <input 
                        type="number"
                        value={readTtl}
                        onChange={(e) => setReadTtl(Number(e.target.value))}
                        className="w-full bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Category 2: Write Actions */}
                  <div className="p-3 bg-paper-50 dark:bg-ink-950 border border-paper-100 dark:border-ink-850 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="block font-bold text-paper-800 dark:text-white">State Mutating</span>
                      <span className="block text-[10px] text-paper-400 dark:text-ink-500">POST inserts, PUT updates, DELETE</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-paper-400">Request Limit</label>
                      <input 
                        type="number"
                        value={writeLimit}
                        onChange={(e) => setWriteLimit(Number(e.target.value))}
                        className="w-full bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-paper-400">Time Window (TTL Secs)</label>
                      <input 
                        type="number"
                        value={writeTtl}
                        onChange={(e) => setWriteTtl(Number(e.target.value))}
                        className="w-full bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Category 3: Heavy Operations */}
                  <div className="p-3 bg-paper-50 dark:bg-ink-950 border border-paper-100 dark:border-ink-850 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="block font-bold text-paper-800 dark:text-white">Heavy Operations</span>
                      <span className="block text-[10px] text-paper-400 dark:text-ink-500">AI chat, ledger compile, bulk email</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-paper-400">Request Limit</label>
                      <input 
                        type="number"
                        value={heavyLimit}
                        onChange={(e) => setHeavyLimit(Number(e.target.value))}
                        className="w-full bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-paper-400">Time Window (TTL Secs)</label>
                      <input 
                        type="number"
                        value={heavyTtl}
                        onChange={(e) => setHeavyTtl(Number(e.target.value))}
                        className="w-full bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleSavePacingRules}
                    className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Categories & Multipliers
                  </button>
                </div>
              </div>

              {/* Tiers Multiplier settings */}
              <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-purple-500" /> Account Tier Multipliers
                </h3>
                <p className="text-[10px] text-paper-400 dark:text-ink-500 leading-normal">
                  Multipliers scale the base limits calculated. E.g. base Read = 100/min. Enterprise multiplier of 3.0x expands limits to 300/min.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-paper-400">Standard Tier Multiplier</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={multipliers.standard}
                      onChange={(e) => setMultipliers(prev => ({ ...prev, standard: Number(e.target.value) }))}
                      className="w-full bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl px-3 py-1.5 text-xs text-paper-800 dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-paper-400">Enterprise Tier Multiplier</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={multipliers.enterprise}
                      onChange={(e) => setMultipliers(prev => ({ ...prev, enterprise: Number(e.target.value) }))}
                      className="w-full bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl px-3 py-1.5 text-xs text-paper-800 dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-paper-400">Restricted Tier Multiplier</label>
                    <input 
                      type="number" 
                      step="0.05"
                      value={multipliers.restricted}
                      onChange={(e) => setMultipliers(prev => ({ ...prev, restricted: Number(e.target.value) }))}
                      className="w-full bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl px-3 py-1.5 text-xs text-paper-800 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* User Roster Multiplier Customizer */}
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5 text-coral-500" /> Active Platform Accounts (Managers, Tenants, Contractors)
                  </h3>
                  <span className="text-[10px] text-paper-400 dark:text-ink-500">Configure client rate limit multiplier tier per specific account</span>
                </div>
                
                {/* Search */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-paper-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">
                        <th className="px-4 py-2.5">User Identity</th>
                        <th className="px-4 py-2.5">Platform Role</th>
                        <th className="px-4 py-2.5">Access Scope</th>
                        <th className="px-4 py-2.5 text-right">Pacing Multiplier Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {filteredManagers.map(m => (
                        <tr key={m.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3">
                            <span className="block font-bold text-paper-900 dark:text-white">{m.name || 'Resident'}</span>
                            <span className="block text-[10px] text-paper-400 mt-0.5">{m.email}</span>
                          </td>
                          <td className="px-4 py-3 capitalize text-paper-600 dark:text-ink-300">{m.role}</td>
                          <td className="px-4 py-3 text-[10px] font-mono text-paper-400">All Portfolios</td>
                          <td className="px-4 py-3 text-right">
                            <select 
                              value={m.tier || 'standard'}
                              onChange={(e) => handleSaveUserTier(m.id, e.target.value)}
                              className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1 text-xs outline-none font-semibold text-paper-800 dark:text-white"
                            >
                              <option value="standard">Standard Tier (1.0x)</option>
                              <option value="enterprise">Enterprise Tier (3.0x)</option>
                              <option value="restricted">Restricted Tier (0.1x)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filteredManagers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-paper-400 dark:text-ink-600">
                            No managers or landlords match the search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* API Keys controls (2 cols) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* API Keys configuration */}
              <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
                    <Key className="w-4.5 h-4.5 text-purple-500" /> Active API Keys
                  </h3>
                </div>

                <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">
                          <th className="px-4 py-2.5">Key Label</th>
                          <th className="px-4 py-2.5">Allowed Scope</th>
                          <th className="px-4 py-2.5">Bucket Limit</th>
                          <th className="px-4 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                        {keys.map(k => (
                          <tr key={k.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                            <td className="px-4 py-3">
                              <span className="block font-bold text-paper-900 dark:text-white">{k.name}</span>
                              <span className="block text-[9px] font-mono text-paper-400 mt-0.5">{k.id}</span>
                            </td>
                            <td className="px-4 py-3 text-paper-600 dark:text-ink-300">{k.scope}</td>
                            <td className="px-4 py-3 font-mono font-semibold">{k.rateLimit}</td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleToggleKey(k.id)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  k.status === 'Active' 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-red-500/10 text-red-500'
                                }`}
                              >
                                {k.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            {/* Blacklisted IP list (1 col) */}
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-red-500" /> IP Blacklist Register
              </h3>

              <form onSubmit={handleAddBlacklist} className="flex gap-2">
                <input 
                  type="text" 
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="Enter IP (e.g. 192.168.1.1)"
                  className="flex-1 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl px-3 py-1.5 text-xs text-paper-800 dark:text-white outline-none"
                />
                <button 
                  type="submit"
                  className="px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Ban
                </button>
              </form>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {blacklist.map(ip => (
                  <div key={ip} className="flex items-center justify-between p-2.5 bg-paper-50 dark:bg-ink-950 rounded-xl border border-paper-200/50 dark:border-ink-850 text-xs">
                    <span className="font-mono font-semibold text-paper-800 dark:text-white">{ip}</span>
                    <button 
                      onClick={() => handleRemoveBlacklist(ip)}
                      className="p-1 hover:bg-red-500/15 rounded text-paper-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {blacklist.length === 0 && (
                  <p className="text-[10px] text-center text-paper-400 dark:text-ink-600 py-6">
                    No active IP bans applied.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </ModLayout>
  );
}
