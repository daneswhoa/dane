'use client';

import React, { useState, useEffect } from 'react';
import ModLayout from '../../components/ModLayout';
import { 
  ScrollText, Search, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface AuditLog {
  id: string;
  actorName: string;
  actorEmail: string;
  actorInitials?: string;
  categoryLabel: string;
  description: string;
  timestamp: string;
  status: string;
  severity: string;
  ip?: string;
  location?: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 10;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (selectedSeverity !== 'All') {
        params.append('severity', selectedSeverity.toLowerCase());
      }

      const res = await fetch(`/api/dashboard/security/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalLogs(data.total || 0);
      } else {
        triggerToast('Failed to fetch audit logs');
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
      triggerToast('Error connecting to security API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedSeverity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedSeverity('All');
    setCurrentPage(1);
    fetchLogs();
    triggerToast('Audit trail logs refreshed');
  };

  const totalPages = Math.max(1, Math.ceil(totalLogs / itemsPerPage));

  // Helper to format severity tag classes
  const getSeverityStyle = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'error') {
      return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
    if (s === 'warning' || s === 'warn') {
      return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
    return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
  };

  return (
    <ModLayout title="Audit Trail">
      <div className="space-y-6 max-w-5xl mx-auto pb-10 relative">
        
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white dark:bg-ink-900 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm trans-theme space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type query and press Enter to search descriptions, actors, or logs..." 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
              />
            </div>
            
            <button 
              type="button"
              onClick={handleRefresh}
              className="p-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-paper-700 dark:text-ink-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-coral-500' : ''}`} />
            </button>
          </form>

          <div className="flex flex-wrap gap-4 pt-1 items-center">
            {/* Severity */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Severity:</span>
              <select 
                value={selectedSeverity}
                onChange={(e) => {
                  setSelectedSeverity(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOGS LIST */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-sm trans-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                  <th className="px-5 py-3">Log ID</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">IP / Location</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-paper-400 dark:text-ink-600">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-coral-500 mb-2" />
                      Loading logs stream...
                    </td>
                  </tr>
                ) : logs.map(log => {
                  const initials = log.actorInitials || log.actorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SYS';
                  return (
                    <tr key={log.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                      <td className="px-5 py-4 font-bold font-mono text-paper-900 dark:text-white">{log.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-coral-500/10 text-coral-500 font-bold text-[10px] flex items-center justify-center">
                            {initials}
                          </div>
                          <div>
                            <span className="block font-bold text-paper-900 dark:text-white">{log.actorName}</span>
                            <span className="block text-[9px] text-paper-400">{log.actorEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-paper-600 dark:text-ink-300 font-bold">{log.categoryLabel}</td>
                      <td className="px-5 py-4 text-paper-800 dark:text-white max-w-sm truncate" title={log.description}>{log.description}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${getSeverityStyle(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-paper-600 dark:text-ink-400 font-mono text-[10px]">
                        {log.ip || 'Unknown'} 
                        {log.location && <span className="block text-[9px] text-paper-400">{log.location}</span>}
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-paper-500 dark:text-ink-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {!isLoading && logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-paper-400 dark:text-ink-650">
                      No matching audit trail logs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION SECTION */}
        {!isLoading && totalPages > 1 && (
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl p-4 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme w-full shadow-sm">
            <span>Showing {logs.length} of {totalLogs} logs</span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || totalPages <= 1}
                className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed trans-subtle"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold px-2">Page {currentPage} of {totalPages}</span>
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
    </ModLayout>
  );
}
