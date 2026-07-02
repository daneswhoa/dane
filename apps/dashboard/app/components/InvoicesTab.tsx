'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileClock, AlertTriangle, BadgeDollarSign, PencilRuler,
  TrendingUp, Filter, Calendar, ChevronDown, Download, MoreHorizontal,
  ShieldCheck, XCircle, FileText
} from 'lucide-react';
import CreateInvoiceModal from './CreateInvoiceModal';
import { usePermissionsStore } from '../store/usePermissionsStore';
import { AccessDeniedOverlay } from './team/AccessDeniedOverlay';

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  unitId: string;
  amount: number;
  type: string;
  status: string;
  issueDate: string;
  dueDate: string;
  description: string;
}

const defaultInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-23-1002',
    tenantId: 'tenant-1',
    tenantName: 'Michael Chen',
    propertyName: 'Westside Lofts',
    unitId: '304',
    amount: 2100,
    type: 'Rent',
    status: 'OVERDUE',
    issueDate: '2026-06-01',
    dueDate: '2026-06-05',
    description: 'Monthly residential rent payment',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-23-1045',
    tenantId: 'tenant-2',
    tenantName: 'Sarah Jenkins',
    propertyName: 'Grandview Apts',
    unitId: '12B',
    amount: 1850,
    type: 'Rent',
    status: 'PAID',
    issueDate: '2026-06-01',
    dueDate: '2026-06-05',
    description: 'Monthly residential rent payment',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-23-1051',
    tenantId: 'tenant-4',
    tenantName: 'Emma & Tom Reed',
    propertyName: 'Grandview Apts',
    unitId: '5C',
    amount: 1900,
    type: 'Rent',
    status: 'PAID',
    issueDate: '2026-06-01',
    dueDate: '2026-06-05',
    description: 'Monthly residential rent payment',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-23-0988',
    tenantId: 'tenant-5',
    tenantName: 'Alex Johnson',
    propertyName: 'Oakridge Estates',
    unitId: '42',
    amount: 1600,
    type: 'Arrears',
    status: 'OVERDUE',
    issueDate: '2026-05-15',
    dueDate: '2026-06-15',
    description: 'Outstanding arrears ledger balance',
  },
];
export default function InvoicesTab() {
  const { checkPermission } = usePermissionsStore();
  const canView = checkPermission('Finance', 'View Ledgers');
  const canProcess = checkPermission('Finance', 'Process Payments');

  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deniedAction, setDeniedAction] = useState<string | null>(null);
  const itemsPerPage = 8;

  const loadInvoices = async () => {
    setIsLoading(true);
    let loadedData = defaultInvoices;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          loadedData = data;
        }
      }
    } catch (e) {
      console.warn('Backend API offline, falling back to local storage');
      const saved = localStorage.getItem('landlordnl_invoices_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            loadedData = parsed;
          }
        } catch (e) {}
      }
    }
    
    const uniqueInvoices = Array.from(new Map(loadedData.map(item => [item.id, item])).values()) as Invoice[];
    setInvoices(uniqueInvoices);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const totalOutstanding = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'RECONCILED' && i.status !== 'CANCELLED').reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'OVERDUE').reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalPaid = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const filteredInvoices = invoices.filter((i) => {
    const matchesStatus = statusFilter === 'ALL' || (i.status || '').toUpperCase() === statusFilter.toUpperCase();
    const matchesProperty = propertyFilter === 'ALL' || i.propertyName === propertyFilter;
    const matchesSearch = 
      (i.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (i.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesProperty && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueProperties = Array.from(new Set(invoices.map(i => i.propertyName))).filter(Boolean);

  const handleExport = () => {
    const headers = 'Invoice Number,Tenant Name,Property,Unit,Amount,Type,Status,Issue Date,Due Date\n';
    const rows = invoices.map(i => `"${i.invoiceNumber}","${i.tenantName}","${i.propertyName}","${i.unitId}",${i.amount},"${i.type}","${i.status}","${i.issueDate}","${i.dueDate}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'landlordnl_invoices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canView) {
    return <AccessDeniedOverlay moduleName="Finance" actionName="View Ledgers" />;
  }

  return (
    <div className="p-4 space-y-4 w-full animate-fade-in text-xs relative">
      {deniedAction && (
        <AccessDeniedOverlay 
          moduleName="Finance" 
          actionName={deniedAction} 
          onClose={() => setDeniedAction(null)} 
        />
      )}
      
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-paper-400 font-bold uppercase tracking-wider">Outstanding Ledger</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-paper-900 dark:text-white">${totalOutstanding.toLocaleString()}</span>
            <span className="text-[9px] text-paper-400 font-semibold">{invoices.filter((i) => i.status !== 'PAID').length} Invoices</span>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-coral-500/20 rounded-md p-3 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-coral-500/5 pointer-events-none"></div>
          <span className="text-[10px] text-coral-500 font-bold uppercase tracking-wider">Overdue Balance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-coral-600 dark:text-coral-400">${totalOverdue.toLocaleString()}</span>
            <span className="text-[9px] text-coral-500 font-semibold">{invoices.filter((i) => i.status === 'OVERDUE').length} Overdue</span>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-paper-400 font-bold uppercase tracking-wider">Collected (Total)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${totalPaid.toLocaleString()}</span>
            <span className="text-[9px] text-emerald-500 font-semibold">{invoices.filter((i) => i.status === 'PAID').length} Paid</span>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] text-paper-400 font-bold uppercase tracking-wider">System Ledger Health</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-paper-900 dark:text-white">Active</span>
            <span className="text-[9px] text-paper-400 font-semibold">Real-time ledger</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md overflow-hidden shadow-sm flex flex-col">
        {/* Controls */}
        <div className="px-3 py-2 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-2 flex-grow max-w-sm relative">
            <input 
              type="text" 
              placeholder="Search invoice # or tenant..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-3 pr-3 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative group">
              <select 
                value={propertyFilter}
                onChange={(e) => { setPropertyFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none flex items-center justify-between gap-2 pl-2.5 pr-8 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded bg-white dark:bg-ink-950 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 transition-all font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Properties</option>
                {uniqueProperties.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-paper-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative group">
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none flex items-center justify-between gap-2 pl-2.5 pr-8 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded bg-white dark:bg-ink-950 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 transition-all font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PENDING">Pending</option>
                <option value="RECONCILED">Reconciled</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-paper-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button onClick={handleExport} className="text-paper-600 dark:text-ink-200 hover:text-coral-500 font-bold flex items-center gap-1.5 px-2.5 py-1.5 ml-2 border border-transparent hover:bg-paper-100 dark:hover:bg-ink-800 rounded transition-all">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button 
              onClick={() => {
                if (!canProcess) {
                  setDeniedAction('Process Payments');
                } else {
                  setShowCreateModal(true);
                }
              }} 
              className="text-white bg-coral-500 hover:bg-coral-600 font-bold flex items-center gap-1.5 px-4 py-1.5 ml-2 rounded transition-all shadow-lg shadow-coral-500/20"
            >
              <PencilRuler className="w-3.5 h-3.5" /> Create Invoice
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-16 text-center text-paper-500 dark:text-ink-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium tracking-tight">Loading invoices...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-none flex-grow">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-paper-50 dark:bg-ink-900/80 border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase font-bold text-paper-500 dark:text-ink-400">
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Billed To</th>
                    <th className="px-4 py-3">Property / Unit</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-100 dark:divide-ink-700/50">
                  {paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => router.push(`/finance/invoices/${inv.id}`)}
                        className="hover:bg-paper-50 dark:hover:bg-ink-700/30 cursor-pointer transition-colors duration-150 group"
                      >
                        <td className="px-4 py-3 font-semibold font-mono text-paper-900 dark:text-white group-hover:text-coral-500">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold block text-paper-900 dark:text-white">{inv.tenantName}</span>
                          <span className="text-[9px] text-paper-400">{inv.type} payment</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-paper-800 dark:text-ink-100 font-medium block">{inv.propertyName}</span>
                          <span className="text-[9px] text-paper-450">Unit {inv.unitId}</span>
                        </td>
                        <td className="px-4 py-3 text-paper-500">{inv.issueDate}</td>
                        <td className="px-4 py-3">
                          <span className={inv.status === 'OVERDUE' ? 'text-coral-500 font-bold' : 'text-paper-500'}>
                            {inv.dueDate}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-paper-900 dark:text-white">
                          ${Number(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            inv.status === 'OVERDUE'
                              ? 'bg-coral-500/10 border-coral-500/30 text-coral-500'
                              : inv.status === 'PAID'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                              : inv.status === 'RECONCILED'
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-500'
                              : inv.status === 'CANCELLED'
                              ? 'bg-paper-250 border-paper-350 text-paper-500 dark:bg-ink-800 dark:border-ink-700 dark:text-ink-400'
                              : 'bg-paper-200 border-paper-300 text-paper-600 dark:bg-ink-700 dark:border-ink-600 dark:text-ink-300'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setActiveMenu(activeMenu === inv.id ? null : inv.id)}
                            className="p-1 hover:text-coral-500 text-paper-400"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {activeMenu === inv.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-4 top-8 w-40 bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-700 rounded-lg shadow-lg py-1 z-20 text-left animate-fade-in">
                                <button
                                  onClick={() => {
                                    setActiveMenu(null);
                                    router.push(`/finance/invoices/${inv.id}`);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs font-semibold text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 flex items-center gap-1.5 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" /> View Details
                                </button>
                                
                                {inv.status !== 'PAID' && inv.status !== 'RECONCILED' && inv.status !== 'CANCELLED' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        setActiveMenu(null);
                                        if (!canProcess) {
                                          setDeniedAction('Process Payments');
                                          return;
                                        }
                                        try {
                                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices/${inv.id}/reconcile`, {
                                            method: 'POST',
                                            credentials: 'include',
                                          });
                                          if (res.ok) {
                                            loadInvoices();
                                          } else {
                                            const err = await res.json();
                                            alert(err.message || 'Failed to reconcile invoice.');
                                          }
                                        } catch (e) {
                                          console.error(e);
                                        }
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 flex items-center gap-1.5 transition-colors"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" /> Reconcile
                                    </button>
                                    
                                    <button
                                      onClick={async () => {
                                        setActiveMenu(null);
                                        if (!canProcess) {
                                          setDeniedAction('Process Payments');
                                          return;
                                        }
                                        try {
                                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices/${inv.id}/cancel`, {
                                            method: 'POST',
                                            credentials: 'include',
                                          });
                                          if (res.ok) {
                                            loadInvoices();
                                          } else {
                                            const err = await res.json();
                                            alert(err.message || 'Failed to cancel invoice.');
                                          }
                                        } catch (e) {
                                          console.error(e);
                                        }
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-1.5 transition-colors"
                                    >
                                      <XCircle className="w-3.5 h-3.5" /> Cancel Invoice
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-paper-500 dark:text-ink-400">
                        <span className="text-sm font-medium tracking-tight">No invoices match your filters.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3.5 px-5 border-t border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/20">
                <span className="text-xs text-paper-500 dark:text-ink-400 font-medium">
                  Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold border border-paper-200 dark:border-ink-700 rounded text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-semibold border border-paper-200 dark:border-ink-700 rounded text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateInvoiceModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={async () => {
            setShowCreateModal(false);
            // Re-fetch invoices instead of hard reload
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices`, { credentials: 'include' });
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                  const unique = Array.from(new Map(data.map((item: any) => [item.id, item])).values()) as Invoice[];
                  setInvoices(unique);
                }
              }
            } catch (e) {
              console.error('Failed to refresh invoices:', e);
            }
          }} 
        />
      )}
    </div>
  );
}
