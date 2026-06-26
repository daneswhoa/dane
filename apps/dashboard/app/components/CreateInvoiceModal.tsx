'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Calendar, FileText, Loader2, BadgeDollarSign, Info, AlertTriangle, CheckCircle2, Copy, ArrowRight, RotateCcw } from 'lucide-react';

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type ModalView = 'form' | 'success' | 'error';

export default function CreateInvoiceModal({ onClose, onSuccess }: CreateInvoiceModalProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [view, setView] = useState<ModalView>('form');
  const [resultData, setResultData] = useState<{ id: string; invoiceNum: string; amount: string; tenantName: string; propertyName: string; type: string } | null>(null);
  const [errorDetail, setErrorDetail] = useState('');

  // Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Rent');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('http://localhost:4000/api/dashboard/billing-properties', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        } else {
          setFormError('Failed to load properties. Server returned status ' + res.status + '.');
        }
      } catch (err: any) {
        console.error('Failed to load properties', err);
        setFormError('Could not connect to the server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !amount || !dueDate) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    const selectedUnit = selectedProperty?.units?.find((u: any) => u.id === selectedUnitId);

    try {
      const res = await fetch('http://localhost:4000/api/dashboard/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          unitId: selectedUnitId || null,
          amount: Number(amount),
          type,
          dueDate,
          description
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response body may not be JSON
      }

      if (!res.ok) {
        const msg = data?.message || data?.error || `Server error (${res.status}). Invoice was not created.`;
        setErrorDetail(msg);
        setView('error');
        setIsSubmitting(false);
        return;
      }

      // Build result for success screen
      let tenantLabel = 'Property Resident';
      if (selectedUnit && selectedUnit.tenantId) {
        tenantLabel = `Tenant in Unit ${selectedUnit.label}`;
      }

      setResultData({
        id: data.id || 'N/A',
        invoiceNum: 'INV-' + (data.id || '').replace('inv-', '').toUpperCase().slice(0, 6),
        amount: Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        tenantName: tenantLabel,
        propertyName: selectedProperty?.name || 'Property',
        type,
      });
      setView('success');
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorDetail(err.message || 'An unexpected network error occurred.');
      setView('error');
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    onSuccess();
  };

  const handleRetry = () => {
    setView('form');
    setErrorDetail('');
    setFormError('');
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedUnit = selectedProperty?.units?.find((u: any) => u.id === selectedUnitId);

  // ──────────── SUCCESS VIEW ────────────
  if (view === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm bg-ink-950/80">
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
          {/* Success Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-400/10" />
            <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
              {/* Animated check icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-paper-900 dark:text-white mb-1">Invoice Created</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">
                The invoice has been generated and sent to the tenant.
              </p>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="px-6 pb-6">
            <div className="bg-paper-50 dark:bg-ink-950/50 border border-paper-200 dark:border-ink-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">Amount</span>
                <span className="text-lg font-bold text-paper-900 dark:text-white font-mono">${resultData?.amount}</span>
              </div>
              <div className="h-px bg-paper-200 dark:bg-ink-800" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 block mb-0.5">Type</span>
                  <span className="text-xs font-semibold text-paper-700 dark:text-ink-200">{resultData?.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 block mb-0.5">Property</span>
                  <span className="text-xs font-semibold text-paper-700 dark:text-ink-200">{resultData?.propertyName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 block mb-0.5">Billed To</span>
                  <span className="text-xs font-semibold text-paper-700 dark:text-ink-200">{resultData?.tenantName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 block mb-0.5">Reference</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(resultData?.id || '')}
                    className="text-xs font-mono font-semibold text-coral-600 dark:text-coral-400 flex items-center gap-1 hover:underline"
                  >
                    {resultData?.id?.slice(0, 12)}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-paper-600 dark:text-ink-300 bg-paper-100 dark:bg-ink-800 hover:bg-paper-200 dark:hover:bg-ink-700 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Create Another
            </button>
            <button
              onClick={handleDone}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Done
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────── ERROR VIEW ────────────
  if (view === 'error') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm bg-ink-950/80">
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
          {/* Error Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-400/5 to-transparent dark:from-red-500/20 dark:via-red-400/10" />
            <div className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 w-16 h-16 bg-red-500/20 rounded-full animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-paper-900 dark:text-white mb-1">Invoice Failed</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">
                Something went wrong while creating the invoice.
              </p>
            </div>
          </div>

          {/* Error Detail */}
          <div className="px-6 pb-6">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 dark:text-red-500 mb-1.5">Error Details</p>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-medium break-words">
                {errorDetail}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-paper-600 dark:text-ink-300 bg-paper-100 dark:bg-ink-800 hover:bg-paper-200 dark:hover:bg-ink-700 rounded-xl transition-all"
            >
              Close
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-coral-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────── FORM VIEW ────────────
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm bg-ink-950/80">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-50 dark:bg-coral-500/10 flex items-center justify-center text-coral-500 border border-coral-100 dark:border-coral-500/20">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-paper-900 dark:text-white">Create New Invoice</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">Generate a custom bill for a property or unit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-paper-400 hover:text-paper-900 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              <p className="text-sm font-medium">Loading portfolio data...</p>
            </div>
          ) : (
            <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {formError}
                </div>
              )}

              {/* Target Selection */}
              <div className="space-y-4 bg-paper-50 dark:bg-ink-950/50 p-4 rounded-xl border border-paper-200 dark:border-ink-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Target Destination
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-paper-700 dark:text-ink-300">Property <span className="text-coral-500">*</span></label>
                    <select 
                      required
                      value={selectedPropertyId}
                      onChange={(e) => {
                        setSelectedPropertyId(e.target.value);
                        setSelectedUnitId('');
                      }}
                      className="w-full px-3 py-2.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500/50"
                    >
                      <option value="" disabled>Select a property...</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-paper-700 dark:text-ink-300">Unit (Optional)</label>
                    <select 
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      disabled={!selectedPropertyId}
                      className="w-full px-3 py-2.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500/50 disabled:opacity-50"
                    >
                      <option value="">General Property Invoice</option>
                      {selectedProperty?.units?.map((u: any) => (
                        <option key={u.id} value={u.id}>Unit {u.label} {u.status === 'vacant' ? '(Vacant)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedUnit?.status === 'vacant' && (
                  <div className="flex items-start gap-2 text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 p-2 rounded border border-orange-200 dark:border-orange-500/20">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p>This unit is currently vacant. This invoice will be billed directly to the property ledger as an internal entry.</p>
                  </div>
                )}
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Invoice Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-paper-700 dark:text-ink-300">Amount ($) <span className="text-coral-500">*</span></label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-paper-700 dark:text-ink-300">Invoice Type <span className="text-coral-500">*</span></label>
                    <select 
                      required
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500/50"
                    >
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Late Fee">Late Fee</option>
                      <option value="Damage Fine">Damage Fine</option>
                      <option value="Move-in Fees">Move-in Fees</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-paper-700 dark:text-ink-300">Due Date <span className="text-coral-500">*</span></label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-paper-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="date" 
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-paper-700 dark:text-ink-300">Description / Memo</label>
                  <textarea 
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter notes visible to the tenant..."
                    className="w-full px-3 py-2.5 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-coral-500/50 resize-none"
                  ></textarea>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900/50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-paper-600 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            form="create-invoice-form"
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-coral-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              'Generate Invoice'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
