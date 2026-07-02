'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, Laptop, AlertTriangle, Shield, Search, Filter,
  CheckCircle2, XCircle, Database, Key, Users, Server, Cpu,
  ListTree, HelpCircle
} from 'lucide-react';
import { useAuditStore, LogSeverity } from '../store/useAuditStore';
import { usePermissionsStore } from '../store/usePermissionsStore';
import { AccessDeniedOverlay } from './team/AccessDeniedOverlay';

export default function SecurityTab() {
  const { checkPermission } = usePermissionsStore();
  const canViewLogs = checkPermission('Security and Audit', 'View Audit Logs');

  const { logs, fetchLogs, isLoading, totalLogs, totalPages } = useAuditStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page to 1 on new search query
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 when severity filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter]);

  // Fetch logs when parameters change
  React.useEffect(() => {
    fetchLogs(currentPage, 20, debouncedSearchQuery, severityFilter);
  }, [fetchLogs, currentPage, debouncedSearchQuery, severityFilter]);

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition-all ${
            currentPage === i
              ? 'bg-paper-200 dark:bg-ink-700 border-paper-300 dark:border-ink-600 text-paper-900 dark:text-white font-bold'
              : 'border-transparent text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  if (!canViewLogs) {
    return <AccessDeniedOverlay moduleName="Security and Audit" actionName="View Audit Logs" />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-8 pb-20 animate-fade-in">
      {/* Audit Log */}
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden shadow-sm transition-colors mt-8">
        <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2"><ListTree className="w-4 h-4 text-paper-500 dark:text-ink-400" /> Immutable Audit Log</h3>
            <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">A chronological, unalterable record of system events.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search user, IP, or event..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-8 pr-3 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors placeholder-paper-400 dark:placeholder-ink-500" 
              />
            </div>
            
            <div className="relative group">
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="appearance-none flex items-center gap-1.5 px-2.5 pl-8 py-1.5 border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 rounded-md text-xs font-medium text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-900 transition-all outline-none cursor-pointer"
              >
                <option value="All">Severity: All</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="system">System</option>
              </select>
              <Filter className="w-3 h-3 text-paper-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-paper-50/50 dark:bg-ink-900/30 border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium">
                <th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Event Category</th><th className="px-5 py-3">Action Description</th><th className="px-5 py-3">IP & Location</th><th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-paper-500 dark:text-ink-400 font-sans">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-paper-400 dark:text-ink-500">Loading event records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-paper-500 dark:text-ink-400 font-sans">
                    No matching audit logs found. Test the system to generate new events.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className={`hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-all relative ${log.severity === 'critical' ? 'bg-coral-50/30 dark:bg-coral-500/5' : ''}`}>
                    <td className="px-5 py-3 text-paper-600 dark:text-ink-300">
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${log.severity === 'critical' ? 'bg-coral-500 shadow-[0_0_8px_rgba(255,107,107,0.8)]' : log.severity === 'warning' ? 'bg-amber-500' : log.severity === 'system' ? 'bg-blue-400 dark:bg-blue-500' : 'bg-paper-300 dark:bg-ink-600'}`}></div>
                      {log.timestamp}<br/>
                      <span className="text-[9px] text-paper-400 dark:text-ink-500">{log.timeString}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-sans">
                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[9px] ${
                          log.actor.isSystem 
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                            : log.actor.isUnknown
                            ? 'bg-paper-200 dark:bg-ink-700 text-paper-500 dark:text-ink-400 border border-paper-300 dark:border-ink-600 border-dashed'
                            : 'bg-coral-100 dark:bg-coral-500/20 text-coral-600 dark:text-coral-400'
                        }`}>
                          {log.actor.isSystem ? <Cpu className="w-3 h-3" /> : log.actor.isUnknown ? <HelpCircle className="w-3 h-3" /> : log.actor.initials}
                        </div>
                        <div>
                          <p className="font-medium text-paper-900 dark:text-white leading-none font-sans">{log.actor.name}</p>
                          <p className="text-[9px] text-paper-500 dark:text-ink-400 mt-0.5 font-sans">{log.actor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-sans font-medium ${
                        log.severity === 'critical' ? 'border-coral-200 dark:border-coral-500/20 bg-coral-50 dark:bg-coral-500/10 text-coral-700 dark:text-coral-400'
                        : log.severity === 'warning' ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : log.severity === 'system' ? 'border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                      }`}>
                        {log.category.icon && <log.category.icon className="w-3 h-3" />} {log.category.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-paper-800 dark:text-ink-200 text-[11px] font-sans">
                      {log.descriptionHtml ? log.descriptionHtml : log.description}
                    </td>
                    <td className="px-5 py-3">
                      <div className={`text-[11px] ${log.severity === 'critical' ? 'text-coral-600 dark:text-coral-400 font-semibold' : 'text-paper-700 dark:text-ink-300'}`}>{log.ip}</div>
                      <div className="text-[9px] text-paper-400 dark:text-ink-500 font-sans">{log.location}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-sans font-medium text-[10px] ${
                        log.status === 'success' ? 'text-paper-600 dark:text-ink-300'
                        : log.status === 'blocked' ? 'text-coral-600 dark:text-coral-400'
                        : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {log.status === 'success' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        {log.status === 'blocked' && <XCircle className="w-3 h-3" />}
                        {log.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-paper-200 dark:border-ink-700 bg-paper-50/30 dark:bg-ink-900/20 flex items-center justify-between">
          <span className="text-[11px] text-paper-500 dark:text-ink-400 font-medium">
            Showing {logs.length} of {totalLogs} events
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-paper-200 dark:border-ink-700 text-[11px] font-medium text-paper-600 dark:text-ink-300 disabled:opacity-40 transition-all hover:bg-paper-100 dark:hover:bg-ink-700 disabled:hover:bg-transparent"
            >
              Prev
            </button>
            {renderPageButtons()}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-paper-200 dark:border-ink-700 text-[11px] font-medium text-paper-600 dark:text-ink-300 disabled:opacity-40 transition-all hover:bg-paper-100 dark:hover:bg-ink-700 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
