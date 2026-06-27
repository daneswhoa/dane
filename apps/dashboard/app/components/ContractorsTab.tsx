'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorModal from './ErrorModal';
import {
  Users,
  Wrench,
  CircleDollarSign,
  ClipboardCheck,
  ArrowRight,
  Droplet,
  Zap,
  Leaf,
  Star,
  MapPin,
  Bookmark,
  Plus,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  Loader2,
  Phone,
  DollarSign,
  Mail,
  UserCheck,
  CheckCircle,
  X,
  ShieldCheck
} from 'lucide-react';

interface Contractor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  bio?: string;
  hourlyRate?: string;
  photoUrl?: string;
  locationName?: string;
  status: string;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  urgency: string;
  status: string;
  amount?: string;
  contractorId?: string;
}

export default function ContractorsTab() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorStack, setErrorStack] = useState('');

  // Filter states
  const [tradeFilter, setTradeFilter] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign job modal state
  const [selectedContractorForJob, setSelectedContractorForJob] = useState<Contractor | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  const router = useRouter();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('bookmarked_contractors');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const toggleBookmark = (id: string) => {
    const next = bookmarkedIds.includes(id) 
      ? bookmarkedIds.filter(x => x !== id) 
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    localStorage.setItem('bookmarked_contractors', JSON.stringify(next));
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch contractors
      const cRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/contractors`, {
        credentials: 'include',
      });
      if (!cRes.ok) throw new Error('Failed to load contractors');
      const cData = await cRes.json();
      setContractors(cData);

      // Fetch maintenance tickets to compute stats
      const tRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance`, {
        credentials: 'include',
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        setTickets(tData);
      }
    } catch (err: any) {
      setErrorTitle('Failed to Load Contractor Registry');
      setErrorMessage(err.message || 'Unable to connect to the backend server. Please make sure the service is running.');
      setErrorStack('fetchData\n./app/components/ContractorsTab.tsx');
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const networkCount = contractors.length;
  const activeJobs = tickets.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
  const ytdSpend = tickets.filter(t => t.status === 'paid').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const pendingApprovals = tickets.filter(t => t.status === 'completed').length;

  // Filter contractors
  const filteredContractors = contractors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          c.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrade = tradeFilter === 'All' || c.specialty === tradeFilter;
    
    let matchesRate = true;
    if (rateFilter === 'under-50') {
      matchesRate = Number(c.hourlyRate || 0) < 50;
    } else if (rateFilter === '50-100') {
      const rate = Number(c.hourlyRate || 0);
      matchesRate = rate >= 50 && rate <= 100;
    } else if (rateFilter === 'above-100') {
      matchesRate = Number(c.hourlyRate || 0) > 100;
    }

    return matchesSearch && matchesTrade && matchesRate;
  });

  // Assign an open ticket to a contractor
  const handleAssignTicket = async (ticketId: string) => {
    if (!selectedContractorForJob) return;
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId: selectedContractorForJob.id }),
      });

      if (!res.ok) {
        throw new Error('Could not assign contractor. Please check if your session is active.');
      }
      
      setAssignSuccess('Job successfully assigned to contractor!');
      setTimeout(() => {
        setSelectedContractorForJob(null);
        setAssignSuccess('');
        fetchData();
      }, 1500);
    } catch (err: any) {
      setErrorTitle('Assignment Failed');
      setErrorMessage(err.message || 'We could not assign this contractor to the selected work order.');
      setErrorStack(`handleAssignTicket\n./app/components/ContractorsTab.tsx`);
      setErrorModalOpen(true);
    } finally {
      setAssignLoading(false);
    }
  };

  const getTradeIcon = (specialty: string) => {
    const spec = specialty.toLowerCase();
    if (spec.includes('plumb')) return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
    if (spec.includes('elect')) return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    if (spec.includes('land')) return <Leaf className="w-3.5 h-3.5 text-emerald-500" />;
    return <Wrench className="w-3.5 h-3.5 text-coral-500" />;
  };

  // Find tickets eligible for assignment (either open or without assignee)
  const assignableTickets = tickets.filter(t => t.status === 'open' && !t.contractorId);

  // Dynamically compute recent contractors based on ticket assignments
  const getContractorStats = (contractorId: string) => {
    const contractorTickets = tickets.filter(t => t.contractorId === contractorId);
    const completed = contractorTickets.filter(t => t.status === 'completed' || t.status === 'paid').length;
    const active = contractorTickets.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
    return { completed, active, total: contractorTickets.length };
  };

  const recentContractors = contractors.filter(c => {
    const stats = getContractorStats(c.id);
    return stats.total > 0;
  });

  const displayRecentList = recentContractors.length > 0 
    ? recentContractors 
    : contractors.slice(0, 4);

  const filteredRecent = displayRecentList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          c.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrade = tradeFilter === 'All' || c.specialty === tradeFilter;
    
    let matchesRate = true;
    if (rateFilter === 'under-50') {
      matchesRate = Number(c.hourlyRate || 0) < 50;
    } else if (rateFilter === '50-100') {
      const rate = Number(c.hourlyRate || 0);
      matchesRate = rate >= 50 && rate <= 100;
    } else if (rateFilter === 'above-100') {
      matchesRate = Number(c.hourlyRate || 0) > 100;
    }

    return matchesSearch && matchesTrade && matchesRate;
  });

  const bookmarkedContractors = contractors.filter(c => bookmarkedIds.includes(c.id));

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto w-full animate-fade-in text-left">
      
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-md flex items-center justify-between text-xs">
          <span>{error}</span>
          <button onClick={() => setError('')} className="hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Contractor Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: My Network */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-3 flex flex-col gap-2 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Network Contractors</span>
            <Users className="w-4 h-4 text-coral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">{loading ? '...' : networkCount}</span>
            <span className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
              Active Trade Partners
            </span>
          </div>
        </div>

        {/* Metric 2: Active Jobs */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-3 flex flex-col gap-2 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Active Jobs</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">{loading ? '...' : activeJobs}</span>
            <span className="text-[9px] text-paper-500 dark:text-ink-400">
              Work orders in field
            </span>
          </div>
        </div>

        {/* Metric 3: YTD Spend */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-3 flex flex-col gap-2 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Maintenance Cost</span>
            <CircleDollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">
              ${loading ? '...' : ytdSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] text-paper-500 dark:text-ink-400">
              Paid repairs
            </span>
          </div>
        </div>

        {/* Metric 4: Pending Approvals */}
        <div className="bg-white dark:bg-ink-800 border border-coral-500/30 dark:border-coral-500/20 rounded-md p-3 flex flex-col gap-2 transition-colors shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-coral-50 dark:bg-coral-500/5 z-0 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between text-coral-700 dark:text-coral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Unsettled Invoices</span>
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className="text-xl font-bold text-coral-600 dark:text-coral-400">{loading ? '...' : pendingApprovals}</span>
            <span className="text-[9px] font-medium text-coral-700 dark:text-coral-300 bg-coral-100 dark:bg-coral-500/20 px-1 py-0.5 rounded border border-coral-200 dark:border-coral-500/20">
              Requires Review
            </span>
          </div>
        </div>
      </div>

      {/* Contractor Marketplace Banner */}
      <div className="bg-gradient-to-r from-coral-500/10 via-coral-500/[0.03] to-transparent border border-coral-500/20 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-coral-500">
            Contractor Marketplace
          </h3>
          <p className="text-xs text-paper-700 dark:text-ink-300 leading-normal max-w-2xl">
            Browse our curated network of certified local tradespeople. Find electricians, plumbers, and maintenance specialists who have set up their location, rates, and contact details.
          </p>
        </div>
        <button
          onClick={() => router.push('/contractors/marketplace')}
          className="shrink-0 bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition-all flex items-center gap-1.5 shadow-sm shadow-coral-500/10"
        >
          Browse Marketplace <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Bookmarked Contractors Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-paper-100 dark:border-ink-700 pb-2">
          <h2 className="text-sm font-semibold text-paper-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-coral-500 fill-coral-500" /> Bookmarked Trade Partners
          </h2>
          <span className="text-xs text-paper-500 dark:text-ink-400">Pinned ({bookmarkedContractors.length})</span>
        </div>

        {bookmarkedContractors.length === 0 ? (
          <div className="bg-paper-50 dark:bg-ink-900/40 border border-dashed border-paper-250 dark:border-ink-800 rounded-lg p-6 text-center">
            <Bookmark className="w-6 h-6 text-paper-400 dark:text-ink-600 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-paper-800 dark:text-ink-200">No Bookmarked Contractors</p>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1 max-w-sm mx-auto">
              Keep your preferred service providers pinned here for immediate dispatch and job assignment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedContractors.map(c => (
              <div key={c.id} className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-4 flex flex-col justify-between hover:shadow-sm transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2.5">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-paper-200 dark:border-ink-650" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center font-bold text-[10px]">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-paper-900 dark:text-white leading-tight text-xs flex items-center gap-1">
                          {c.name}
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </h3>
                        <p className="text-[9px] text-paper-500 dark:text-ink-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {c.locationName || 'Local Service'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleBookmark(c.id)}
                      className="text-coral-500 hover:text-paper-400 transition-all"
                      title="Remove Bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-coral-500 text-coral-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-[10px]">
                    <span className="inline-flex items-center gap-1 text-paper-700 dark:text-ink-200 bg-paper-100 dark:bg-ink-700 px-1.5 py-0.5 rounded border border-paper-200 dark:border-ink-600 font-medium">
                      {getTradeIcon(c.specialty)} {c.specialty}
                    </span>
                    <span className="font-semibold text-paper-900 dark:text-white">
                      ${c.hourlyRate || '50'} / hr
                    </span>
                  </div>

                  {c.phone && (
                    <div className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1 mb-4 font-mono">
                      <Phone className="w-3 h-3 text-paper-400" /> {c.phone}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedContractorForJob(c)}
                  className="w-full py-1.5 rounded text-[10px] font-semibold bg-coral-500 text-white hover:bg-coral-600 shadow-sm transition-all"
                >
                  Assign Work Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Trade History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-paper-150 dark:border-ink-700 pb-2 gap-2">
          <div>
            <h2 className="text-sm font-semibold text-paper-900 dark:text-white tracking-tight">Recent Trade History</h2>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Historical and active service providers in your properties.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="text" 
              placeholder="Search trade or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-900 dark:text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-coral-500"
            />
            
            <div className="relative">
              <select 
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs rounded pl-2 pr-6 py-1 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">All Trades</option>
                <option value="General Maintenance">General Maintenance</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Roofing">Roofing</option>
              </select>
              <ChevronDown className="w-3 h-3 text-paper-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={rateFilter}
                onChange={(e) => setRateFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs rounded pl-2 pr-6 py-1 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">Any Rate</option>
                <option value="under-50">Under $50/hr</option>
                <option value="50-100">$50 - $100/hr</option>
                <option value="above-100">Over $100/hr</option>
              </select>
              <ChevronDown className="w-3 h-3 text-paper-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            {(searchQuery || tradeFilter !== 'All' || rateFilter !== 'All') && (
              <button 
                onClick={() => { setSearchQuery(''); setTradeFilter('All'); setRateFilter('All'); }}
                className="px-2 py-1 rounded text-xs font-semibold bg-paper-100 dark:bg-ink-700 text-paper-700 dark:text-ink-200 hover:bg-paper-200 hover:text-white transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md overflow-hidden transition-colors shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-paper-50 dark:bg-ink-900/50 border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-700 dark:text-ink-400 font-medium transition-colors">
                  <th className="px-4 py-3 font-medium">Contractor / Business</th>
                  <th className="px-4 py-3 font-medium">Trade Specialty</th>
                  <th className="px-4 py-3 font-medium">Hourly Base Rate</th>
                  <th className="px-4 py-3 font-medium">Location Area</th>
                  <th className="px-4 py-3 font-medium">Completed Jobs</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 transition-colors">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-paper-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-coral-500" />
                        <span>Loading history database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-paper-500">
                      No contractors found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecent.map((c) => {
                    const stats = getContractorStats(c.id);
                    return (
                      <tr key={c.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-all duration-150 group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {c.photoUrl ? (
                              <img src={c.photoUrl} alt={c.name} className="w-7 h-7 rounded-full object-cover border border-paper-200 dark:border-ink-600" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center font-bold text-[10px]">
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                                {c.name}
                                <span title="Identity Verified"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /></span>
                              </div>
                              <div className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {c.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-paper-700 dark:text-ink-200 bg-paper-100 dark:bg-ink-700 px-1.5 py-0.5 rounded border border-paper-200 dark:border-ink-600 font-medium">
                            {getTradeIcon(c.specialty)} {c.specialty}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-paper-900 dark:text-white">${c.hourlyRate || '50'} / hr</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-paper-700 dark:text-ink-300">
                            <MapPin className="w-3 h-3 text-paper-400" /> {c.locationName || 'New York, NY'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-paper-900 dark:text-white">{stats.completed} Completed</span>
                            {stats.active > 0 && (
                              <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1 py-0.5 rounded border border-blue-500/20 font-medium">{stats.active} Active</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleBookmark(c.id)}
                              className="p-1.5 rounded hover:bg-paper-100 dark:hover:bg-ink-700 text-paper-400 hover:text-coral-500 transition-all"
                              title={bookmarkedIds.includes(c.id) ? "Remove Bookmark" : "Bookmark Contractor"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(c.id) ? 'fill-coral-500 text-coral-500' : ''}`} />
                            </button>
                            <button 
                              onClick={() => setSelectedContractorForJob(c)}
                              className="px-2.5 py-1 rounded text-[10px] font-semibold bg-coral-500 text-white hover:bg-coral-600 shadow-sm shadow-coral-500/10 transition-all"
                            >
                              Assign Job
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Assign Ticket */}
      {selectedContractorForJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 max-w-md w-full shadow-lg text-left">
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-paper-900 dark:text-white">Assign Work Order</h3>
                <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Assign to {selectedContractorForJob.name}</p>
              </div>
              <button 
                onClick={() => setSelectedContractorForJob(null)}
                className="text-paper-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignSuccess && (
              <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500 text-emerald-500 rounded text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{assignSuccess}</span>
              </div>
            )}

            {assignError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500 text-red-500 rounded text-xs flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>{assignError}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Select Open Work Order</label>
              
              {assignableTickets.length === 0 ? (
                <div className="p-4 border border-dashed border-paper-300 dark:border-ink-700 rounded text-center text-xs text-paper-500">
                  No unassigned open work orders available. Please create a new work order under the Maintenance tab first.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {assignableTickets.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleAssignTicket(t.id)}
                      className="p-3 border border-paper-200 dark:border-ink-700 rounded-md hover:border-coral-500 bg-paper-50 dark:bg-ink-900/50 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-xs text-paper-900 dark:text-white">{t.title}</div>
                        <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">Urgency: {t.urgency}</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-paper-400 rotate-[-90deg]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-paper-150 dark:border-ink-700/60 pt-3">
              <button 
                onClick={() => setSelectedContractorForJob(null)}
                className="px-3 py-1.5 text-xs text-paper-700 dark:text-ink-300 border border-paper-200 dark:border-ink-700 rounded hover:bg-paper-100 dark:hover:bg-ink-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title={errorTitle}
        message={errorMessage}
        callStack={errorStack}
      />

    </div>
  );
}
