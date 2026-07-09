'use client';

import React, { useState, useEffect } from 'react';
import ModLayout from '../../components/ModLayout';
import TenantStats from './TenantStats';
import TenantManagerModal from './TenantManagerModal';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, Shield, Settings, Loader2
} from 'lucide-react';

interface TenantListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  role: string;
  propertyName: string | null;
  unitLabel: string | null;
  rent: string | null;
  lastSeen: string | null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [totalTenantsCount, setTotalTenantsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('recent_desc');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalTenants: 0,
    activeSessions: 0,
    restrictedCount: 0,
    warningsIssued: 4
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('sort', sortOrder);
      if (appliedSearch.trim()) {
        params.append('search', appliedSearch.trim());
      }

      const res = await fetch(`/api/dashboard/security/tenants?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
        setTotalTenantsCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        triggerToast('Failed to fetch platform tenants');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error connecting to user API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [currentPage, sortOrder, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setSortOrder('recent_desc');
    setCurrentPage(1);
    fetchTenants();
    triggerToast('Tenants directory refreshed');
  };

  const handleOpenManage = async (tenant: TenantListItem) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/security/tenants/${tenant.id}`);
      if (res.ok) {
        const data = await res.json();
        const initials = data.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'T';
        const avatar = data.user.image || `https://placehold.co/100x100/1e2129/ffffff?text=${initials}`;

        const activeLease = data.leases.find((l: any) => l.status === 'active') || data.leases[0];

        const propertyGroups: Record<string, any[]> = {};
        data.leases.forEach((lease: any) => {
          const pName = lease.propertyName || 'Independent Residence';
          if (!propertyGroups[pName]) {
            propertyGroups[pName] = [];
          }
          propertyGroups[pName].push({
            name: lease.unitLabel || 'Standard Unit',
            from: lease.startDate ? new Date(lease.startDate).toLocaleDateString() : 'N/A',
            to: lease.status === 'active' ? 'Present' : (lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'N/A')
          });
        });
        const propertiesHistory = Object.entries(propertyGroups).map(([name, units]) => ({
          name,
          units
        }));

        const invoices = data.invoices.map((inv: any) => ({
          id: inv.id,
          description: inv.description || 'Rental Invoice',
          date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A',
          amount: Number(inv.amount),
          status: inv.status === 'paid' ? 'Paid' : (inv.status === 'pending' ? 'Pending' : 'Unpaid')
        }));

        const maintenance = data.maintenance.map((t: any) => ({
          id: t.id,
          title: t.title || t.description || 'Maintenance Request',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
          priority: t.urgency || 'Medium',
          status: t.status === 'open' ? 'In Progress' : 'Completed'
        }));

        setSelectedTenant({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || 'No Phone Number',
          property: activeLease?.propertyName || 'Independent Residence',
          unit: activeLease?.unitLabel || 'Standard Unit',
          rent: activeLease?.rent ? Number(activeLease.rent) : (tenant.rent ? Number(tenant.rent) : 0),
          leaseStart: activeLease?.startDate ? new Date(activeLease.startDate).toLocaleDateString() : 'N/A',
          leaseEnd: activeLease?.endDate ? new Date(activeLease.endDate).toLocaleDateString() : 'N/A',
          paymentHealth: 'Good',
          verification: data.user.role === 'suspended_tenant' ? 'Suspended' : 'Verified',
          joined: new Date(data.user.createdAt).toLocaleDateString(),
          balance: invoices.filter((i: any) => i.status !== 'Paid').reduce((acc: number, cur: any) => acc + cur.amount, 0),
          avatar,
          lastPayment: invoices.find((i: any) => i.status === 'Paid')?.date || 'N/A',
          propertiesHistory,
          invoices,
          maintenance
        });
      } else {
        triggerToast('Failed to load tenant details');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error loading tenant profile');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRestrictTenant = async (tenantId: string, message: string) => {
    try {
      const res = await fetch(`/api/dashboard/security/tenants/${tenantId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: message })
      });
      if (res.ok) {
        triggerToast(`Tenant account restricted`);
        setSelectedTenant(null);
        fetchTenants();
      } else {
        triggerToast('Failed to suspend tenant');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error restricting tenant profile');
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/dashboard/security/tenants/${tenantId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast(`Tenant account deleted successfully`);
        setSelectedTenant(null);
        fetchTenants();
      } else {
        triggerToast('Failed to delete tenant');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error deleting tenant account');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalTenantsCount / itemsPerPage));

  return (
    <ModLayout title="Users / Tenants">
      <div className="space-y-6 w-full pb-10 relative">
        
        {/* TOAST SYSTEM */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* LOADING INDICATOR FOR DETAIL MODAL */}
        {isDetailLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl p-5 shadow-2xl flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-coral-500 animate-pulse-slow" />
              <span className="text-xs font-bold text-paper-800 dark:text-white">Retrieving tenant profile...</span>
            </div>
          </div>
        )}

        {/* MODERATOR STATS PANEL */}
        <TenantStats 
          totalTenants={stats.totalTenants}
          activeSessions={stats.activeSessions}
          restrictedCount={stats.restrictedCount}
          warningsIssued={stats.warningsIssued}
        />

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-ink-900 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm trans-theme w-full">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row flex-1 gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant via email or name... (Press Enter)" 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner trans-theme font-sans"
              />
            </div>

            {/* Sorting Order */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 shrink-0">Sort By:</span>
              <select 
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1.5 text-xs text-paper-700 dark:text-ink-200 outline-none trans-theme font-semibold cursor-pointer"
              >
                <option value="recent_desc">Recently Joined (Newest)</option>
                <option value="recent_asc">Oldest Joined</option>
                <option value="rent_desc">Monthly Rent (Highest)</option>
                <option value="rent_asc">Monthly Rent (Lowest)</option>
              </select>
            </div>
          </form>

          {/* Action Tools */}
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

        {/* MODERATOR TABLE */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full trans-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[10px] font-black uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                  <th className="px-6 py-4">Tenant Account</th>
                  <th className="px-6 py-4">Residence Address</th>
                  <th className="px-6 py-4">Platform Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4">Monthly Rent</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/40 text-xs trans-theme">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-650">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-coral-500 mb-2" />
                      Loading tenant database roster...
                    </td>
                  </tr>
                ) : tenants.map((t) => {
                  const initials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'T';
                  const avatar = `https://placehold.co/100x100/1e2129/ffffff?text=${initials}`;
                  const isSuspended = t.role === 'suspended_tenant';
                  
                  return (
                    <tr 
                      key={t.id} 
                      className="group transition-colors hover:bg-paper-50/50 dark:hover:bg-ink-800/10"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={avatar} alt={t.name} className="w-9 h-9 rounded-full border border-paper-200 dark:border-ink-800 object-cover" />
                          <div>
                            <div className="font-bold text-paper-900 dark:text-white group-hover:text-coral-500 trans-subtle leading-tight">{t.name}</div>
                            <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-paper-800 dark:text-ink-100">{t.propertyName || 'Independent Residence'}</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{t.unitLabel || 'Standard Unit'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {!isSuspended ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Active Profile
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                            <Shield className="w-4 h-4 text-red-500 shrink-0" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-paper-800 dark:text-ink-100 font-mono">
                        {t.lastSeen ? new Date(t.lastSeen).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-paper-900 dark:text-white">
                        {t.rent ? `$${Number(t.rent).toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenManage(t)}
                          className="px-3 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <Settings className="w-3.5 h-3.5 text-paper-400 group-hover:text-coral-500 transition-colors" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && tenants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-500 text-xs">
                      No matching tenant accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme">
              <span>Showing {tenants.length} of {totalTenantsCount} accounts</span>
              
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

        {/* MODAL SYSTEM */}
        {selectedTenant && (
          <TenantManagerModal 
            tenant={selectedTenant}
            onClose={() => setSelectedTenant(null)}
            onRestrict={handleRestrictTenant}
            onDelete={handleDeleteTenant}
          />
        )}

      </div>
    </ModLayout>
  );
}
