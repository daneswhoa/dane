'use client';

import React, { useState, useEffect } from 'react';
import ModLayout from '../components/ModLayout';
import OrganizationStats from './OrganizationStats';
import OrganizationManagerModal, { Organization } from './OrganizationManagerModal';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, Shield, Settings, Building, Users, Loader2
} from 'lucide-react';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterTier, setFilterTier] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalProperties: 0,
    totalPendingInvites: 0,
    suspendedCount: 0
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('tier', filterTier);
      params.append('status', filterStatus);
      if (appliedSearch.trim()) {
        params.append('search', appliedSearch.trim());
      }

      const res = await fetch(`/api/dashboard/security/organizations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        triggerToast('Failed to fetch corporate organizations');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error connecting to security api');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage, filterTier, filterStatus, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setFilterTier('All');
    setFilterStatus('All');
    setCurrentPage(1);
    fetchOrganizations();
    triggerToast('Corporate organizations synchronized');
  };

  const handleOpenManage = async (org: any) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/security/organizations/${encodeURIComponent(org.name)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrg(data);
      } else {
        triggerToast('Failed to load organization profile');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error loading organization details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRestrictOrg = async (orgId: string, message: string) => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/dashboard/security/organizations/${encodeURIComponent(selectedOrg.name)}/suspend`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast(`Organization suspended successfully`);
        setSelectedOrg(null);
        fetchOrganizations();
      } else {
        triggerToast('Failed to suspend organization');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error restricting organization');
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/dashboard/security/organizations/${encodeURIComponent(selectedOrg.name)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast(`Organization credentials permanently deleted`);
        setSelectedOrg(null);
        fetchOrganizations();
      } else {
        triggerToast('Failed to delete organization');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error deleting organization');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <ModLayout title="Organizations">
      <div className="space-y-6 w-full pb-10 relative">
        
        {/* TOAST PANEL */}
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
              <span className="text-xs font-bold text-paper-800 dark:text-white">Retrieving corporate portfolio logs...</span>
            </div>
          </div>
        )}

        {/* STATS PANEL */}
        <OrganizationStats 
          totalOrgs={stats.totalOrgs}
          totalProperties={stats.totalProperties}
          totalPendingInvites={stats.totalPendingInvites}
          suspendedCount={stats.suspendedCount}
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
                placeholder="Search org name, HQ area... (Enter)" 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner trans-theme"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 shrink-0">Tier:</span>
              <select 
                value={filterTier}
                onChange={(e) => {
                  setFilterTier(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1.5 text-xs text-paper-700 dark:text-ink-200 outline-none trans-theme font-semibold cursor-pointer"
              >
                <option value="All">All Plans</option>
                <option value="Enterprise">Enterprise Tier</option>
                <option value="Growth">Growth Tier</option>
              </select>
            </div>

            {/* Platform Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 shrink-0">Status:</span>
              <select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1.5 text-xs text-paper-700 dark:text-ink-200 outline-none trans-theme font-semibold cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Orgs</option>
                <option value="Suspended">Suspended Orgs</option>
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
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Plan & Status</th>
                  <th className="px-6 py-4">Managed Properties</th>
                  <th className="px-6 py-4">Active Members</th>
                  <th className="px-6 py-4">Platform Warnings</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/40 text-xs trans-theme">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-650">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-coral-500 mb-2" />
                      Loading organizations directory...
                    </td>
                  </tr>
                ) : organizations.map((org) => (
                  <tr 
                    key={org.id} 
                    className="group transition-colors hover:bg-paper-50/50 dark:hover:bg-ink-800/10"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                          {org.logo}
                        </div>
                        <div>
                          <div className="font-bold text-paper-900 dark:text-white group-hover:text-coral-500 trans-subtle leading-tight">{org.name}</div>
                          <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">License: {org.businessLicense}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-paper-800 dark:text-ink-100">{org.billingTier}</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{org.paymentStatus}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-paper-900 dark:text-white">
                      <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-paper-400" /> {org.propertiesCount} Portfolio</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-paper-900 dark:text-white">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-paper-400" /> {org.membersCount} Active</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-red-500">
                      {org.warningsCount} Warnings
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenManage(org)}
                        className="px-3 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
                      >
                        <Settings className="w-3.5 h-3.5 text-paper-400 group-hover:text-coral-500 transition-colors" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && organizations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-500 text-xs">
                      No matching organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme">
              <span>Showing {organizations.length} of {totalCount} organizations</span>
              
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
        {selectedOrg && (
          <OrganizationManagerModal 
            organization={selectedOrg}
            onClose={() => setSelectedOrg(null)}
            onRestrict={handleRestrictOrg}
            onDelete={handleDeleteOrg}
          />
        )}

      </div>
    </ModLayout>
  );
}
