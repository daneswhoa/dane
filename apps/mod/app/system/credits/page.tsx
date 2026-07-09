'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ModLayout from '../../components/ModLayout';
import { 
  Coins, Key, ShieldCheck, Save, AlertTriangle, ArrowRightLeft, 
  Wallet, HelpCircle, Activity, RefreshCw, Layers
} from 'lucide-react';

interface PricingConfig {
  emailBroadcastCost: number;
  sophiaChatCost: number;
  sophiaToolCost: number;
}

export default function CreditsOverviewPage() {
  const [reserveBalance, setReserveBalance] = useState<number>(0);
  const [spentBalance, setSpentBalance] = useState<number>(0);
  const [pricing, setPricing] = useState<PricingConfig>({
    emailBroadcastCost: 2,
    sophiaChatCost: 1,
    sophiaToolCost: 5
  });

  const [pricingBroadcast, setPricingBroadcast] = useState<number>(2);
  const [pricingChat, setPricingChat] = useState<number>(1);
  const [pricingTool, setPricingTool] = useState<number>(5);

  const [simKesAmount, setSimKesAmount] = useState<number>(250);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tamper Scan states
  const [scanResult, setScanResult] = useState<{ isValid: boolean, totalBlocks: number, discrepancies: any[] } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchLedgerInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/reserve-info');
      if (res.ok) {
        const data = await res.json();
        setReserveBalance(data.reserveBalance || 0);
        setSpentBalance(data.spentBalance || 0);
        if (data.pricing) {
          setPricing(data.pricing);
          setPricingBroadcast(data.pricing.emailBroadcastCost);
          setPricingChat(data.pricing.sophiaChatCost);
          setPricingTool(data.pricing.sophiaToolCost);
        }
      } else {
        triggerToast('Failed to retrieve ledger reserves');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error loading ledger reserve balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerInfo();
  }, []);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/dashboard/security/credits/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailBroadcastCost: pricingBroadcast,
          sophiaChatCost: pricingChat,
          sophiaToolCost: pricingTool
        })
      });
      if (res.ok) {
        triggerToast('Dynamic cost matrix updated successfully');
        fetchLedgerInfo();
      } else {
        triggerToast('Failed to update system pricing configurations');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Network error updating configurations');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTamperScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/dashboard/security/credits/validate-chain');
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
        if (data.isValid) {
          triggerToast('Chained ledger signature checks passed with 100% integrity!');
        } else {
          triggerToast('Tamper alert: ledger block breaks detected!');
        }
      } else {
        triggerToast('Failed to validate cryptographic chain');
      }
    } catch (e) {
      triggerToast('Scan failed due to connection error');
    } finally {
      setIsScanning(false);
    }
  };

  // 1 KES = 6 tokens
  const simTokensOut = simKesAmount * 6;

  return (
    <ModLayout title="System / Credits & Ledger / Overview">
      <div className="space-y-6 w-full pb-10">
        
        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/35 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB NAVIGATION HEADER */}
        <div className="flex border-b border-paper-200 dark:border-ink-800 pb-px gap-6">
          <Link href="/system/credits">
            <span className="text-xs font-bold uppercase tracking-wider text-coral-500 border-b-2 border-coral-500 pb-2.5 cursor-pointer">
              Overview & Pricing
            </span>
          </Link>
          <Link href="/system/credits/reserve">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Central Reserve
            </span>
          </Link>
          <Link href="/system/credits/users">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              User Allocations
            </span>
          </Link>
          <Link href="/system/credits/tracer">
            <span className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white pb-2.5 cursor-pointer transition-colors">
              Block Tracer
            </span>
          </Link>
        </div>

        {/* STATS OVERVIEW SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-ink-900 p-5 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Reserve Wallet Balance</p>
                <h3 className="text-2xl font-black text-paper-900 dark:text-white mt-1 font-mono">
                  {isLoading ? '...' : reserveBalance.toLocaleString()}
                </h3>
                <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-1">Available supply to fulfill landlord refills.</p>
              </div>
              <Coins className="w-8 h-8 text-coral-500 opacity-80 animate-pulse-slow" />
            </div>
          </div>

          <div className="bg-white dark:bg-ink-900 p-5 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Total Spent Supply</p>
                <h3 className="text-2xl font-black text-paper-900 dark:text-white mt-1 font-mono">
                  {isLoading ? '...' : Math.abs(spentBalance).toLocaleString()}
                </h3>
                <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-1">Tokens returning to the central reserves system.</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white dark:bg-ink-900 p-5 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest">Block Link Status</p>
                <h3 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> UTXO Cryptography
                </h3>
                <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-2">All blocks sequentially signed & parent-chained.</p>
              </div>
              <button 
                onClick={fetchLedgerInfo}
                disabled={isLoading}
                className="p-2 hover:bg-paper-100 dark:hover:bg-ink-850 rounded-xl transition-colors shrink-0"
              >
                <RefreshCw className="w-4 h-4 text-paper-400" />
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Cost Configuration Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-6">
              <div className="border-b border-paper-100 dark:border-ink-800/80 pb-4 mb-5 flex items-center gap-2">
                <Key className="w-5 h-5 text-coral-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">Token Cost Matrix Pricing</h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Dynamically adjust costs applied per action across tenant accounts.</p>
                </div>
              </div>

              <form onSubmit={handleSavePricing} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-paper-450 dark:text-ink-450 block">Email Broadcast (tokens/recip)</label>
                    <input 
                      type="number" 
                      value={pricingBroadcast} 
                      onChange={(e) => setPricingBroadcast(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-paper-450 dark:text-ink-450 block">Sophia Conversation (tokens/msg)</label>
                    <input 
                      type="number" 
                      value={pricingChat} 
                      onChange={(e) => setPricingChat(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-paper-450 dark:text-ink-450 block">Sophia Tool Call (tokens/exec)</label>
                    <input 
                      type="number" 
                      value={pricingTool} 
                      onChange={(e) => setPricingTool(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-paper-900 hover:bg-paper-800 dark:bg-white dark:hover:bg-paper-100 dark:text-ink-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Pricing Matrix
                </button>
              </form>
            </div>

            {/* BLOCKCHAIN TAMPER CHECK SCANNER */}
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-6">
              <div className="border-b border-paper-100 dark:border-ink-800/80 pb-4 mb-5 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">Ledger Chain Integrity Verification Scanner</h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Recalculates cryptographic hashes sequentially across the transactions ledger table to audit for sequence breaks or database injection.</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleTamperScan}
                  disabled={isScanning}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isScanning ? 'Verifying blocks signatures...' : 'Run Ledger Signature Verification Scan'}
                </button>

                {scanResult && (
                  <div className={`p-4 rounded-xl border text-xs ${scanResult.isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {scanResult.isValid ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <span>{scanResult.isValid ? 'Mathematical Integrity Verified' : 'CRITICAL WARNING: Chain sequence compromised!'}</span>
                    </div>
                    <p className="mt-1 text-[11px]">
                      Scanned <span className="font-bold">{scanResult.totalBlocks} blocks</span>. 
                      {scanResult.isValid 
                        ? ' All parent hashes (`previousTxid`) correctly link in mathematical chronological sequence. Zero block insertion or tampering detected.'
                        : ` Detected ${scanResult.discrepancies.length} link sequence error(s). Review tracer block list.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Simulator */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm p-6">
              <div className="border-b border-paper-100 dark:border-ink-800/80 pb-4 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-900 dark:text-white">Tokens Simulator</h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-405 mt-0.5">Simulate purchase calculations for landlord package refills.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 block">Enter KES value</label>
                  <input 
                    type="number" 
                    value={simKesAmount}
                    onChange={(e) => setSimKesAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-paper-50 dark:bg-ink-950/40 rounded-xl border border-paper-250 dark:border-ink-800/50 space-y-2 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-paper-400 dark:text-ink-550">Token Conversion Output:</span>
                    <span className="font-mono text-paper-900 dark:text-white font-bold">{simTokensOut.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper-400 dark:text-ink-550">Equivalent USD Package:</span>
                    <span className="font-mono text-paper-950 dark:text-white font-bold">${(simKesAmount / 125).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper-400 dark:text-ink-550">Email Broadcast Cap:</span>
                    <span className="font-mono text-paper-900 dark:text-white font-bold">~{Math.floor(simTokensOut / pricing.emailBroadcastCost)} recipients</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-paper-400 dark:text-ink-550">Sophia Chat Cap:</span>
                    <span className="font-mono text-paper-900 dark:text-white font-bold">~{Math.floor(simTokensOut / pricing.sophiaChatCost)} turns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </ModLayout>
  );
}
