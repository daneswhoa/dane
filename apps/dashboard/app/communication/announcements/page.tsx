'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useSession } from '@repo/auth';
import { 
  Megaphone, 
  Send, 
  Users, 
  Search, 
  Plus, 
  AlertTriangle, 
  Filter, 
  Clock, 
  Building,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audienceType: 'all' | 'property';
  targetPropertyId: string | null;
  arrearsFilter: 'all' | 'with_arrears' | 'with_arrears_due_date' | 'without_arrears';
  sentCount: number;
  createdAt: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

export default function CommunicationAnnouncementsPage() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'property'>('all');
  const [targetPropertyId, setTargetPropertyId] = useState('');
  const [arrearsFilter, setArrearsFilter] = useState<'all' | 'with_arrears' | 'with_arrears_due_date' | 'without_arrears'>('all');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterArrears, setFilterArrears] = useState('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (!session) return;
    loadProperties();
    loadAnnouncements();
  }, [session]);

  const loadProperties = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/properties`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProperties(data);
        }
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/announcements`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title,
        content,
        audienceType,
        targetPropertyId: audienceType === 'property' ? targetPropertyId : undefined,
        arrearsFilter,
      };

      const res = await fetch(`${API_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(`Announcement successfully broadcasted to ${data.sentCount} tenants!`);
        // Reset form
        setTitle('');
        setContent('');
        setAudienceType('all');
        setTargetPropertyId('');
        setArrearsFilter('all');
        setShowCreateForm(false);
        // Refresh history
        loadAnnouncements();
      } else {
        setErrorMessage(data.message || 'Failed to broadcast announcement.');
      }
    } catch (err) {
      setErrorMessage('An error occurred while broadcasting the announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter announcements for history log view
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch = 
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProperty = 
      filterProperty === 'all' || 
      (ann.audienceType === 'property' && ann.targetPropertyId === filterProperty);

    const matchesArrears = 
      filterArrears === 'all' || 
      ann.arrearsFilter === filterArrears;

    return matchesSearch && matchesProperty && matchesArrears;
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-paper-900 dark:text-white tracking-tight flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-coral-500" />
              In-App Announcements
            </h1>
            <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
              Create and broadcast urgent or general in-app notices directly to tenant dashboards.
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-all shadow-sm active:scale-95 whitespace-nowrap self-start md:self-auto"
          >
            {showCreateForm ? 'View History Logs' : (
              <>
                <Plus className="w-4 h-4" />
                Broadcast Notice
              </>
            )}
          </button>
        </div>

        {/* Banner Alert messages */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg p-3 text-xs flex items-center gap-2.5 shadow-sm">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-coral-500/10 border border-coral-500/20 text-coral-600 dark:text-coral-400 rounded-lg p-3 text-xs flex items-center gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-coral-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Broadcast Form (If Open) */}
        {showCreateForm ? (
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-lg max-w-3xl animate-slide-up">
            <h2 className="text-sm font-bold text-paper-950 dark:text-white uppercase tracking-wider mb-4 border-b border-paper-100 dark:border-ink-750 pb-2">
              Create New Broadcast Notice
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-paper-700 dark:text-ink-300">
                  Notice Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled water shutdown, Lease renewals, General policy update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 outline-none text-paper-950 dark:text-white transition-all"
                />
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-paper-700 dark:text-ink-300">
                  Notice Message Content *
                </label>
                <textarea
                  placeholder="Draft your detailed message to tenants here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 outline-none text-paper-955 dark:text-white transition-all resize-none"
                />
              </div>

              {/* Targets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Target Audience Scope */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-paper-700 dark:text-ink-300">
                    Target Property Scope
                  </label>
                  <select
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value as 'all' | 'property')}
                    className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 outline-none text-paper-800 dark:text-white"
                  >
                    <option value="all">Broadcast to All Properties</option>
                    <option value="property">Restrict to Specific Property</option>
                  </select>
                </div>

                {/* Specific Property Selector */}
                {audienceType === 'property' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-paper-700 dark:text-ink-300">
                      Choose Target Property *
                    </label>
                    <select
                      value={targetPropertyId}
                      onChange={(e) => setTargetPropertyId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 outline-none text-paper-800 dark:text-white"
                    >
                      <option value="">-- Choose Property --</option>
                      {properties.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Arrears Filter Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-paper-700 dark:text-ink-300">
                    Tenant Financial Filter
                  </label>
                  <select
                    value={arrearsFilter}
                    onChange={(e) => setArrearsFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-lg text-xs focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 outline-none text-paper-800 dark:text-white"
                  >
                    <option value="all">All Tenants (Regardless of Arrears)</option>
                    <option value="with_arrears">Tenants With Arrears (&gt; $0)</option>
                    <option value="with_arrears_due_date">Tenants With Arrears past Due Date (Overdue Invoices)</option>
                    <option value="without_arrears">Tenants Without Arrears ($0 / No Balance)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-100 dark:border-ink-750">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-paper-150 dark:bg-ink-900 border border-paper-250 dark:border-ink-750 text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md shadow-coral-500/20 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Broadcasting...' : 'Broadcast Notice'}
                </button>
              </div>

            </form>
          </div>
        ) : (
          
          /* History View */
          <div className="space-y-4">
            
            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 p-3 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-sm">
              
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-paper-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-md text-xs focus:ring-2 focus:ring-coral-500/10 focus:border-coral-500 outline-none text-paper-950 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Property Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-paper-400" />
                  <select
                    value={filterProperty}
                    onChange={(e) => setFilterProperty(e.target.value)}
                    className="px-2.5 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-md text-xs text-paper-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-coral-500"
                  >
                    <option value="all">All Properties</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arrears Filter */}
                <select
                  value={filterArrears}
                  onChange={(e) => setFilterArrears(e.target.value)}
                  className="px-2.5 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-md text-xs text-paper-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-coral-500"
                >
                  <option value="all">All Financial Statuses</option>
                  <option value="with_arrears">With Arrears</option>
                  <option value="with_arrears_due_date">Overdue Invoices</option>
                  <option value="without_arrears">Without Arrears</option>
                </select>
              </div>

            </div>

            {/* Logs List */}
            {loading ? (
              <div className="text-center py-12 text-paper-500 dark:text-ink-400 text-xs">
                <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading announcement history logs...
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-10 text-center space-y-2">
                <FileText className="w-10 h-10 text-paper-300 dark:text-ink-600 mx-auto" />
                <h3 className="text-xs font-bold text-paper-800 dark:text-white uppercase tracking-wider">No Broadcast Logs Found</h3>
                <p className="text-xs text-paper-500 dark:text-ink-400 max-w-sm mx-auto">
                  There are no announcements matching your current filters, or you haven't sent any in-app broadcasts yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAnnouncements.map((ann) => {
                  const targetProperty = properties.find((p) => p.id === ann.targetPropertyId);
                  
                  return (
                    <div 
                      key={ann.id}
                      className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 hover:border-paper-300 dark:hover:border-ink-600 rounded-lg p-4 shadow-sm transition-all flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-paper-900 dark:text-white">
                            {ann.title}
                          </span>
                          
                          {/* Property Scope Badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            ann.audienceType === 'all' 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          }`}>
                            <Building className="w-2.5 h-2.5" />
                            {ann.audienceType === 'all' ? 'All Properties' : (targetProperty?.name || 'Property Scoped')}
                          </span>

                          {/* Financial Filter Badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            ann.arrearsFilter === 'all' 
                              ? 'bg-paper-100 dark:bg-ink-900 text-paper-600 dark:text-ink-400 border border-paper-200 dark:border-ink-800' 
                              : ann.arrearsFilter === 'without_arrears'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-coral-500/10 text-coral-600 dark:text-coral-400 border border-coral-500/20'
                          }`}>
                            <DollarSign className="w-2.5 h-2.5" />
                            {ann.arrearsFilter === 'all' 
                              ? 'All Tenants' 
                              : ann.arrearsFilter === 'with_arrears' 
                              ? 'With Arrears'
                              : ann.arrearsFilter === 'with_arrears_due_date'
                              ? 'Overdue Only'
                              : 'Without Arrears'}
                          </span>
                        </div>

                        <p className="text-xs text-paper-600 dark:text-ink-300 whitespace-pre-wrap leading-relaxed">
                          {ann.content}
                        </p>

                        <div className="flex items-center gap-4 text-[10px] text-paper-400 dark:text-ink-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            Sent {new Date(ann.createdAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-coral-500">
                            <Users className="w-3 h-3" />
                            Received by {ann.sentCount} Tenant{ann.sentCount !== 1 && 's'}
                          </span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
