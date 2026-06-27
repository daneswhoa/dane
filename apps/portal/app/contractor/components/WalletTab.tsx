import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  FileClock, 
  Receipt, 
  Filter, 
  Download, 
  Check, 
  Building2, 
  Building,
  CreditCard,
  Landmark,
  FileText,
  FileDown,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { MaintenanceJob } from '../types';
import JobDetailsModal from './JobDetailsModal';
import { useContractor } from '../ContractorContext';

interface WalletTabProps {
  jobs: MaintenanceJob[];
}

export default function WalletTab({ jobs }: WalletTabProps) {
  const { profile, fetchData } = useContractor();
  // Dynamic financial aggregation from live jobs data
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const activeJobs = jobs.filter(j => j.status === 'in_progress');

  const totalPaid = completedJobs.reduce((sum, j) => sum + Number(j.amount || 0), 0);
  const pendingAmount = activeJobs.length * 150; // Est pending labor amount

  const displayPaidMain = Math.floor(totalPaid);
  const displayPaidCents = (totalPaid % 1).toFixed(2).substring(2);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState<MaintenanceJob | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (profile?.stripeAccountId) {
      setIsStripeConnected(true);
    }
  }, [profile]);

  const handleWithdraw = async () => {
    if (totalPaid <= 0) return;
    setIsWithdrawing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/stripe/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPaid }),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Withdrawal request initiated successfully. Payout is processing via Stripe Connect.');
        if (fetchData) await fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Withdrawal failed. Make sure your Stripe account is connected and fully verified.');
      }
    } catch (err) {
      console.error(err);
      alert('Error initiating withdrawal.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/stripe/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Could not retrieve onboarding link.');
        }
      } else {
        alert('Stripe connect activation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Stripe connection error.');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (filterStatus === 'PAID') return j.status === 'completed';
    if (filterStatus === 'PENDING') return j.status !== 'completed';
    return true;
  });

  // Group awaiting payouts
  const uniqueProperties = Array.from(new Set(jobs.map(j => j.propertyName || 'Common Area')));

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 pb-20">
      
      {/* Top Grid: Wallet & High-Level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* The "Black Card" Wallet Hero */}
          <div className="lg:col-span-1 bg-[#101217] rounded-2xl p-6 border border-[#272b36] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] group">
              {/* Subtle Corner Glows */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-coral-500/15 blur-[50px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-70"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-blue-500/10 blur-[40px] pointer-events-none"></div>

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between text-[#757d8e]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
                      <Wallet className="w-4 h-4 text-[#8c93a1]" /> Wallet Balance
                  </div>
                  <button className="hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                  </button>
              </div>

              {/* Main Balance */}
              <div className="relative z-10 mt-6 mb-8 text-left">
                  <h2 className="text-[42px] leading-none font-bold text-white tracking-tight mb-3">
                      ${displayPaidMain}<span className="text-[#5e687b] text-3xl">.{displayPaidCents}</span>
                  </h2>
                  <p className="text-xs text-[#757d8e] flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shadow-[0_0_6px_rgba(245,166,35,0.6)]"></span>
                      +${pendingAmount} pending clearance
                  </p>
              </div>

              {/* Actions & Footer */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                  <button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || totalPaid <= 0}
                    className="w-full py-2.5 bg-white text-[#101217] text-sm font-bold rounded-xl hover:bg-[#fcfbf9] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                      {isWithdrawing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#101217] border-t-transparent rounded-full animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        'Withdraw Funds'
                      )}
                  </button>
                  <div className="text-[9px] text-[#5e687b] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      Powered by <span className="text-[#635BFF] font-bold lowercase text-xs tracking-normal">stripe</span>
                  </div>
              </div>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Metric: YTD Earnings */}
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-6 shadow-sm trans-theme flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-emerald-500/5 to-transparent"></div>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                          <h3 className="text-xs font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Year-to-Date Earnings</h3>
                      </div>
                  </div>
                  <div className="flex items-baseline gap-2 text-left">
                      <span className="text-3xl font-bold text-paper-900 dark:text-white tracking-tight">
                        ${(totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +14%</span>
                      <span className="text-paper-500 dark:text-ink-400">vs. last year</span>
                  </div>
              </div>

              {/* Metric: Unpaid Invoices / In Escrow */}
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-6 shadow-sm trans-theme flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <FileClock className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                              <h3 className="text-xs font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Awaiting Payout</h3>
                          </div>
                      </div>
                      <button className="text-xs font-medium text-coral-600 dark:text-coral-400 hover:text-coral-700 trans-subtle">View All</button>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-left">
                      {uniqueProperties.slice(0, 2).map((prop, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-paper-100 dark:border-ink-700 pb-2 trans-theme">
                          <span className="text-xs text-paper-700 dark:text-ink-200 truncate max-w-[150px]">{prop}</span>
                          <span className="text-sm font-semibold text-paper-900 dark:text-white">
                            ${((idx + 1) * 150).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {uniqueProperties.length === 0 && (
                        <p className="text-xs text-paper-500 dark:text-ink-400">No pending payouts.</p>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Bottom Section: Transactions & Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Earnings Ledger */}
          <div className="xl:col-span-2 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl shadow-sm trans-theme overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex flex-wrap gap-4 justify-between items-center trans-theme">
                  <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-paper-500 dark:text-ink-400" /> Payout Ledger
                  </h3>
                  <div className="flex items-center gap-2">
                      <div className="relative group">
                          <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none flex items-center gap-1.5 px-3 py-1.5 pr-8 rounded-lg border border-paper-200 dark:border-ink-600 bg-white dark:bg-ink-950 text-xs font-medium text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-700 trans-subtle outline-none cursor-pointer"
                          >
                              <option value="ALL">All Statuses</option>
                              <option value="PAID">Paid Out</option>
                              <option value="PENDING">Pending Approval</option>
                          </select>
                          <Filter className="w-3.5 h-3.5 text-paper-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-paper-200 dark:border-ink-600 text-xs font-medium text-paper-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-700 trans-subtle">
                          <Download className="w-3.5 h-3.5" /> Export
                      </button>
                  </div>
              </div>

              <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left whitespace-nowrap">
                      <thead>
                          <tr className="border-b border-paper-100 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-semibold trans-theme bg-paper-50/50 dark:bg-ink-900/30">
                              <th className="px-5 py-3">Date</th>
                              <th className="px-5 py-3">Property</th>
                              <th className="px-5 py-3">Job Ref</th>
                              <th className="px-5 py-3 text-right">Amount</th>
                              <th className="px-5 py-3">Status</th>
                          </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 trans-theme">
                          {filteredJobs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-5 py-12 text-center text-paper-500 dark:text-ink-400">
                                No transactions match this filter.
                              </td>
                            </tr>
                          ) : filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/50 trans-subtle group cursor-pointer" onClick={() => setSelectedJob(job)}>
                              <td className="px-5 py-3 text-paper-600 dark:text-ink-300">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-3 text-left">
                                  <div className="font-medium text-paper-900 dark:text-white">
                                    {job.propertyName || 'Common Area'}
                                  </div>
                                  <div className="text-[10px] text-paper-500 dark:text-ink-400">Unit: {job.unitLabel || 'N/A'}</div>
                              </td>
                              <td className="px-5 py-3">
                                <span className="font-mono text-paper-600 dark:text-ink-300">
                                  WRK-{job.id.substring(0, 4).toUpperCase()}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                                +${Number(job.amount || 150).toFixed(2)}
                              </td>
                              <td className="px-5 py-3 text-left">
                                  {job.status === 'completed' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium">
                                        <Check className="w-2.5 h-2.5" /> Paid
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending
                                    </span>
                                  )}
                              </td>
                            </tr>
                          ))}
                          

                      </tbody>
                  </table>
              </div>
              {/* Pagination Footer */}
              <div className="px-5 py-3 border-t border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/30 flex justify-center trans-theme">
                  <button className="text-xs font-medium text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white trans-subtle">Load More Transactions</button>
              </div>
          </div>

          {/* Right Column: Methods & Taxes */}
          <div className="space-y-6">
              {/* Payout Methods */}
              <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-5 shadow-sm trans-theme">
                  <div className="flex justify-between items-center mb-5">
                      <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-paper-500 dark:text-ink-400" /> Payout Methods
                      </h3>
                  </div>

                  {!isStripeConnected ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-paper-900 dark:text-white mb-1">Link your Bank Account</h4>
                          <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">Connect securely via Stripe to receive instant payouts when jobs are approved.</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleConnectStripe}
                        disabled={isConnectingStripe}
                        className="w-full py-2.5 bg-[#635BFF] hover:bg-[#5851df] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#635BFF]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isConnectingStripe ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Connecting...</>
                        ) : (
                          'Connect with Stripe'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                        {/* Connected Bank */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-[#635BFF]/30 bg-[#635BFF]/5 group trans-theme relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[#635BFF]/10 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 flex items-center justify-center shadow-sm trans-theme">
                                    <Building className="w-4 h-4 text-[#635BFF]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-paper-900 dark:text-white tracking-tight">Stripe Connected Account</p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Active & Verified
                                    </p>
                                </div>
                            </div>
                            <span className="text-[9px] bg-[#635BFF] text-white px-1.5 py-0.5 rounded font-bold shadow-sm relative z-10">Default</span>
                        </div>
                    </div>
                  )}
              </div>

              {/* Tax Documents */}
              <div className="bg-gradient-to-br from-paper-100 to-white dark:from-ink-800 dark:to-ink-900 border border-paper-200 dark:border-ink-700 rounded-2xl p-5 shadow-sm trans-theme relative overflow-hidden text-left">
                  <FileText className="w-24 h-24 absolute -right-4 -bottom-4 text-paper-200 dark:text-ink-700/50 opacity-50 pointer-events-none transform -rotate-12" />
                  
                  <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2 mb-2 relative z-10">
                      Tax Documents
                  </h3>
                  <p className="text-xs text-paper-500 dark:text-ink-400 mb-4 relative z-10">Your 1099-K forms and annual summaries for tax filing.</p>
                  
                  <div className="space-y-2 relative z-10">
                      <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-paper-200 dark:border-ink-600 bg-white dark:bg-ink-950 hover:border-coral-500/50 hover:text-coral-500 dark:hover:text-coral-400 trans-subtle group">
                          <div className="flex items-center gap-2">
                              <FileDown className="w-4 h-4 text-paper-400 group-hover:text-coral-500 trans-subtle" />
                              <span className="text-xs font-medium text-paper-700 dark:text-ink-200 group-hover:text-coral-500 dark:group-hover:text-coral-400 trans-subtle">2023 Form 1099-K</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                      </button>
                      <button className="w-full flex items-center justify-between p-2.5 rounded-lg border border-paper-200 dark:border-ink-600 bg-white dark:bg-ink-950 hover:bg-paper-50 dark:hover:bg-ink-800 trans-subtle group text-left">
                          <div className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4 text-paper-400" />
                              <span className="text-xs font-medium text-paper-700 dark:text-ink-200">Stripe Express Dashboard</span>
                          </div>
                      </button>
                  </div>
              </div>

          </div>
      </div>
      
      {/* Modals */}
      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}
