'use client';

import React, { useState } from 'react';
import { X, Building2, Loader2, ArrowUpRight, DollarSign } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  currency?: string;
}

interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPropertyModal({ property, onClose, onSuccess }: EditPropertyModalProps) {
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const [currency, setCurrency] = useState(property.currency || 'USD');

  const getCurrencySymbol = (cur: string) => {
    switch (cur.toUpperCase()) {
      case 'KES': return 'KES ';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return '$';
    }
  };
  const symbol = getCurrencySymbol(currency);
  
  // Rent Adjustment fields
  const [adjustType, setAdjustType] = useState<'none' | 'percentage' | 'amount'>('none');
  const [percentage, setPercentage] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Update basic details
      if (name !== property.name || address !== property.address || currency !== property.currency) {
        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties/${property.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, address, currency }),
          credentials: 'include',
        });
        if (!updateRes.ok) {
          const errData = await updateRes.json();
          throw new Error(errData.message || 'Failed to update property details.');
        }
      }

      // 2. Perform rent adjustment if requested
      if (adjustType !== 'none') {
        const payload: any = {};
        if (adjustType === 'percentage') {
          const val = parseFloat(percentage);
          if (isNaN(val)) throw new Error('Please enter a valid percentage.');
          payload.percentage = val;
        } else if (adjustType === 'amount') {
          const val = parseFloat(amount);
          if (isNaN(val)) throw new Error('Please enter a valid flat amount.');
          payload.amount = val;
        }

        const adjustRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties/${property.id}/adjust-rent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        if (!adjustRes.ok) {
          const errData = await adjustRes.json();
          throw new Error(errData.message || 'Failed to adjust rent rates.');
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving property settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-sm">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between bg-paper-50/50 dark:bg-ink-950/20">
          <div className="flex items-center gap-2 text-paper-950 dark:text-white font-bold">
            <Building2 className="w-4 h-4 text-coral-500" />
            <span>Edit Property Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-400 dark:text-ink-500 hover:text-paper-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content form */}
        <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name & Address */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Property Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="KES">Kenyan Shilling (KES)</option>
              </select>
            </div>
          </div>

          <hr className="border-paper-150 dark:border-ink-800" />

          {/* Programmatic Rent Adjustment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Rent adjustment (all units)
              </label>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-coral-500/10 text-coral-500 font-bold uppercase tracking-wide">
                Bulk operation
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('none')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${
                  adjustType === 'none'
                    ? 'border-coral-500 bg-coral-500/10 text-coral-500'
                    : 'border-paper-200 dark:border-ink-850 bg-white dark:bg-ink-950 text-paper-700 dark:text-ink-300'
                }`}
              >
                No Change
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('percentage')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${
                  adjustType === 'percentage'
                    ? 'border-coral-500 bg-coral-500/10 text-coral-500'
                    : 'border-paper-200 dark:border-ink-850 bg-white dark:bg-ink-950 text-paper-700 dark:text-ink-300'
                }`}
              >
                Percentage
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('amount')}
                className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${
                  adjustType === 'amount'
                    ? 'border-coral-500 bg-coral-500/10 text-coral-500'
                    : 'border-paper-200 dark:border-ink-850 bg-white dark:bg-ink-950 text-paper-700 dark:text-ink-300'
                }`}
              >
                Flat Amount
              </button>
            </div>

            {adjustType === 'percentage' && (
              <div className="space-y-1">
                <span className="text-[10px] text-paper-400 dark:text-ink-500">
                  Adjustment Percentage (e.g. 5 for +5% yield, -2 for -2%)
                </span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter percentage adjustment..."
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-paper-400 dark:text-ink-500 font-bold">%</span>
                </div>
              </div>
            )}

            {adjustType === 'amount' && (
              <div className="space-y-1">
                <span className="text-[10px] text-paper-400 dark:text-ink-500">
                  Adjustment Currency Value (e.g. 50 for +{symbol}50/mo, -25 for -{symbol}25/mo)
                </span>
                <div className="relative">
                  <div className="w-8 flex items-center justify-center text-paper-400 dark:text-ink-500 absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold select-none">
                    {symbol.trim()}
                  </div>
                  <input
                    type="number"
                    step="1"
                    placeholder={`Enter flat change...`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-paper-150 dark:border-ink-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-paper-250 dark:border-ink-800 text-xs font-semibold text-paper-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1 px-4 py-1.5 rounded bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
