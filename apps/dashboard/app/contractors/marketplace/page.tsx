'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import {
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Bookmark,
  ShieldCheck,
  CheckCircle,
  SlidersHorizontal,
  Wrench,
  Droplet,
  Zap,
  Leaf,
  Plus,
  Loader2,
  Sparkles
} from 'lucide-react';
import ErrorModal from '../../components/ErrorModal';

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

export default function ContractorsMarketplacePage() {
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');
  const [onlyCompleted, setOnlyCompleted] = useState(true); // Default to showing completed profiles first

  // Error modal state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorStack, setErrorStack] = useState('');

  // Assign job modal state
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    fetchMarketplaceData();
    const saved = localStorage.getItem('bookmarked_contractors');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError('');
    try {
      const cRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/contractors`, {
        credentials: 'include',
      });
      if (!cRes.ok) throw new Error('Failed to load contractors registry');
      const cData = await cRes.json();
      setContractors(cData);

      // Load tickets for assignment dropdown
      const tRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance`, {
        credentials: 'include',
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        setTickets(tData);
      }
    } catch (err: any) {
      setErrorTitle('Failed to Load Marketplace');
      setErrorMessage(err.message || 'Unable to connect to the backend server. Please verify connection.');
      setErrorStack('fetchMarketplaceData\n./app/contractors/marketplace/page.tsx');
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    const next = bookmarkedIds.includes(id) 
      ? bookmarkedIds.filter(x => x !== id) 
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    localStorage.setItem('bookmarked_contractors', JSON.stringify(next));
  };

  const handleAssignTicket = async (ticketId: string) => {
    if (!selectedContractor) return;
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId: selectedContractor.id }),
      });

      if (!res.ok) {
        throw new Error('Could not assign contractor. Please check your session.');
      }
      
      setAssignSuccess('Job assigned successfully!');
      setTimeout(() => {
        setSelectedContractor(null);
        setAssignSuccess('');
        fetchMarketplaceData();
      }, 1500);
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign work order.');
    } finally {
      setAssignLoading(false);
    }
  };

  const isProfileComplete = (c: Contractor) => {
    // Requires name, rate, phone, and locationName to be considered complete
    return !!(c.name && c.hourlyRate && c.phone && c.locationName);
  };

  const filteredContractors = contractors.filter(c => {
    // Profile completeness check
    if (onlyCompleted && !isProfileComplete(c)) {
      return false;
    }

    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.bio && c.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          c.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrade = selectedTrade === 'All' || c.specialty === selectedTrade;
    
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

  const getTradeIcon = (specialty: string) => {
    const spec = specialty.toLowerCase();
    if (spec.includes('plumb')) return <Droplet className="w-4 h-4 text-blue-500" />;
    if (spec.includes('elect')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (spec.includes('land')) return <Leaf className="w-4 h-4 text-emerald-500" />;
    return <Wrench className="w-4 h-4 text-coral-500" />;
  };

  const assignableTickets = tickets.filter(t => t.status === 'open' && !t.contractorId);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6 max-w-7xl mx-auto w-full animate-fade-in text-left">
        
        {/* Top Navigation / Breadcrumbs */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/contractors')}
            className="flex items-center gap-1 text-xs text-paper-500 hover:text-coral-500 transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Contractors
          </button>
          <span className="text-xs text-paper-300 dark:text-ink-700">/</span>
          <span className="text-xs font-semibold text-paper-900 dark:text-white">Marketplace</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-150 dark:border-ink-800 pb-5">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-paper-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-coral-500" /> Dane Properties Contractor Marketplace
            </h1>
            <p className="text-xs text-paper-500 dark:text-ink-400">
              Browse, bookmark, and assign local certified trade professionals. Only showing contractors who have completed setup profiles.
            </p>
          </div>
          
          {/* completeness toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-750 px-3 py-1.5 rounded-md hover:bg-paper-50 dark:hover:bg-ink-800 transition-all select-none">
            <input 
              type="checkbox"
              checked={onlyCompleted}
              onChange={(e) => setOnlyCompleted(e.target.checked)}
              className="accent-coral-500 rounded border-paper-300"
            />
            <span className="text-xs font-semibold text-paper-800 dark:text-ink-200">Show only complete profiles</span>
          </label>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-paper-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by name, trade, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-750 rounded focus:outline-none focus:border-coral-500 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Trade Select */}
            <div className="space-y-1">
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-750 text-paper-800 dark:text-ink-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">All Trades</option>
                <option value="General Maintenance">General Maintenance</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Roofing">Roofing</option>
              </select>
            </div>

            {/* Rate Select */}
            <div className="space-y-1">
              <select
                value={rateFilter}
                onChange={(e) => setRateFilter(e.target.value)}
                className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-750 text-paper-800 dark:text-ink-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">Any Hourly Rate</option>
                <option value="under-50">Under $50 / hr</option>
                <option value="50-100">$50 - $100 / hr</option>
                <option value="above-100">Over $100 / hr</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || selectedTrade !== 'All' || rateFilter !== 'All' || !onlyCompleted) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTrade('All');
                  setRateFilter('All');
                  setOnlyCompleted(true);
                }}
                className="text-xs font-semibold text-coral-500 hover:text-coral-600 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="ml-auto text-xs text-paper-500 dark:text-ink-400">
            Found {filteredContractors.length} service providers
          </div>
        </div>

        {/* Marketplace Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-coral-500 animate-spin" />
            <span className="text-xs text-paper-500">Retrieving trade profiles...</span>
          </div>
        ) : filteredContractors.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-800/30">
            <Wrench className="w-8 h-8 text-paper-300 dark:text-ink-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-paper-800 dark:text-ink-200">No matching contractors</p>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1 max-w-xs mx-auto">
              We couldn't find any contractors matching your criteria. Try adjusting filters or search queries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map((c) => {
              const hasLogo = !!c.photoUrl;
              const hasRate = !!c.hourlyRate;
              const hasPhone = !!c.phone;
              const hasLocation = !!c.locationName;
              const isComplete = isProfileComplete(c);

              return (
                <div 
                  key={c.id} 
                  className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                >
                  {/* Subtle complete profile highlight border */}
                  {isComplete && (
                    <div className="absolute top-0 right-0 bg-coral-500/10 text-coral-600 dark:text-coral-400 px-2 py-0.5 rounded-bl text-[8px] font-bold uppercase tracking-wider">
                      Setup Completed
                    </div>
                  )}

                  <div>
                    {/* Upper row: Avatar/Logo & Bookmark */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {hasLogo ? (
                          <img 
                            src={c.photoUrl} 
                            alt={c.name} 
                            className="w-11 h-11 rounded-md object-cover border border-paper-200 dark:border-ink-650"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-md bg-coral-500/10 text-coral-500 flex items-center justify-center font-bold text-sm border border-coral-500/20">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-paper-900 dark:text-white leading-tight flex items-center gap-1 group-hover:text-coral-500 transition-colors">
                            {c.name}
                            <span title="Verified Professional"><ShieldCheck className="w-4 h-4 text-emerald-500" /></span>
                          </h3>
                          <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5 flex items-center gap-1">
                            {getTradeIcon(c.specialty)} {c.specialty}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(c.id)}
                        className="text-paper-400 hover:text-coral-500 p-1 transition-all"
                        title={bookmarkedIds.includes(c.id) ? "Remove Bookmark" : "Bookmark Contractor"}
                      >
                        <Bookmark 
                          className={`w-4.5 h-4.5 ${
                            bookmarkedIds.includes(c.id) ? 'fill-coral-500 text-coral-500' : ''
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Bio */}
                    {c.bio && (
                      <p className="text-[11px] text-paper-600 dark:text-ink-300 leading-normal line-clamp-3 mb-4 italic">
                        "{c.bio}"
                      </p>
                    )}

                    {/* Meta Fields: Rate, Location, Phone */}
                    <div className="space-y-2 border-t border-paper-100 dark:border-ink-750 pt-3 mb-4">
                      
                      {/* Rate */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-400 dark:text-ink-500 font-semibold uppercase tracking-wider text-[9px]">Base Labor Rate</span>
                        <span className="font-semibold text-paper-900 dark:text-white">
                          {hasRate ? `€${c.hourlyRate} / hr` : 'Not configured'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-400 dark:text-ink-500 font-semibold uppercase tracking-wider text-[9px]">Location / Area</span>
                        <span className="text-paper-700 dark:text-ink-200 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-paper-450" /> {hasLocation ? c.locationName : 'N/A'}
                        </span>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-400 dark:text-ink-500 font-semibold uppercase tracking-wider text-[9px]">Phone Contact</span>
                        <span className="font-mono text-paper-755 dark:text-ink-300 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-paper-450" /> {hasPhone ? c.phone : 'Unspecified'}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-400 dark:text-ink-500 font-semibold uppercase tracking-wider text-[9px]">Email Address</span>
                        <span className="text-paper-600 dark:text-ink-400 flex items-center gap-1 truncate max-w-[160px]" title={c.email}>
                          <Mail className="w-3.5 h-3.5 text-paper-450" /> {c.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedContractor(c)}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-coral-500 text-white rounded hover:bg-coral-600 shadow-sm shadow-coral-500/10 transition-all"
                    >
                      Assign Job
                    </button>
                    {c.phone && (
                      <a 
                        href={`tel:${c.phone}`}
                        className="p-2 border border-paper-250 dark:border-ink-700 rounded text-paper-500 hover:text-coral-500 dark:hover:text-white transition-all flex items-center justify-center"
                        title="Call Contractor"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: Assign Work Order */}
        {selectedContractor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 max-w-md w-full shadow-lg text-left">
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-paper-900 dark:text-white">Assign Work Order</h3>
                  <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Assign to {selectedContractor.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedContractor(null)}
                  className="text-paper-450 hover:text-coral-500 transition-colors"
                >
                  <span className="text-lg">×</span>
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
                  <span>{assignError}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Select Open Work Order</label>
                
                {assignableTickets.length === 0 ? (
                  <div className="p-4 border border-dashed border-paper-250 dark:border-ink-750 rounded text-center text-xs text-paper-500">
                    No unassigned open work orders available. Create a new work order under the Maintenance tab first.
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
                        <span className="text-xs text-coral-500 font-bold">Assign</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-paper-150 dark:border-ink-750 pt-3">
                <button 
                  onClick={() => setSelectedContractor(null)}
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
    </DashboardLayout>
  );
}
