import React, { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { MaintenanceJob } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface InvoiceModalProps {
  job: MaintenanceJob;
  hourlyRate: number;
  onClose: () => void;
  onInvoiceSuccess: () => void;
}

export default function InvoiceModal({
  job,
  hourlyRate,
  onClose,
  onInvoiceSuccess
}: InvoiceModalProps) {
  const [invoiceHours, setInvoiceHours] = useState(2);
  const [invoiceMaterials, setInvoiceMaterials] = useState<Array<{ name: string; cost: number }>>([]);
  const [materialName, setMaterialName] = useState('');
  const [materialCost, setMaterialCost] = useState(0);
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  const addMaterialItem = () => {
    if (!materialName.trim() || materialCost <= 0) return;
    setInvoiceMaterials([...invoiceMaterials, { name: materialName.trim(), cost: materialCost }]);
    setMaterialName('');
    setMaterialCost(0);
  };

  const removeMaterialItem = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i !== index));
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceDescription.trim()) {
      setInvoiceError('Please describe the work done.');
      return;
    }

    setInvoiceError('');
    setIsSubmittingInvoice(true);

    const laborCost = invoiceHours * hourlyRate;
    const materialsCost = invoiceMaterials.reduce((sum, item) => sum + item.cost, 0);
    const totalAmount = laborCost + materialsCost;

    try {
      const res = await fetch(`${API_URL}/api/dashboard/maintenance/${job.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          amount: totalAmount,
          notes: invoiceDescription.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to submit work invoice.');

      onInvoiceSuccess();
    } catch (err: any) {
      setInvoiceError(err.message || 'Connection error while submitting invoice.');
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const laborCost = invoiceHours * hourlyRate;
  const materialsCost = invoiceMaterials.reduce((sum, item) => sum + item.cost, 0);
  const totalAmount = laborCost + materialsCost;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full trans-theme transform scale-100 transition-transform duration-300 ease-out">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-paper-200 dark:border-ink-800 bg-white/50 dark:bg-ink-950/50 backdrop-blur-md flex justify-between items-center trans-theme">
          <div className="text-left">
            <h3 className="text-base font-bold text-paper-900 dark:text-white">Complete & Invoice Job</h3>
            <span className="text-[10px] text-paper-400 dark:text-ink-500 font-mono">Ticket: {job.title}</span>
          </div>
          <button onClick={onClose} className="text-paper-400 hover:text-paper-900 dark:text-ink-500 dark:hover:text-white trans-subtle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmitInvoice} className="p-6 space-y-4 overflow-y-auto text-left">
          {invoiceError && (
            <div className="color-coral-text bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 p-3 rounded-lg text-xs">
              {invoiceError}
            </div>
          )}

          {/* Labor Cost */}
          <div className="bg-paper-100 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">Labor Cost</span>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={invoiceHours} 
                  onChange={(e) => setInvoiceHours(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-1 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
                  min="1"
                />
                <span className="text-xs text-paper-500 dark:text-ink-400">Hours worked</span>
              </div>
              <span className="text-sm font-semibold text-paper-900 dark:text-white">
                @ ${hourlyRate}/hr = ${laborCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Materials Cost */}
          <div className="bg-paper-100 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">Materials & Parts</span>
            
            {invoiceMaterials.length > 0 && (
              <div className="flex flex-col gap-1.5 my-3">
                {invoiceMaterials.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-850 px-3 py-1.5 rounded-lg">
                    <span className="text-paper-700 dark:text-ink-200">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-paper-900 dark:text-white">${item.cost.toFixed(2)}</span>
                      <button type="button" onClick={() => removeMaterialItem(idx)} className="text-coral-500 hover:text-coral-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Material Add Row */}
            <div className="flex gap-2 mt-2">
              <input 
                type="text" 
                value={materialName} 
                onChange={(e) => setMaterialName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-xs"
                placeholder="Item / Part name"
              />
              <input 
                type="number" 
                value={materialCost === 0 ? '' : materialCost} 
                onChange={(e) => setMaterialCost(Math.max(0, Number(e.target.value)))}
                className="w-20 px-3 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-lg text-xs"
                placeholder="Cost ($)"
              />
              <button 
                type="button"
                onClick={addMaterialItem}
                className="px-3 py-1.5 bg-paper-200 dark:bg-ink-800 text-paper-900 dark:text-white hover:bg-paper-300 dark:hover:bg-ink-700 text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          {/* Job Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Job Notes / Resolution Summary</label>
            <textarea 
              value={invoiceDescription} 
              onChange={(e) => setInvoiceDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme resize-none"
              placeholder="Describe the repairs made and parts replaced..."
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="flex justify-between items-baseline pt-3 border-t border-paper-200 dark:border-ink-800">
            <span className="text-sm font-bold text-paper-900 dark:text-white">Total Invoice Amount:</span>
            <span className="text-xl font-bold text-coral-500">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmittingInvoice}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5"
            >
              {isSubmittingInvoice ? (
                <>Submitting Invoice... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Submit Invoice</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
