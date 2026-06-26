'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import { ArrowLeft, Printer, CheckCircle, CreditCard, Clock, Landmark, FileText, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  unitId: string;
  amount: number;
  amountPaid?: number;
  type: string;
  status: string;
  issueDate: string;
  dueDate: string;
  description: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getInvoice() {
      if (!params || !params.id) {
        console.warn('No ID parameter present in route params.');
        setError('Missing invoice ID in URL parameters.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching invoice details for ID:', params.id);
        const res = await fetch(`http://localhost:4000/api/dashboard/invoices/${params.id}`, { credentials: 'include' });
        console.log('Invoice fetch response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Successfully loaded invoice details:', data);
          setInvoice(data);
          setLoading(false);
          return;
        } else {
          const errText = await res.text();
          console.warn('Backend returned error status:', res.status, errText);
          try {
            const errJson = JSON.parse(errText);
            setError(`Failed to load invoice: ${errJson.message || res.statusText}`);
          } catch (e) {
            setError(`Failed to load invoice: ${errText || res.statusText}`);
          }
        }
      } catch (e: any) {
        console.warn('Backend API offline or failed to fetch:', e);
        setError(`Failed to connect to API: ${e.message || e}`);
      }

      // Fallback to local storage
      console.log('Checking local storage fallback for ID:', params.id);
      const saved = localStorage.getItem('landlordnl_invoices_list');
      if (saved) {
        try {
          const list: Invoice[] = JSON.parse(saved);
          const found = list.find((i) => i.id === params.id);
          if (found) {
            console.log('Found invoice in local storage fallback:', found);
            setInvoice(found);
            setError(null); // Clear error if fallback succeeded
          } else {
            setError(prev => prev || `Invoice with ID "${params.id}" not found in database or local storage.`);
          }
        } catch (e) {
          console.error('Failed to parse local storage invoices:', e);
        }
      }
      setLoading(false);
    }
    getInvoice();
  }, [params.id]);

  const handleRecordPayment = async () => {
    if (!invoice) return;
    
    const currentPaid = Number(invoice.amountPaid || 0);
    const outstanding = Math.max(0, invoice.amount - currentPaid);
    const promptAmount = prompt(`Enter payment amount (Outstanding balance: $${outstanding.toFixed(2)}):`, `${outstanding.toFixed(2)}`);
    if (promptAmount === null) return;
    const amountToPay = parseFloat(promptAmount);
    if (isNaN(amountToPay) || amountToPay <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }
    if (amountToPay > outstanding) {
      alert(`Amount cannot exceed the remaining outstanding balance of $${outstanding.toFixed(2)}.`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/dashboard/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToPay }),
        credentials: 'include',
      });
      if (res.ok) {
        const nextPaid = currentPaid + amountToPay;
        const nextStatus = nextPaid >= invoice.amount ? 'PAID' : 'PARTIAL';
        setInvoice({ ...invoice, status: nextStatus, amountPaid: nextPaid });
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to record payment on server.');
        return;
      }
    } catch (e) {
      console.warn('API offline, recording payment offline');
    }

    // Local storage fallback
    const saved = localStorage.getItem('landlordnl_invoices_list');
    if (saved) {
      try {
        const list: Invoice[] = JSON.parse(saved);
        const nextPaid = currentPaid + amountToPay;
        const nextStatus = nextPaid >= invoice.amount ? 'PAID' : 'PARTIAL';
        const updated = list.map((i) => (i.id === invoice.id ? { ...i, status: nextStatus, amountPaid: nextPaid } : i));
        localStorage.setItem('landlordnl_invoices_list', JSON.stringify(updated));
        setInvoice({ ...invoice, status: nextStatus, amountPaid: nextPaid });
      } catch (e) {}
    }
  };

  const handleReconcile = async () => {
    if (!invoice) return;
    try {
      const res = await fetch(`http://localhost:4000/api/dashboard/invoices/${invoice.id}/reconcile`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setInvoice({ ...invoice, status: 'RECONCILED' });
        return;
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to reconcile invoice. Check permissions.');
        return;
      }
    } catch (e) {
      console.warn('API offline, reconciling offline');
    }

    // Local storage fallback
    const saved = localStorage.getItem('landlordnl_invoices_list');
    if (saved) {
      try {
        const list: Invoice[] = JSON.parse(saved);
        const updated = list.map((i) => (i.id === invoice.id ? { ...i, status: 'RECONCILED' } : i));
        localStorage.setItem('landlordnl_invoices_list', JSON.stringify(updated));
        setInvoice({ ...invoice, status: 'RECONCILED' });
      } catch (e) {}
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    try {
      const res = await fetch(`http://localhost:4000/api/dashboard/invoices/${invoice.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setInvoice({ ...invoice, status: 'CANCELLED' });
        return;
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to cancel invoice. Check permissions.');
        return;
      }
    } catch (e) {
      console.warn('API offline, cancelling offline');
    }

    // Local storage fallback
    const saved = localStorage.getItem('landlordnl_invoices_list');
    if (saved) {
      try {
        const list: Invoice[] = JSON.parse(saved);
        const updated = list.map((i) => (i.id === invoice.id ? { ...i, status: 'CANCELLED' } : i));
        localStorage.setItem('landlordnl_invoices_list', JSON.stringify(updated));
        setInvoice({ ...invoice, status: 'CANCELLED' });
      } catch (e) {}
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coral-500"></div>
          <p className="text-paper-400 text-xs font-semibold animate-pulse">Loading secure financial details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !invoice) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl shadow-sm space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-coral-500/10 flex items-center justify-center text-coral-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-paper-900 dark:text-white">Failed to Load Invoice</h3>
          <p className="text-xs text-paper-500 dark:text-ink-400 leading-relaxed">
            {error || `Invoice with ID "${params.id}" could not be found.`}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => router.push('/finance/invoices')}
              className="flex items-center gap-1.5 px-4 py-2 border border-paper-250 dark:border-ink-800 hover:bg-paper-100 dark:hover:bg-ink-900 rounded-lg text-xs font-semibold transition-all text-paper-700 dark:text-ink-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Invoices
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-coral-500/10"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full animate-fade-in text-sm text-paper-800 dark:text-ink-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/finance/invoices')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-paper-250 dark:border-ink-800 hover:bg-paper-100 dark:hover:bg-ink-900 rounded-lg text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 border border-paper-250 dark:border-ink-800 hover:bg-paper-100 dark:hover:bg-ink-900 rounded-lg text-xs font-semibold transition-all"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            {invoice.status !== 'PAID' && invoice.status !== 'RECONCILED' && invoice.status !== 'CANCELLED' && (
              <>
                <button
                  onClick={handleRecordPayment}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-500/10"
                >
                  <CheckCircle className="w-4 h-4" /> Record Payment
                </button>
                <button
                  onClick={handleReconcile}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-purple-500/10"
                >
                  <ShieldCheck className="w-4 h-4" /> Reconcile
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-rose-500/10"
                >
                  <XCircle className="w-4 h-4" /> Cancel Invoice
                </button>
              </>
            )}
          </div>
        </div>

        {/* Invoice Statement Layout */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          <div className="flex justify-between items-start border-b border-paper-200 dark:border-ink-750 pb-6">
            <div className="space-y-1.5">
              <span className="text-coral-500 font-extrabold uppercase tracking-wider text-base">LandlordNL</span>
              <p className="text-[10px] text-paper-400 font-mono">FINANCIAL ASSET STATEMENT</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-base font-bold text-paper-900 dark:text-white block">{invoice.invoiceNumber}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                invoice.status === 'OVERDUE'
                  ? 'bg-coral-500/15 border-coral-500/30 text-coral-500'
                  : invoice.status === 'PAID'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                  : invoice.status === 'RECONCILED'
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-500'
                  : invoice.status === 'PARTIAL'
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-500'
                  : 'bg-paper-200 border-paper-300 text-paper-600 dark:bg-ink-700 dark:border-ink-600 dark:text-ink-300'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-paper-400 uppercase font-bold block">Billed To</span>
              <span className="font-bold text-paper-900 dark:text-white text-sm block">{invoice.tenantName}</span>
              <span className="text-paper-500 block">{invoice.propertyName} — Unit {invoice.unitId}</span>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[9px] text-paper-400 uppercase font-bold block">Statement Dates</span>
              <p className="text-paper-600 dark:text-ink-300"><strong>Issued:</strong> {invoice.issueDate}</p>
              <p className="text-paper-600 dark:text-ink-300"><strong>Due Date:</strong> {invoice.dueDate}</p>
            </div>
          </div>

          {/* Warning Banner */}
          {invoice.status === 'OVERDUE' && (
            <div className="bg-coral-500/10 border border-coral-500/25 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-coral-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-coral-500 block">Ledger Outstanding Balance Warning</span>
                <span className="text-[9px] text-coral-500/90 leading-relaxed block">
                  This transaction remains unpaid. Late fee charges or credit restrictions may apply if payment is not settled immediately.
                </span>
              </div>
            </div>
          )}

          {/* Details Table */}
          <div className="space-y-4">
            <span className="text-[9px] text-paper-400 uppercase font-bold block">Transaction Details</span>
            <div className="border border-paper-200 dark:border-ink-750 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper-50 dark:bg-ink-900/50 border-b border-paper-200 dark:border-ink-750 text-[10px] uppercase font-bold text-paper-500 dark:text-ink-400">
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5">Category Type</th>
                    <th className="px-4 py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-150 dark:divide-ink-750">
                  <tr>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold block">{invoice.description}</span>
                      <span className="text-[10px] text-paper-400">Property: {invoice.propertyName} (Unit {invoice.unitId})</span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-paper-600 dark:text-ink-300">
                      {invoice.type}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-paper-900 dark:text-white">
                      ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-paper-50/50 dark:bg-ink-900/10 font-bold">
                    <td colSpan={2} className="px-4 py-3 text-right text-paper-500 uppercase tracking-wider text-[10px]">Total Amount Due</td>
                    <td className="px-4 py-3 text-right text-paper-900 dark:text-white text-sm">
                      ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-paper-200 dark:border-ink-750 pt-4 flex gap-4 text-[10px] text-paper-450 items-center justify-between">
            <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> Direct settlement configured via LandlordNL platform wallet</span>
            <span>Thank you for choosing LandlordNL</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
