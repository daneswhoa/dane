'use client';

import React, { useState, useEffect } from 'react';
import ModLayout from '../../components/ModLayout';
import ModeratorStats from './ModeratorStats';
import ModeratorManagerModal from './ModeratorManagerModal';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, Shield, Settings, Activity, Loader2
} from 'lucide-react';

interface ModeratorListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  joined: string;
  lastActive: string | null;
  actionsTaken: number;
}

export default function ModeratorsPage() {
  const [moderators, setModerators] = useState<ModeratorListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedModerator, setSelectedModerator] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalModerators: 0,
    activeCount: 0,
    suspendedCount: 0,
    totalLogs: 0
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchModerators = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('status', filterStatus);
      if (appliedSearch.trim()) {
        params.append('search', appliedSearch.trim());
      }

      const res = await fetch(`/api/dashboard/security/moderators?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setModerators(data.moderators || []);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        triggerToast('Failed to fetch moderator roster');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error loading staff directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModerators();
  }, [currentPage, filterStatus, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setFilterStatus('All');
    setCurrentPage(1);
    fetchModerators();
    triggerToast('Staff records refreshed');
  };

  const handleOpenManage = async (m: ModeratorListItem) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/security/moderators/${m.id}`);
      if (res.ok) {
        const data = await res.json();
        const initials = data.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'M';
        const avatar = data.user.image || `https://placehold.co/100x100/1e2129/ffffff?text=${initials}`;

        const moderationLogs = data.logs.map((log: any) => ({
          id: log.id,
          action: log.description || log.categoryLabel || 'Security Action',
          date: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
          detail: `IP: ${log.ip} | Location: ${log.location} | Severity: ${log.severity}`
        }));

        setSelectedModerator({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || 'No Phone Number',
          role: data.user.role === 'admin' ? 'Security Administrator' : 'Content Auditor',
          actionsTaken: moderationLogs.length,
          joined: new Date(data.user.createdAt).toLocaleDateString(),
          verification: data.user.role === 'suspended_moderator' ? 'Suspended' : 'Verified',
          avatar,
          assignedQueues: ['System Audit Feed', 'Rate Limits Configuration', 'Staff Verification', 'Security Escalations'],
          moderationLogs
        });
      } else {
        triggerToast('Failed to load moderator details');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error loading staff details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRestrictModerator = async (moderatorId: string, message: string) => {
    try {
      const res = await fetch(`/api/dashboard/security/moderators/${moderatorId}/suspend`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast(`Staff permissions suspended`);
        setSelectedModerator(null);
        fetchModerators();
      } else {
        triggerToast('Failed to suspend staff credentials');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error restricting staff profile');
    }
  };

  const handleDeleteModerator = async (moderatorId: string) => {
    try {
      const res = await fetch(`/api/dashboard/security/moderators/${moderatorId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast(`Staff credentials permanently removed`);
        setSelectedModerator(null);
        fetchModerators();
      } else {
        triggerToast('Failed to delete staff member');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error deleting staff member');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <ModLayout title="Users / Moderators">
      <div className="space-y-6 w-full pb-10 relative">
        
        {/* TOAST SYSTEM */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isDetailLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl p-5 shadow-2xl flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-coral-500 animate-pulse-slow" />
              <span className="text-xs font-bold text-paper-800 dark:text-white">Retrieving staff logs history...</span>
            </div>
          </div>
        )}

        {/* STATS PANEL */}
        <ModeratorStats 
          totalModerators={stats.totalModerators}
          activeCount={stats.activeCount}
          suspendedCount={stats.suspendedCount}
          totalLogs={stats.totalLogs}
        />

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-ink-900 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm trans-theme w-full">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row flex-1 gap-3">
            {/* Search */}
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff name, security role, or email... (Enter)" 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner trans-theme"
              />
            </div>

            {/* Platform Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 shrink-0">Platform Status:</span>
              <select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1.5 text-xs text-paper-700 dark:text-ink-200 outline-none trans-theme font-semibold cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Staff</option>
                <option value="Suspended">Suspended Staff</option>
              </select>
            </div>
          </form>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button 
              onClick={handleRefresh}
              className="p-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-paper-700 dark:text-ink-200 trans-subtle flex items-center justify-center"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-coral-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full trans-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[10px] font-black uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                  <th className="px-6 py-4">Moderator Account</th>
                  <th className="px-6 py-4">Operational Role</th>
                  <th className="px-6 py-4">Incidents Resolved</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Platform Status</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/40 text-xs trans-theme">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-650">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-coral-500 mb-2" />
                      Loading moderators registry...
                    </td>
                  </tr>
                ) : moderators.map((m) => {
                  const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M';
                  const avatar = `https://placehold.co/100x100/1e2129/ffffff?text=${initials}`;
                  const isSuspended = m.role === 'suspended_moderator';

                  return (
                    <tr 
                      key={m.id} 
                      className="group transition-colors hover:bg-paper-50/50 dark:hover:bg-ink-800/10"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={avatar} alt={m.name} className="w-9 h-9 rounded-full border border-paper-200 dark:border-ink-800 object-cover" />
                          <div>
                            <div className="font-bold text-paper-900 dark:text-white group-hover:text-coral-500 trans-subtle leading-tight">{m.name}</div>
                            <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-paper-800 dark:text-ink-100">
                          {m.role === 'admin' ? 'Security Administrator' : 'Content Auditor'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-paper-900 dark:text-white">
                        <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-paper-400" /> {m.actionsTaken} Closed</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-paper-900 dark:text-white">
                        {new Date(m.joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {!isSuspended ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Active Staff
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                            <Shield className="w-4 h-4 text-red-500 shrink-0" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenManage(m)}
                          className="px-3 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <Settings className="w-3.5 h-3.5 text-paper-400 group-hover:text-coral-500 transition-colors" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && moderators.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-500 text-xs">
                      No matching moderators found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme">
              <span>Showing {moderators.length} of {totalCount} staff</span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || totalPages <= 1}
                  className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed trans-subtle"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold px-2">Page {currentPage} of {totalPages || 1}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages <= 1}
                  className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed trans-subtle"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        {selectedModerator && (
          <ModeratorManagerModal 
            moderator={selectedModerator}
            onClose={() => setSelectedModerator(null)}
            onRestrict={handleRestrictModerator}
            onDelete={handleDeleteModerator}
          />
        )}

      </div>
    </ModLayout>
  );
}
