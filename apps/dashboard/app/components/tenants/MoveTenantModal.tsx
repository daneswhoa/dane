'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Home, ArrowRightLeft, Loader2, Building2 } from 'lucide-react';

interface Unit {
  id: string;
  label: string;
  status: string;
  propertyName: string;
}

interface MoveTenantModalProps {
  tenantId: string;
  tenantName: string;
  currentUnitLabel?: string;
  currentPropertyName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function MoveTenantModal({
  tenantId,
  tenantName,
  currentUnitLabel,
  currentPropertyName,
  onClose,
  onSuccess,
}: MoveTenantModalProps) {
  const [vacantUnits, setVacantUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVacantUnits() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/units`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to retrieve unit records.');
        const data: any[] = await res.json();
        
        // Filter vacant units
        const vacant = data.filter((u) => u.status === 'vacant');
        setVacantUnits(vacant);
      } catch (err: any) {
        setError(err.message || 'Error occurred while retrieving vacant units.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVacantUnits();
  }, []);

  const handleMove = async () => {
    if (!selectedUnitId) {
      setError('Please select a target vacant unit.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId, unitId: selectedUnitId }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to move tenant.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred while moving tenant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUnits = vacantUnits.filter(
    (u) =>
      u.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-sm">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between bg-paper-50/50 dark:bg-ink-950/20">
          <div className="flex items-center gap-2 text-paper-950 dark:text-white font-bold">
            <ArrowRightLeft className="w-4 h-4 text-coral-500" />
            <span>Move Tenant</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-400 dark:text-ink-500 hover:text-paper-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-grow overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
              Tenant to Move
            </span>
            <div className="mt-1 font-semibold text-paper-800 dark:text-white text-base">
              {tenantName}
            </div>
            {currentUnitLabel && currentPropertyName && (
              <div className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">
                Current: {currentPropertyName} — Unit {currentUnitLabel}
              </div>
            )}
          </div>

          <hr className="border-paper-150 dark:border-ink-800" />

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
              Select Target Vacant Unit
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vacant units by building or label..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-paper-200 dark:border-ink-800 rounded-lg bg-white dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
              />
            </div>
          </div>

          {/* Vacant units selection */}
          <div className="space-y-2 max-h-48 overflow-y-auto border border-paper-150 dark:border-ink-800 rounded-lg divide-y divide-paper-150 dark:divide-ink-800">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-paper-400 dark:text-ink-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-coral-500 animate-spin" />
                <span>Loading available units...</span>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="p-8 text-center text-xs text-paper-400 dark:text-ink-500">
                No vacant units found.
              </div>
            ) : (
              filteredUnits.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`w-full text-left p-3 flex items-center justify-between text-xs transition-colors ${
                    selectedUnitId === u.id
                      ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-400 font-semibold'
                      : 'hover:bg-paper-50 dark:hover:bg-ink-800 text-paper-800 dark:text-ink-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${selectedUnitId === u.id ? 'text-coral-500' : 'text-paper-400'}`} />
                    <div>
                      <div className="font-semibold text-paper-900 dark:text-white">
                        Unit {u.label}
                      </div>
                      <div className="text-[10px] text-paper-400 dark:text-ink-500">
                        {u.propertyName}
                      </div>
                    </div>
                  </div>
                  {selectedUnitId === u.id && (
                    <div className="w-2 h-2 rounded-full bg-coral-500"></div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-paper-150 dark:border-ink-800 flex items-center justify-end gap-2 bg-paper-50/50 dark:bg-ink-950/20">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-paper-250 dark:border-ink-800 text-xs font-semibold text-paper-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isSubmitting || !selectedUnitId}
            className="flex items-center gap-1 px-4 py-1.5 rounded bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Move</span>
          </button>
        </div>
      </div>
    </div>
  );
}
