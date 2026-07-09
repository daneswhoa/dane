'use client';

import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface StripeCheckoutModalProps {
  type: 'premium' | 'credits';
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function StripeCheckoutModal({ type, amount, onSuccess, onClose }: StripeCheckoutModalProps) {
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName) {
      setError('Please enter the cardholder name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = type === 'premium' ? 'subscribe' : 'recharge';
      const bodyParams = type === 'credits' ? { amount } : {};
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/team/billing/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParams),
        credentials: 'include'
      });

      if (res.ok) {
        onSuccess();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Payment authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Secure payment checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const costString = type === 'premium' ? '$2.00' : `${Math.round(amount / 6)} KES`;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 dark:bg-black/85 animate-fade-in">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-2xl max-w-md w-full animate-scale-up">
        
        {/* Stripe Header */}
        <div className="px-5 py-4 border-b border-paper-100 dark:border-ink-800/80 bg-paper-50 dark:bg-ink-950/60 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-5 bg-[#5433FF] rounded flex items-center justify-center">
              <span className="text-[8px] font-extrabold text-white tracking-widest font-mono">stripe</span>
            </div>
            <span className="text-xs font-bold text-paper-800 dark:text-white uppercase tracking-wider">Secure Embedded Payment</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-paper-400 hover:text-paper-900 dark:text-ink-550 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-[10px] uppercase font-bold underline">Dismiss</button>
            </div>
          )}

          {/* Order Summary */}
          <div className="p-4 rounded-lg bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800/50">
            <div className="text-[10px] font-bold text-paper-400 dark:text-ink-550 uppercase tracking-widest mb-1">Purchasing Details</div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-xs font-bold text-paper-900 dark:text-white">
                {type === 'premium' ? 'Premium Tier Monthly Subscription' : `Wallet Refill: ${amount.toLocaleString()} tokens`}
              </span>
              <span className="text-base font-extrabold text-paper-900 dark:text-white font-mono">
                {costString}
              </span>
            </div>
          </div>

          {/* Stripe Payment Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider block">Cardholder Name</label>
              <input 
                type="text" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider block">Card Details</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="4242 4242 4242 4242"
                  disabled
                  className="w-full px-3 py-2 pl-9 bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800 rounded text-xs font-mono text-paper-500 dark:text-ink-500 cursor-not-allowed"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider block">Expires</label>
                <input 
                  type="text" 
                  defaultValue="12 / 28" 
                  disabled 
                  className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800 rounded text-xs font-mono text-paper-500 dark:text-ink-550 text-center cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider block">CVC</label>
                <input 
                  type="password" 
                  defaultValue="•••" 
                  disabled 
                  className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950/40 border border-paper-200 dark:border-ink-800 rounded text-xs font-mono text-paper-500 dark:text-ink-550 text-center cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-paper-100 dark:border-ink-850">
            <button
              type="submit"
              disabled={loading || !cardName}
              className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-md shadow-coral-500/10 hover:shadow-coral-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authorizing Payment...
                </>
              ) : (
                <>
                  Confirm Secure Payment
                </>
              )}
            </button>
            <p className="text-[10px] text-paper-400 dark:text-ink-550 text-center mt-2.5 leading-normal">
              By checking out, you authorize landlord.hu to execute sandbox charges on your card via Stripe Elements API.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
