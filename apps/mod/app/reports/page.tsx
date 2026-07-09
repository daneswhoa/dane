'use client';

import React, { useState } from 'react';
import ModLayout from '../components/ModLayout';
import { 
  Flag, Search, RefreshCw, AlertTriangle, AlertCircle, Eye, CheckCircle, Ban, ArrowLeft
} from 'lucide-react';

interface Report {
  id: string;
  reporter: string;
  reportedSubject: string;
  subjectType: 'Listing' | 'Landlord' | 'Tenant' | 'Contractor';
  reason: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  county: string;
  createdAt: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
}

const INITIAL_REPORTS: Report[] = [
  {
    id: 'REP-101',
    reporter: 'Kevin Kamau',
    reportedSubject: 'Westside Lofts - Unit A2',
    subjectType: 'Listing',
    reason: 'Listing Inaccuracy',
    description: 'The listing description states backup power generator is operational, but it has been down for over 3 months.',
    severity: 'Medium',
    county: 'Kiambu',
    createdAt: '2026-07-07T12:00:00Z',
    status: 'Pending'
  },
  {
    id: 'REP-102',
    reporter: 'Martha Wanjiku',
    reportedSubject: 'Coastal Holdings Ltd',
    subjectType: 'Landlord',
    reason: 'Payment Dispute',
    description: 'Security deposit refund delay exceeds the standard contract clause duration by 15 days.',
    severity: 'High',
    county: 'Mombasa',
    createdAt: '2026-07-06T18:40:00Z',
    status: 'Pending'
  },
  {
    id: 'REP-103',
    reporter: 'Westside Realty Group',
    reportedSubject: 'Robert Vance',
    subjectType: 'Tenant',
    reason: 'Lease Violation',
    description: 'Reported constant lease noise levels and sub-letting units without written authorization.',
    severity: 'Low',
    county: 'Nairobi',
    createdAt: '2026-07-05T09:12:00Z',
    status: 'Resolved'
  }
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchQuery('');
      setSelectedSeverity('All');
      setSelectedStatus('All');
      setSelectedSubject('All');
      setIsLoading(false);
      triggerToast('Moderation queue updated');
    }, 600);
  };

  const handleResolve = (id: string, action: 'Resolved' | 'Dismissed') => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    triggerToast(`Report ${id} marked as ${action.toLowerCase()}`);
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reportedSubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = selectedSeverity === 'All' || r.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesSubject = selectedSubject === 'All' || r.subjectType === selectedSubject;

    return matchesSearch && matchesSeverity && matchesStatus && matchesSubject;
  });

  return (
    <ModLayout title="Flags & Reports">
      <div className="space-y-6 max-w-5xl mx-auto pb-10 relative">
        
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <CheckCircle className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Unresolved Flags</p>
              <p className="text-xl font-black text-red-500 mt-1 font-mono">{reports.filter(r => r.status === 'Pending').length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 flex items-center justify-center text-red-500">
              <Flag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">High Severity Reports</p>
              <p className="text-xl font-black text-amber-500 mt-1 font-mono">{reports.filter(r => r.severity === 'High' && r.status === 'Pending').length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-150 dark:border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Total Actions Taken</p>
              <p className="text-xl font-black text-emerald-500 mt-1 font-mono">{reports.filter(r => r.status !== 'Pending').length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white dark:bg-ink-900 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm trans-theme space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reporter name, reported subject, or report ID..." 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
              />
            </div>
            
            <button 
              onClick={handleRefresh}
              className="p-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-paper-700 dark:text-ink-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-coral-500' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 pt-1 items-center">
            {/* Severity */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Severity:</span>
              <select 
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Subject Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Subject:</span>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Subjects</option>
                <option value="Listing">Listing</option>
                <option value="Landlord">Landlord</option>
                <option value="Tenant">Tenant</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Status:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </div>

        {/* REPORTS TABLE */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-sm trans-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                  <th className="px-5 py-3">Report ID</th>
                  <th className="px-5 py-3">Reporter</th>
                  <th className="px-5 py-3">Reported Entity</th>
                  <th className="px-5 py-3">Violation Reason</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                {filteredReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                    <td className="px-5 py-4 font-bold font-mono text-paper-900 dark:text-white">{rep.id}</td>
                    <td className="px-5 py-4 text-paper-800 dark:text-white">{rep.reporter}</td>
                    <td className="px-5 py-4">
                      <span className="block font-bold text-paper-900 dark:text-white">{rep.reportedSubject}</span>
                      <span className="block text-[9px] text-paper-400 uppercase tracking-wider mt-0.5">{rep.subjectType}</span>
                    </td>
                    <td className="px-5 py-4 text-paper-600 dark:text-ink-350">{rep.reason}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        rep.severity === 'High' 
                          ? 'bg-red-500/10 text-red-500' 
                          : rep.severity === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {rep.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReport(rep)}
                        className="px-3 py-1 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-lg text-[10px] font-bold trans-subtle flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3 text-paper-400" /> Audit Report
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-paper-400 dark:text-ink-650">
                      No matching moderation flags or reports currently listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILS AUDIT MODAL */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 dark:bg-black/75 p-6 animate-fade-in">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-5 p-6 trans-theme">
              <div className="flex items-center justify-between border-b border-paper-150 dark:border-ink-800 pb-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <h4 className="font-black text-sm text-paper-950 dark:text-white">Audit System Flag: {selectedReport.id}</h4>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-full hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-500"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-paper-750 dark:text-ink-200">
                <div className="grid grid-cols-2 gap-3 bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/50 dark:border-ink-850">
                  <div>
                    <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide block">Reporter Entity</span>
                    <strong className="text-paper-900 dark:text-white">{selectedReport.reporter}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide block">Reported Target</span>
                    <strong className="text-paper-900 dark:text-white">{selectedReport.reportedSubject} ({selectedReport.subjectType})</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide block">Violation Details</span>
                  <p className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/50 dark:border-ink-850 italic text-paper-800 dark:text-ink-150">
                    "{selectedReport.description}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2 justify-between">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-750 text-paper-750 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>

                {selectedReport.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolve(selectedReport.id, 'Dismissed')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg"
                    >
                      Dismiss Report
                    </button>
                    <button 
                      onClick={() => handleResolve(selectedReport.id, 'Resolved')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </ModLayout>
  );
}
