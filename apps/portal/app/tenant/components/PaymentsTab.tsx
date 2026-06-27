'use client';

import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  MoreHorizontal, 
  ArrowRight, 
  RefreshCw, 
  Wallet, 
  Plus, 
  Landmark, 
  MoreVertical, 
  FileSpreadsheet, 
  Filter, 
  ChevronDown, 
  Download, 
  CheckCircle2 
} from 'lucide-react';
import { TenantProfile } from '../types';

interface PaymentsTabProps {
  profile: TenantProfile | null;
  onPayNow: () => void;
  onViewInvoice: (invoiceId: string) => void;
}

export default function PaymentsTab({ profile, onPayNow, onViewInvoice }: PaymentsTabProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [filterPastDue, setFilterPastDue] = useState(false);

  useEffect(() => {
    const loadInvoices = (showLoading = true) => {
      if (profile?.id) {
        if (showLoading) setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices?tenantId=${profile.id}`, {
          credentials: 'include'
        })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setInvoices(data);
            }
          })
          .catch((err) => console.error('Failed to load tenant invoices:', err))
          .finally(() => {
            if (showLoading) setLoading(false);
          });
      }
    };

    loadInvoices(true);

    const handleRealtimeNotification = () => {
      console.log('Realtime notification received in payments tab: refreshing invoices');
      loadInvoices(false); // background refresh without showing loading skeleton
    };

    window.addEventListener('notification-received', handleRealtimeNotification);
    return () => {
      window.removeEventListener('notification-received', handleRealtimeNotification);
    };
  }, [profile?.id]);

  // Calculate unpaid balance
  const unpaidInvoices = invoices.filter((i) => i.status.toUpperCase() !== 'PAID');
  const currentBalance = unpaidInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  
  // Find soonest due date
  const soonestDue = unpaidInvoices.length > 0
    ? unpaidInvoices.reduce((soonest, current) => {
        return new Date(current.dueDate) < new Date(soonest.dueDate) ? current : soonest;
      })
    : null;

  const handlePayNowClick = () => {
    if (soonestDue) {
      onViewInvoice(soonestDue.id);
    } else if (unpaidInvoices.length > 0) {
      onViewInvoice(unpaidInvoices[0].id);
    } else {
      onPayNow();
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto flex flex-col gap-6 pb-20 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-ink-900 via-ink-800 to-ink-950 rounded-2xl p-6 border border-ink-700/50 shadow-xl relative overflow-hidden flex flex-col h-full min-h-[220px]">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-coral-500/20 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold tracking-widest text-ink-300 uppercase flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-ink-400" /> Current Balance
                </h3>
                <button className="text-ink-400 hover:text-white trans-subtle">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 mb-1">
                <span className="text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                  <span className="text-2xl text-ink-300">$</span>
                  {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {soonestDue ? (
                  <>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-coral-500/20 text-coral-400 border border-coral-500/30">
                      Due {soonestDue.dueDate}
                    </span>
                    <span className="text-xs text-ink-300">soon</span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    No Balance Due
                  </span>
                )}
              </div>
            </div>

            {currentBalance > 0 && (
              <div className="relative z-10 pt-4 mt-4 border-t border-ink-700/50 flex gap-2">
                <button onClick={handlePayNowClick} className="flex-1 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-coral-500/20 active:scale-95 trans-subtle flex items-center justify-center gap-2">
                  Pay Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <div className="bg-white/60 dark:bg-ink-950/60 backdrop-blur-xl border border-paper-200 dark:border-ink-800 rounded-2xl p-5 shadow-sm trans-theme flex flex-col justify-center items-center text-center">
            <h4 className="text-sm font-bold text-paper-900 dark:text-white">Autopay & Payment Methods</h4>
            <p className="text-xs text-paper-500 dark:text-ink-400 mt-2 max-w-sm">Securely save payment methods and enable Autopay to never miss a due date. This feature will be available once your landlord activates merchant services.</p>
          </div>
        </div>
      </div>

      {/* Invoices Ledger */}
      <div className="bg-white/60 dark:bg-ink-950/60 backdrop-blur-xl border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden trans-theme flex flex-col relative">
        <div className="p-4 border-b border-paper-200 dark:border-ink-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-ink-950/50 trans-theme">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('unpaid')}
              className={`text-sm font-bold pb-4 -mb-4 border-b-2 transition-all ${
                activeTab === 'unpaid' 
                  ? 'border-coral-500 text-paper-900 dark:text-white' 
                  : 'border-transparent text-paper-500 hover:text-paper-700 dark:hover:text-ink-200'
              }`}
            >
              Pending Invoices
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={`text-sm font-bold pb-4 -mb-4 border-b-2 transition-all ${
                activeTab === 'paid' 
                  ? 'border-emerald-500 text-paper-900 dark:text-white' 
                  : 'border-transparent text-paper-500 hover:text-paper-700 dark:hover:text-ink-200'
              }`}
            >
              Paid History
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'unpaid' && (
              <label className="flex items-center gap-2 cursor-pointer mr-4">
                <input 
                  type="checkbox" 
                  checked={filterPastDue} 
                  onChange={(e) => setFilterPastDue(e.target.checked)}
                  className="rounded border-paper-300 text-coral-500 focus:ring-coral-500"
                />
                <span className="text-xs font-semibold text-paper-700 dark:text-ink-300">Past Due Only</span>
              </label>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-xs font-medium text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-800 trans-subtle shadow-sm">
              <Filter className="w-3.5 h-3.5 text-paper-400" />
              Year: 2026
              <ChevronDown className="w-3 h-3 text-paper-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-coral-500 font-semibold animate-pulse">
              Loading invoices...
            </div>
          ) : (
            (() => {
              let displayed = activeTab === 'unpaid' 
                ? invoices.filter(i => i.status.toUpperCase() !== 'PAID')
                : invoices.filter(i => i.status.toUpperCase() === 'PAID');
                
              if (activeTab === 'unpaid' && filterPastDue) {
                const now = new Date();
                displayed = displayed.filter(i => new Date(i.dueDate) < now);
              }

              if (displayed.length === 0) {
                return (
                  <div className="p-8 text-center text-paper-500 dark:text-ink-400">
                    No {activeTab} invoice records found.
                  </div>
                );
              }

              return (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-paper-50/50 dark:bg-ink-900/30 border-b border-paper-200 dark:border-ink-800 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-semibold trans-theme">
                      <th className="px-5 py-3">Invoice #</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Date Issued</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-800/50 trans-theme">
                    {displayed.map((inv) => (
                      <tr 
                        key={inv.id}
                        onClick={() => onViewInvoice(inv.id)} 
                        className={`hover:bg-paper-50 dark:hover:bg-ink-800/50 trans-subtle group cursor-pointer ${
                          inv.status.toUpperCase() !== 'PAID' ? 'bg-coral-50/30 dark:bg-coral-500/5' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-paper-900 dark:text-white font-semibold">
                            {inv.invoiceNumber || inv.id}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-paper-900 dark:text-white">{inv.description || 'Monthly Rent'}</div>
                          <div className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{inv.type}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-paper-700 dark:text-ink-200">{inv.issueDate || inv.createdAt?.substring(0, 10)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {inv.status.toUpperCase() === 'PAID' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-coral-200 dark:border-coral-500/20 bg-coral-50 dark:bg-coral-500/10 text-coral-700 dark:text-coral-400 text-[10px] font-bold uppercase tracking-wider">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-paper-900 dark:text-white">
                          ${Number(inv.amount).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button className="p-1.5 rounded bg-paper-100 dark:bg-ink-800 text-paper-500 dark:text-ink-400 hover:text-coral-500 dark:hover:text-coral-400 trans-subtle inline-block">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()
          )}
        </div>
        
        <div className="px-5 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-900/30 flex items-center justify-between trans-theme">
          <p className="text-xs text-paper-500 dark:text-ink-400 font-medium">
            Need help with billing? <button className="text-coral-600 dark:text-coral-400 hover:underline">Contact Property Manager</button>
          </p>
        </div>
      </div>
    </div>
  );
}
