'use client';

import React, { useState } from 'react';
import { X, Home, Loader2, DollarSign } from 'lucide-react';

interface Unit {
  id: string;
  label: string;
  rent: number;
  status: string;
}

interface EditUnitModalProps {
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUnitModal({ unit, onClose, onSuccess }: EditUnitModalProps) {
  const [label, setLabel] = useState(unit.label);
  const [rent, setRent] = useState<string>(String(unit.rent));
  const [status, setStatus] = useState(unit.status);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const rentNum = parseFloat(rent);
      if (isNaN(rentNum) || rentNum < 0) {
        throw new Error('Please enter a valid monthly rent rate.');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/units/${unit.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          rent: rentNum,
          status,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update unit parameters.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving unit configurations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-sm">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between bg-paper-50/50 dark:bg-ink-950/20">
          <div className="flex items-center gap-2 text-paper-950 dark:text-white font-bold">
            <Home className="w-4 h-4 text-coral-500" />
            <span>Configure Unit {unit.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-400 dark:text-ink-500 hover:text-paper-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
              Unit Label / Name
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-paper-200 dark:border-ink-850 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
              Monthly Rent Rate
            </label>
            <div className="relative mt-1">
              <DollarSign className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-paper-200 dark:border-ink-850 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
              Occupancy Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-paper-200 dark:border-ink-850 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
            >
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant (Removes active tenant)</option>
            </select>
          </div>

          {/* Footer */}
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
