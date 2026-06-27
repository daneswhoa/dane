'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { TenantProfile } from '../types';

const stripePromise = loadStripe('pk_test_51TlIGlEniOjmW1hmLB7GJR17MSNsglE7uWBHFURNXkGdN05PvjGVtqfTEAO0j77pTMTMWgoXESASTnZlN6yxN5KI00V1VHnjD6');

// Global PDF print utility function for receipt
const downloadReceiptPDF = (invoice: any, profile: any) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  const issueDateStr = invoice.issueDate || (invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : new Date().toLocaleDateString());
  const dueDateStr = invoice.dueDate || new Date().toLocaleDateString();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${invoice.invoiceNumber || invoice.id}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 40px;
            padding: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .brand-name {
            font-size: 24px;
            font-weight: 800;
            color: #f43f5e;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin: 0;
            color: #0f172a;
          }
          .meta-grid {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 40px;
          }
          .meta-box h4 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin: 0 0 5px 0;
          }
          .meta-box p {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
            line-height: 1.4;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .table th {
            border-bottom: 2px solid #0f172a;
            padding: 10px;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            text-align: left;
          }
          .table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 15px 10px;
            font-size: 14px;
          }
          .table td.right, .table th.right {
            text-align: right;
          }
          .totals {
            margin-left: auto;
            width: 300px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .totals-row.grand {
            border-top: 2px solid #0f172a;
            padding-top: 10px;
            font-size: 18px;
            font-weight: 800;
            color: #f43f5e;
          }
          .footer {
            margin-top: 100px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-name">landlord.nl</div>
            <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">Property Management Platform</p>
          </div>
          <div style="text-align: right;">
            <h1 class="receipt-title">Payment Receipt</h1>
            <p style="font-size: 12px; font-weight: 600; margin: 5px 0 0 0; font-family: monospace; color: #64748b;">#REC-${invoice.invoiceNumber || invoice.id}</p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <h4>Billed To</h4>
            <p>${invoice.tenantName || profile?.name || 'Resident'}</p>
            <p style="color: #64748b; font-size: 13px;">${invoice.propertyName || profile?.building || ''}</p>
            <p style="color: #64748b; font-size: 13px;">${invoice.tenantEmail || profile?.email || ''}</p>
          </div>
          <div class="meta-box" style="text-align: right;">
            <h4>Payment Details</h4>
            <p>Date Paid: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Payment Method: Credit Card (Visa)</p>
            <p>Status: Successful Settle</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="right">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span style="font-weight: 600;">${invoice.description || 'Base Rent Charge'}</span><br/>
                <span style="font-size: 12px; color: #64748b;">${invoice.type || 'Rent'}</span>
              </td>
              <td class="right" style="font-weight: 600;">$${Number(invoice.amount).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>$${Number(invoice.amount).toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Tax / Fees</span>
            <span>$0.00</span>
          </div>
          <div class="totals-row grand">
            <span>Total Paid</span>
            <span>$${Number(invoice.amount).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for your payment. If you have any questions, please contact your property manager.
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait for loading, focus and trigger native print dialog
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};

interface CheckoutFormProps {
  invoice: any;
  onSuccess: () => void;
}

function CheckoutForm({ invoice, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create Payment Intent on Backend with credentials included to send cookies
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await res.json();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not loaded');
      }

      // 2. Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment verification failed');
      }

      // 3. Confirm settlement on backend with credentials included
      if (result.paymentIntent?.status === 'succeeded') {
        const confirmRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/payments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invoice.id,
            paymentIntentId: result.paymentIntent.id,
          }),
          credentials: 'include'
        });

        if (!confirmRes.ok) {
          throw new Error('Payment succeeded but settlement update failed on server.');
        }

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const cardStyle = {
    style: {
      base: {
        color: isDark ? '#f8fafc' : '#0f172a',
        fontFamily: 'Outfit, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '14px',
        '::placeholder': {
          color: isDark ? '#64748b' : '#94a3b8',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2 animate-fade-in">
      <div className="border border-paper-200 dark:border-ink-800 rounded-xl p-4 bg-white dark:bg-ink-950">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-2 ml-1">Credit or Debit Card</label>
        <div className="py-2">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 text-coral-600 dark:text-coral-400 text-xs rounded-lg font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-coral-500/20 active:scale-[0.98] trans-subtle flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <CreditCard className="w-4 h-4" />
        {processing ? 'Processing Payment...' : `Pay $${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </button>
    </form>
  );
}

interface InvoiceModalProps {
  invoiceId: string | null;
  onClose: () => void;
  profile: TenantProfile | null;
}

type ModalStep = 'invoice' | 'payment' | 'success';

export default function InvoiceModal({ invoiceId, onClose, profile }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<ModalStep>('invoice');

  useEffect(() => {
    if (invoiceId) {
      setLoading(true);
      setStep('invoice');
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices`, {
        credentials: 'include'
      })
        .then((res) => res.json())
        .then((data) => {
          const inv = data.find((i: any) => i.id === invoiceId);
          setInvoice(inv || null);
        })
        .catch(() => setInvoice(null))
        .finally(() => setLoading(false));
    }
  }, [invoiceId]);

  if (!invoiceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-ink-900 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden border border-paper-200 dark:border-ink-700 animate-slide-up trans-theme">
        
        {/* Header (Hidden on success step to maximize aesthetics of the custom illustration layout) */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-b border-paper-200 dark:border-ink-800 flex items-center justify-between bg-paper-50 dark:bg-ink-950 trans-theme">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-coral-500 text-white flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-paper-900 dark:text-white leading-tight">Landlord.nl Property Management</h2>
                <p className="text-[10px] text-paper-500 dark:text-ink-400">Invoice Details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-paper-400 hover:text-paper-900 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-coral-500 font-semibold animate-pulse">Loading Invoice...</div>
            </div>
          ) : !invoice ? (
            <div className="flex items-center justify-center py-12 text-paper-500 dark:text-ink-400">
              Invoice not found or failed to load.
            </div>
          ) : step === 'payment' ? (
            <div className="max-w-md mx-auto py-4">
              <div className="mb-6">
                <h3 className="text-xl font-black text-paper-900 dark:text-white tracking-tight">Settle Balance</h3>
                <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">Please enter your credit or debit card details to pay invoice #{invoice.invoiceNumber || invoice.id}.</p>
              </div>
              <Elements stripe={stripePromise}>
                <CheckoutForm invoice={invoice} onSuccess={() => setStep('success')} />
              </Elements>
              <button 
                onClick={() => setStep('invoice')}
                className="w-full mt-3 py-2.5 text-center text-xs font-semibold text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-white hover:underline"
              >
                Go Back to Invoice Details
              </button>
            </div>
          ) : step === 'success' ? (
            <div className="flex flex-col items-center py-4 text-center animate-fade-in max-w-md mx-auto">
              
              {/* Illustration container with absolute wordmark overlay */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 mb-6 group shadow-lg">
                {/* Wordmark logo overlaid in top left */}
                <div className="absolute top-4 left-4 z-10 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 dark:border-ink-700/30 flex items-center justify-center">
                  <img src="/wordmark.png" alt="landlord.nl" className="h-4 object-contain brightness-0 dark:brightness-100 invert dark:invert-0" />
                </div>
                {/* Generated illustration */}
                <img 
                  src="/payment_success.png" 
                  alt="Payment successful illustration" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
                />
              </div>

              {/* Success details */}
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-black text-paper-900 dark:text-white tracking-tight">Payment Settled</h3>
              <p className="text-xs text-paper-500 dark:text-ink-400 mt-1 max-w-xs">Your payment of <strong>${Number(invoice.amount).toFixed(2)}</strong> has been processed successfully.</p>

              {/* Receipt card info */}
              <div className="w-full mt-6 bg-paper-50 dark:bg-ink-950 p-4 rounded-xl border border-paper-100 dark:border-ink-800/80 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-paper-500 dark:text-ink-400">Invoice Number</span>
                  <span className="font-mono font-bold text-paper-900 dark:text-white">#{invoice.invoiceNumber || invoice.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-paper-500 dark:text-ink-400">Amount Paid</span>
                  <span className="font-extrabold text-coral-600 dark:text-coral-400 text-sm">${Number(invoice.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-paper-500 dark:text-ink-400">Paid On</span>
                  <span className="font-medium text-paper-800 dark:text-ink-200">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-paper-500 dark:text-ink-400">Payment Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    Settled
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="w-full mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => downloadReceiptPDF(invoice, profile)}
                  className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-coral-500/20 active:scale-[0.98] trans-subtle flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Receipt (PDF)
                </button>
                <button
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="w-full py-3 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                >
                  Close
                </button>
              </div>

            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-3xl font-extrabold text-paper-900 dark:text-white tracking-tight mb-2">Invoice</h3>
                  <p className="text-sm font-mono text-paper-500 dark:text-ink-400 font-medium">#{invoice.invoiceNumber || invoice.id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-paper-900 dark:text-white mb-1">Billed To:</p>
                  <p className="text-sm text-paper-700 dark:text-ink-200">{invoice.tenantName || profile?.name}</p>
                  <p className="text-xs text-paper-500 dark:text-ink-400">{invoice.propertyName || profile?.building}</p>
                  <p className="text-xs text-paper-500 dark:text-ink-400">{invoice.tenantEmail || profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-paper-50 dark:bg-ink-950/50 p-4 rounded-xl border border-paper-100 dark:border-ink-800">
                <div>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider mb-1">Date Issued</p>
                  <p className="text-sm font-medium text-paper-900 dark:text-white">{invoice.issueDate || invoice.createdAt?.substring(0, 10)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider mb-1">Due Date</p>
                  <p className="text-sm font-medium text-coral-600 dark:text-coral-400">{invoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                    invoice.status.toUpperCase() === 'PAID'
                      ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold tracking-wider mb-1">Total Due</p>
                  <p className="text-lg font-bold text-paper-900 dark:text-white leading-none">${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-semibold">
                    <th className="pb-3 pl-2">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-paper-100 dark:divide-ink-800/50">
                  <tr>
                    <td className="py-4 pl-2">
                      <p className="font-semibold text-paper-900 dark:text-white">{invoice.description || 'Base Rent Charge'}</p>
                      <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">{invoice.type || 'Rent'}</p>
                    </td>
                    <td className="py-4 text-right font-medium text-paper-900 dark:text-white">${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end pt-4 border-t-2 border-paper-900 dark:border-white border-dashed">
                <div className="w-full sm:w-1/2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-paper-600 dark:text-ink-300">Subtotal</span>
                    <span className="text-sm font-medium text-paper-900 dark:text-white">${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-paper-600 dark:text-ink-300">Amount Paid</span>
                    <span className="text-sm font-medium text-paper-900 dark:text-white">${invoice.status.toUpperCase() === 'PAID' ? Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-paper-200 dark:border-ink-700">
                    <span className="text-base font-bold text-paper-900 dark:text-white">Total Balance</span>
                    <span className="text-xl font-extrabold text-coral-600 dark:text-coral-400">
                      ${invoice.status.toUpperCase() === 'PAID' ? '0.00' : Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && invoice && step === 'invoice' && (
          <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 flex flex-wrap items-center justify-between gap-4 trans-theme">
            <div className="flex gap-2">
              <button 
                onClick={() => downloadReceiptPDF(invoice, profile)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-800 text-sm font-semibold trans-subtle"
              >
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download Receipt</span>
              </button>
            </div>
            {invoice.status.toUpperCase() !== 'PAID' ? (
              <button 
                onClick={() => setStep('payment')} 
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold shadow-sm shadow-coral-500/20 active:scale-95 trans-subtle"
              >
                Pay Now <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-800 dark:text-white text-sm font-semibold transition-all"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
