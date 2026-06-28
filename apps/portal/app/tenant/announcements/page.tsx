'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../TenantContext';
import { 
  Megaphone, 
  Search, 
  Clock, 
  Filter,
  FileText,
  AlertCircle
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

export default function TenantAnnouncementsPage() {
  const { profile } = useTenant();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<'all' | 'week' | 'month'>('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    async function fetchAnnouncements() {
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
    }

    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((ann) => {
    // Search filter
    const matchesSearch = 
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    if (filterDate === 'all') return matchesSearch;

    const annDate = new Date(ann.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - annDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filterDate === 'week') {
      return matchesSearch && diffDays <= 7;
    }
    if (filterDate === 'month') {
      return matchesSearch && diffDays <= 30;
    }

    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-250 dark:border-ink-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-coral-500 animate-pulse" />
            Resident Announcements
          </h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            Stay informed with the latest building notices, emergency broadcasts, and tenant updates.
          </p>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-2.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg shadow-sm">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-paper-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notice archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-md text-xs focus:ring-2 focus:ring-coral-500/10 focus:border-coral-500 outline-none text-paper-950 dark:text-white"
          />
        </div>

        {/* Date Filter Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-paper-400" />
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value as any)}
            className="px-2.5 py-1.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-850 rounded-md text-xs text-paper-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-coral-500"
          >
            <option value="all">All Dates</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>

      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-16 text-paper-500 dark:text-ink-400 text-xs">
          <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-2.5"></div>
          Checking notice board...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-paper-300 dark:text-ink-600 mx-auto" />
          <h3 className="text-xs font-bold text-paper-800 dark:text-white uppercase tracking-wider">Notice Board is Clear</h3>
          <p className="text-xs text-paper-500 dark:text-ink-400 max-w-sm mx-auto">
            There are currently no announcements matching your filters, or the building manager hasn't posted any notices yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <div 
              key={ann.id}
              className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700 rounded-xl p-5 shadow-sm transition-all relative overflow-hidden group"
            >
              {/* Highlight strip for recent notices (past 48h) */}
              {new Date(ann.createdAt).getTime() > Date.now() - 48 * 60 * 60 * 1000 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral-500"></div>
              )}
              
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h3 className="text-sm font-bold text-paper-950 dark:text-white flex items-center gap-1.5">
                    {ann.title}
                    {new Date(ann.createdAt).getTime() > Date.now() - 48 * 60 * 60 * 1000 && (
                      <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold bg-coral-500/10 text-coral-600 dark:text-coral-400 border border-coral-500/20 rounded uppercase tracking-wider animate-pulse">
                        New
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-paper-400 dark:text-ink-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(ann.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-paper-700 dark:text-ink-250 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>

                {/* Important notice alert note fallback for arrears filters */}
                {ann.arrearsFilter !== 'all' && (
                  <div className="pt-2 border-t border-paper-100 dark:border-ink-850 flex items-center gap-2 text-[10px] text-coral-600 dark:text-coral-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-coral-500" />
                    <span>This notice was sent specifically to residents matching your profile's billing group.</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
