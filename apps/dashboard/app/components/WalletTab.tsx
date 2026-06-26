'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, ShieldCheck, Clock, History, ArrowRight,
  Landmark, Building2, Building, Plus, MoreHorizontal, Filter,
  Download, Loader2, XCircle, Info, RefreshCw
} from 'lucide-react';

export default function WalletTab() {
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>({ totalRevenue: 0, totalExpenses: 0, netOperatingIncome: 0, cashBalance: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const fetchData = async () => {
    try {
      const profRes = await fetch('http://localhost:4000/api/dashboard/profile', { credentials: 'include' });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
      }

      const sumRes = await fetch('http://localhost:4000/api/dashboard/summary', { credentials: 'include' });
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }

      const wRes = await fetch('http://localhost:4000/api/dashboard/withdrawals', { credentials: 'include' });
      if (wRes.ok) {
        const wData = await wRes.json();
        setWithdrawals(wData);
      }
    } catch (e) {
      console.error('Error fetching manager wallet data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (summary.cashBalance <= 0) {
      alert('You do not have any funds available to withdraw.');
      return;
    }
    setIsWithdrawing(true);
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/stripe/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: summary.cashBalance }),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Withdrawal request initiated successfully. Payout is processing via Stripe Connect.');
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Withdrawal failed. Make sure your Stripe account is connected and verified.');
      }
    } catch (e) {
      console.error(e);
      alert('Error initiating withdrawal.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/stripe/connect', {
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
        alert('Stripe Connect onboarding setup failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Stripe connection error.');
    } finally {
      setIsConnectingStripe(false);
    }
  };
  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-paper-900 dark:text-white tracking-tight">Your Wallet</h1>
        <p className="text-paper-500 dark:text-ink-400 mt-1">Manage your cleared revenue, linked accounts, and withdrawal history.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-ink-800 border-2 border-coral-500/50 dark:border-coral-500/40 rounded-xl p-5 shadow-lg shadow-coral-500/5 transition-colors relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-coral-500/10 dark:bg-coral-500/5 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center gap-2 text-paper-700 dark:text-ink-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Available to Withdraw</span>
            </div>
            <div className="text-4xl font-bold text-paper-900 dark:text-white mt-2 tracking-tight">
              ${Math.floor(summary.cashBalance)}<span className="text-2xl text-paper-400 dark:text-ink-500">.{(summary.cashBalance % 1).toFixed(2).substring(2)}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Fully Cleared</span>
            <button 
              onClick={handleWithdraw}
              disabled={isWithdrawing || summary.cashBalance <= 0 || !profile?.stripeAccountId}
              className="text-xs font-medium text-coral-600 dark:text-coral-400 hover:text-coral-700 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {isWithdrawing ? 'Processing...' : 'Transfer Now'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-paper-700 dark:text-ink-300 mb-1"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium uppercase tracking-wider">Pending Clearance</span></div>
            <div className="text-2xl font-semibold text-paper-900 dark:text-white mt-2 tracking-tight">$0<span className="text-lg text-paper-400 dark:text-ink-500">.00</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-paper-100 dark:border-ink-700/50"><span className="text-[10px] text-paper-500 dark:text-ink-400">Processing payouts. Expected within 2-3 business days.</span></div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-paper-700 dark:text-ink-300 mb-1"><History className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium uppercase tracking-wider">Withdrawn (YTD)</span></div>
            <div className="text-2xl font-semibold text-paper-900 dark:text-white mt-2 tracking-tight">
              ${withdrawals.reduce((sum, w) => sum + Number(w.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-paper-100 dark:border-ink-700/50 flex justify-between items-center">
            <span className="text-[10px] text-paper-500 dark:text-ink-400">Across {withdrawals.length} transaction(s)</span>
            <button className="text-[10px] font-medium text-coral-600 dark:text-coral-400 hover:underline">Download Tax Doc</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Linked Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper-900 dark:text-white">Linked Accounts</h2>
          </div>
          
          {!profile?.stripeAccountId ? (
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm transition-colors text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-paper-900 dark:text-white mb-1">Link your Bank Account</h4>
                <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">Connect securely via Stripe Express to enable withdrawals to your checking account.</p>
              </div>
              <button 
                onClick={handleConnectStripe}
                disabled={isConnectingStripe}
                className="w-full py-2 bg-[#635BFF] hover:bg-[#5851df] text-white text-xs font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isConnectingStripe ? 'Connecting...' : 'Connect with Stripe'}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 shadow-sm transition-colors relative group">
              <div className="absolute right-3 top-3"><span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Default</span></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><Building className="w-4 h-4 text-[#635BFF]" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-paper-900 dark:text-white">Stripe Express</h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-paper-500 dark:text-ink-400 overflow-hidden text-ellipsis">
                Account ID: <span className="font-mono">{profile.stripeAccountId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper-900 dark:text-white">Recent Withdrawals</h2>
            <button className="text-xs text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Filter History</button>
          </div>
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-paper-50 dark:bg-ink-900/50 border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium">
                    <th className="px-4 py-3">Date</th><th className="px-4 py-3">Reference ID</th><th className="px-4 py-3">Destination</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-paper-500 dark:text-ink-400">
                        No recent withdrawals.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w: any) => (
                      <tr key={w.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-all">
                        <td className="px-4 py-3 text-paper-600 dark:text-ink-300">
                          {new Date(w.createdAt).toLocaleDateString()} {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-paper-500 dark:text-ink-400">
                          {w.stripeTransactionId.substring(0, 12)}...
                        </td>
                        <td className="px-4 py-3 text-paper-900 dark:text-white font-medium flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-blue-500" /> Stripe Connected Bank
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-paper-900 dark:text-white">
                          ${Number(w.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-semibold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-paper-400 hover:text-coral-500 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-paper-200 dark:border-ink-700 flex items-center justify-between text-[11px] text-paper-500 dark:text-ink-400 bg-paper-50 dark:bg-ink-900/50">
              <span>Showing 5 recent transactions</span>
              <button className="text-coral-600 dark:text-coral-400 hover:underline font-medium">View All History</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
