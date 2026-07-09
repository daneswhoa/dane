'use client';

import React, { useState, useEffect } from 'react';
import ModLayout from '../../components/ModLayout';
import ContractorStats from './ContractorStats';
import ContractorManagerModal from './ContractorManagerModal';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, Shield, Settings, Star, Loader2
} from 'lucide-react';

interface ContractorListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  joined: string;
  lastActive: string | null;
  specialty: string | null;
  company: string | null;
  rating: number;
  completedJobs: number;
  activeJobs: number;
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<ContractorListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedContractor, setSelectedContractor] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalContractors: 0,
    activeCount: 0,
    suspendedCount: 0,
    activeDispatches: 0
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchContractors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('specialty', filterSpecialty);
      params.append('status', filterStatus);
      if (appliedSearch.trim()) {
        params.append('search', appliedSearch.trim());
      }

      const res = await fetch(`/api/dashboard/security/contractors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContractors(data.contractors || []);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        triggerToast('Failed to fetch platform contractors');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error connecting to user API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [currentPage, filterSpecialty, filterStatus, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setFilterSpecialty('All');
    setFilterStatus('All');
    setCurrentPage(1);
    fetchContractors();
    triggerToast('Contractors list refreshed');
  };

  const handleOpenManage = async (c: ContractorListItem) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/security/contractors/${c.id}`);
      if (res.ok) {
        const data = await res.json();
        const initials = data.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'C';
        const avatar = data.user.image || `https://placehold.co/100x100/1e2129/ffffff?text=${initials}`;

        const activeTickets = data.activeTickets.map((t: any) => ({
          id: t.id,
          title: t.title || t.description || 'Maintenance dispatch request',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
          status: t.status === 'open' ? 'Assigned' : 'In Progress',
          priority: t.urgency || 'Medium'
        }));

        const jobHistory = data.jobHistory.map((t: any) => ({
          id: t.id,
          title: t.title || t.description || 'Completed repair task',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
          status: 'Completed',
          cost: t.amount ? Number(t.amount) : 0
        }));

        setSelectedContractor({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || 'No Phone Number',
          specialty: data.contractor?.specialty || 'General Maintenance',
          company: data.contractor?.bio || 'Independent Contractor',
          rating: c.rating ? Number(c.rating) : 4.8,
          completedJobs: jobHistory.length,
          joined: new Date(data.user.createdAt).toLocaleDateString(),
          verification: data.user.role === 'suspended_contractor' ? 'Suspended' : 'Verified',
          avatar,
          activeTickets,
          jobHistory
        });
      } else {
        triggerToast('Failed to load contractor details');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error loading contractor details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRestrictContractor = async (contractorId: string, message: string) => {
    try {
      const res = await fetch(`/api/dashboard/security/contractors/${contractorId}/suspend`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast(`Contractor suspended successfully`);
        setSelectedContractor(null);
        fetchContractors();
      } else {
        triggerToast('Failed to suspend contractor');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error restricting contractor');
    }
  };

  const handleDeleteContractor = async (contractorId: string) => {
    try {
      const res = await fetch(`/api/dashboard/security/contractors/${contractorId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast(`Contractor profile deleted`);
        setSelectedContractor(null);
        fetchContractors();
      } else {
        triggerToast('Failed to delete contractor');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error deleting contractor profile');
    }
  };

  const specialties = ['Electrical', 'Plumbing', 'HVAC', 'General Repair', 'Roofing', 'Painting'];
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <ModLayout title="Users / Contractors">
      <div className="space-y-6 w-full pb-10 relative">
        
        {/* TOAST */}
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
              <span className="text-xs font-bold text-paper-800 dark:text-white">Retrieving contractor dispatch file...</span>
            </div>
          </div>
        )}

        {/* STATS PANEL */}
        <ContractorStats 
          totalContractors={stats.totalContractors}
          activeCount={stats.activeCount}
          suspendedCount={stats.suspendedCount}
          activeDispatches={stats.activeDispatches}
        />

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-ink-900 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm trans-theme w-full">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row flex-1 gap-3">
            {/* Search */}
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor, firm, specialty... (Enter)" 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner trans-theme"
              />
            </div>

            {/* Specialty filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 shrink-0">Specialty:</span>
              <select 
                value={filterSpecialty}
                onChange={(e) => {
                  setFilterSpecialty(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2.5 py-1.5 text-xs text-paper-700 dark:text-ink-200 outline-none trans-theme font-semibold cursor-pointer"
              >
                <option value="All">All Specialties</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
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
                <option value="Active">Active Specialists</option>
                <option value="Suspended">Suspended Specialists</option>
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
                  <th className="px-6 py-4">Contractor</th>
                  <th className="px-6 py-4">Specialty & Firm</th>
                  <th className="px-6 py-4">Active Jobs</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Platform Status</th>
                  <th className="px-6 py-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/40 text-xs trans-theme">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-650">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-coral-500 mb-2" />
                      Loading contractors directory...
                    </td>
                  </tr>
                ) : contractors.map((c) => {
                  const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'C';
                  const avatar = `https://placehold.co/100x100/1e2129/ffffff?text=${initials}`;
                  const isSuspended = c.role === 'suspended_contractor';

                  return (
                    <tr 
                      key={c.id} 
                      className="group transition-colors hover:bg-paper-50/50 dark:hover:bg-ink-800/10"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={avatar} alt={c.name} className="w-9 h-9 rounded-full border border-paper-200 dark:border-ink-800 object-cover" />
                          <div>
                            <div className="font-bold text-paper-900 dark:text-white group-hover:text-coral-500 trans-subtle leading-tight">{c.name}</div>
                            <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-paper-800 dark:text-ink-100">{c.specialty || 'General Maintenance'}</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{c.company || 'Independent'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-paper-900 dark:text-white">
                        {c.activeJobs} Jobs
                      </td>
                      <td className="px-6 py-4 font-medium text-paper-800 dark:text-ink-100 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {Number(c.rating).toFixed(1)}
                      </td>
                      <td className="px-6 py-4">
                        {!isSuspended ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Active Specialist
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                            <Shield className="w-4 h-4 text-red-500 shrink-0" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenManage(c)}
                          className="px-3 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <Settings className="w-3.5 h-3.5 text-paper-400 group-hover:text-coral-500 transition-colors" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && contractors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-paper-400 dark:text-ink-500 text-xs">
                      No matching contractors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme">
              <span>Showing {contractors.length} of {totalCount} specialists</span>
              
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
        {selectedContractor && (
          <ContractorManagerModal 
            contractor={selectedContractor}
            onClose={() => setSelectedContractor(null)}
            onRestrict={handleRestrictContractor}
            onDelete={handleDeleteContractor}
          />
        )}

      </div>
    </ModLayout>
  );
}
