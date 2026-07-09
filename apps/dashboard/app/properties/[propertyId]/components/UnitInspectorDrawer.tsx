'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, Mail, Info, Clock, FileText, Wrench, X, Send, CreditCard, Loader2, 
  AlertTriangle, CheckCircle, UserPlus
} from 'lucide-react';
import { formatMoney } from '../types';

interface Unit {
  id: string;
  label: string;
  rent: number;
  status: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
  floor: string | null;
  unitType: string | null;
  arrears: number | null;
  deposit?: number | null;
}

interface LeaseRecord {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  tenantName: string;
  tenantEmail: string;
}

interface TicketRecord {
  id: string;
  title: string;
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  type: string;
  amount: number;
  amountPaid: number;
  status: string;
  dueDate: string;
}

interface UnitDetails {
  leases: LeaseRecord[];
  tickets: TicketRecord[];
  invoices: InvoiceRecord[];
}

interface UnitInspectorDrawerProps {
  unit: Unit;
  propertyId: string;
  onClose: () => void;
  onRefresh: () => void;
  onMoveClientClick: () => void;
  propertyCurrency?: string;
}

export default function UnitInspectorDrawer({
  unit,
  propertyId,
  onClose,
  onRefresh,
  onMoveClientClick,
  propertyCurrency
}: UnitInspectorDrawerProps) {
  const [unitDetails, setUnitDetails] = useState<UnitDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [inspectTab, setInspectTab] = useState<'info' | 'history' | 'invoices' | 'tickets'>('info');

  // Inspector Actions States
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', urgency: 'Medium', category: 'General' });
  const [invoiceForm, setInvoiceForm] = useState({ amount: '', description: '', type: 'Utility Fee', dueDate: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [paymentLogForm, setPaymentLogForm] = useState<{ invoiceId: string; amount: string }>({ invoiceId: '', amount: '' });
  
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Fetch unit details (lease history, tickets, invoices)
  async function loadUnitDetails() {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/units/${unit.id}/details`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUnitDetails(data);
      }
    } catch (err) {
      console.error('Failed to load unit details', err);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  useEffect(() => {
    loadUnitDetails();
    // Reset forms and messages
    setTicketForm({ title: '', description: '', urgency: 'Medium', category: 'General' });
    setInvoiceForm({ amount: '', description: '', type: 'Utility Fee', dueDate: '' });
    setEmailForm({ subject: '', message: '' });
    setPaymentLogForm({ invoiceId: '', amount: '' });
    setActionSuccessMessage('');
    setActionErrorMessage('');
  }, [unit]);

  // Handle Maintenance Ticket Submission
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionSubmitting(true);
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticketForm.title || `${ticketForm.category} Request for Unit ${unit.label}`,
          description: ticketForm.description,
          urgency: ticketForm.urgency,
          category: ticketForm.category,
          propertyId: propertyId,
          unitId: unit.id,
          tenantId: unit.tenantId
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit maintenance request.');
      }

      setActionSuccessMessage('Maintenance request submitted successfully.');
      setTicketForm({ title: '', description: '', urgency: 'Medium', category: 'General' });
      loadUnitDetails();
      onRefresh();
    } catch (err: any) {
      setActionErrorMessage(err.message);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Ad-Hoc Invoice Issue
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionSubmitting(true);
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(invoiceForm.amount),
          description: invoiceForm.description,
          type: invoiceForm.type,
          propertyId: propertyId,
          unitId: unit.id,
          tenantId: unit.tenantId,
          dueDate: invoiceForm.dueDate || undefined
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to issue custom invoice.');
      }

      setActionSuccessMessage('Custom invoice successfully generated.');
      setInvoiceForm({ amount: '', description: '', type: 'Utility Fee', dueDate: '' });
      loadUnitDetails();
      onRefresh();
    } catch (err: any) {
      setActionErrorMessage(err.message);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Send Email notice to active occupant
  const handleSendEmailNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit.tenantId) return;
    setIsActionSubmitting(true);
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants/${unit.tenantId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailForm.subject,
          message: emailForm.message
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to dispatch email notice.');
      }

      setActionSuccessMessage('Notice emailed to tenant successfully.');
      setEmailForm({ subject: '', message: '' });
    } catch (err: any) {
      setActionErrorMessage(err.message);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Log cash / manual payment
  const handleLogManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLogForm.invoiceId) return;
    setIsActionSubmitting(true);
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices/${paymentLogForm.invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(paymentLogForm.amount)
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to log manual payment.');
      }

      setActionSuccessMessage('Manual payment recorded and applied.');
      setPaymentLogForm({ invoiceId: '', amount: '' });
      loadUnitDetails();
      onRefresh();
    } catch (err: any) {
      setActionErrorMessage(err.message);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const hasArrears = Number(unit.arrears || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in text-primary">
      {/* Click-outside area */}
      <div className="flex-1" onClick={onClose}></div>
      
      {/* Drawer container */}
      <div className="w-full max-w-2xl bg-panel border-l border-default shadow-2xl h-full flex flex-col relative animate-slide-left overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-default flex items-center justify-between bg-raised">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-coral-500/10 text-coral-500 flex items-center justify-center border border-coral-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                Unit {unit.label}
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  unit.status === 'occupied' 
                    ? hasArrears 
                      ? 'bg-red-505 text-white bg-red-500 animate-pulse' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-raised text-secondary'
                }`}>
                  {unit.status}
                </span>
              </h2>
              <p className="text-[10px] text-muted font-mono mt-0.5">
                ID: {unit.id} | Floor: {unit.floor || 'G'} | Type: {unit.unitType || 'Standard'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded hover:bg-raised text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-default overflow-x-auto scrollbar-none bg-raised/50">
          <button
            onClick={() => setInspectTab('info')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              inspectTab === 'info' 
                ? 'border-coral-500 text-coral-500 bg-panel' 
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <Info className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setInspectTab('history')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              inspectTab === 'history' 
                ? 'border-coral-500 text-coral-500 bg-white dark:bg-ink-900' 
                : 'border-transparent text-paper-500 dark:text-ink-400 hover:text-paper-800 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Tenant History
          </button>
          <button
            onClick={() => setInspectTab('invoices')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              inspectTab === 'invoices' 
                ? 'border-coral-500 text-coral-500 bg-white dark:bg-ink-900' 
                : 'border-transparent text-paper-500 dark:text-ink-400 hover:text-paper-800 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Invoices / Ledger
          </button>
          <button
            onClick={() => setInspectTab('tickets')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              inspectTab === 'tickets' 
                ? 'border-coral-500 text-coral-500 bg-white dark:bg-ink-900' 
                : 'border-transparent text-paper-500 dark:text-ink-400 hover:text-paper-800 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Maintenance Tickets
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {actionSuccessMessage && (
            <div className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-xs p-3 rounded-lg flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}
          {actionErrorMessage && (
            <div className="bg-red-500/15 border border-red-500/20 text-red-600 dark:text-red-450 text-xs p-3 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{actionErrorMessage}</span>
            </div>
          )}

          {isLoadingDetails ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-coral-500 animate-spin mb-1.5" />
              <span className="text-[10px] text-paper-400 uppercase tracking-widest">Loading ledger assets...</span>
            </div>
          ) : (
            <>
              {inspectTab === 'info' && (
                <div className="space-y-6">
                  {/* Occupancy Card */}
                  <div className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800/80 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500 mb-3">
                      Occupancy details
                    </h3>
                    {unit.status === 'occupied' && unit.tenantName ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center font-bold text-sm">
                            {unit.tenantName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-paper-950 dark:text-white">
                              {unit.tenantName}
                            </h4>
                            <p className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-coral-500" /> {unit.tenantEmail}
                            </p>
                          </div>
                        </div>
                        
                        {/* Rent Reminders & notice actions */}
                        <div className="pt-4 border-t border-paper-150 dark:border-ink-800/60">
                          <form onSubmit={handleSendEmailNotice} className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-paper-600 dark:text-ink-300">
                              Send Direct Email Notice
                            </h4>
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                placeholder="Notice Subject (e.g. Rent Reminder)" 
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                                required
                                className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white outline-none focus:border-coral-500"
                              />
                              <textarea 
                                placeholder="Write message notice context..." 
                                value={emailForm.message}
                                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                                required
                                rows={3}
                                className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white outline-none focus:border-coral-500"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isActionSubmitting}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-coral-500 hover:bg-coral-600 active:scale-95 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm transition-all"
                            >
                              <Send className="w-3 h-3" /> Send Notice
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <p className="text-xs text-paper-500 dark:text-ink-400 italic font-medium">No tenant currently registered to this unit.</p>
                        <button
                          onClick={onMoveClientClick}
                          className="flex items-center gap-1 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded shadow-md mx-auto transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Move Client Here
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Issue Custom Invoice Form */}
                  {unit.status === 'occupied' && (
                    <div className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800/80 rounded-xl p-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
                        Issue Ad-hoc Custom Invoice
                      </h3>
                      <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Invoice Type</label>
                          <select 
                            value={invoiceForm.type}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, type: e.target.value })}
                            className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white outline-none focus:border-coral-500"
                          >
                            <option value="Utility Fee">Utility Fee</option>
                            <option value="Damage Charge">Damage Charge</option>
                            <option value="Amenity Fee">Amenity Fee</option>
                            <option value="Late Rent Fee">Late Rent Fee</option>
                            <option value="Custom Fee">Custom Fee</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Amount ({propertyCurrency || 'USD'})</label>
                          <input 
                            type="number" 
                            placeholder="0.00" 
                            value={invoiceForm.amount}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                            required
                            min="1"
                            className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white outline-none focus:border-coral-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Description</label>
                          <input 
                            type="text" 
                            placeholder="Specify the fee context..." 
                            value={invoiceForm.description}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                            required
                            className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white outline-none focus:border-coral-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Due Date</label>
                          <input 
                            type="date" 
                            value={invoiceForm.dueDate}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                            className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white outline-none focus:border-coral-500"
                          />
                        </div>

                        <div className="sm:col-span-2 pt-2">
                          <button
                            type="submit"
                            disabled={isActionSubmitting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-coral-500 hover:bg-coral-600 active:scale-95 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Generate Invoice
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {inspectTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
                    Tenant Lease History
                  </h3>
                  
                  {!unitDetails?.leases || unitDetails.leases.length === 0 ? (
                    <p className="text-xs text-paper-500 dark:text-ink-400 italic bg-paper-50 dark:bg-ink-950 p-4 rounded-lg text-center font-medium">
                      No historical lease agreements documented on this unit yet.
                    </p>
                  ) : (
                    <div className="border border-paper-200 dark:border-ink-800 rounded-lg overflow-hidden divide-y divide-paper-100 dark:divide-ink-800">
                      {unitDetails.leases.map(lease => (
                        <div key={lease.id} className="p-4 flex items-center justify-between hover:bg-paper-50/50 dark:hover:bg-ink-950/20 text-xs">
                          <div>
                            <h4 className="font-semibold text-paper-900 dark:text-white">{lease.tenantName}</h4>
                            <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{lease.tenantEmail}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-paper-700 dark:text-ink-300">
                              {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                            </div>
                            <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              lease.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-zinc-100 dark:bg-ink-800 text-paper-500 dark:text-ink-400'
                            }`}>
                              {lease.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {inspectTab === 'invoices' && (
                <div className="space-y-6">
                  {/* Outstanding Ledger List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
                      Recent Invoices & Transactions
                    </h3>
                    
                    {!unitDetails?.invoices || unitDetails.invoices.length === 0 ? (
                      <p className="text-xs text-paper-500 dark:text-ink-400 italic bg-paper-50 dark:bg-ink-950 p-4 rounded-lg text-center font-medium">
                        No invoice records found for this unit.
                      </p>
                    ) : (
                      <div className="border border-paper-200 dark:border-ink-800 rounded-lg overflow-hidden divide-y divide-paper-100 dark:divide-ink-800">
                        {unitDetails.invoices.map(inv => {
                          const outstanding = Math.max(0, inv.amount - (inv.amountPaid || 0));
                          return (
                            <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-paper-950 dark:text-white">
                                    {inv.invoiceNumber}
                                  </span>
                                  <span className="text-[10px] text-paper-500 dark:text-ink-400">
                                    ({inv.type})
                                  </span>
                                </div>
                                <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1">
                                  Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-4 justify-between sm:justify-end">
                                <div className="text-right">
                                  <div className="font-bold text-paper-900 dark:text-white">
                                    {formatMoney(Number(inv.amount), propertyCurrency)}
                                  </div>
                                  {outstanding > 0 && (
                                    <div className="text-[10px] text-red-500 font-medium">
                                      {formatMoney(outstanding, propertyCurrency)} unpaid
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    inv.status === 'PAID' || inv.status === 'RECONCILED'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                      : inv.status === 'PARTIAL'
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                  }`}>
                                    {inv.status}
                                  </span>
                                  
                                  {outstanding > 0 && (
                                    <button
                                      onClick={() => setPaymentLogForm({ invoiceId: inv.id, amount: String(outstanding) })}
                                      className="px-2 py-1 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-750 text-[10px] text-paper-800 dark:text-white border border-paper-250 dark:border-ink-700 rounded font-semibold transition-all"
                                    >
                                      Pay
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Log manual cash/check payment */}
                  {paymentLogForm.invoiceId && (
                    <div className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800/80 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
                          Record Manual Cash Payment
                        </h3>
                        <button onClick={() => setPaymentLogForm({ invoiceId: '', amount: '' })} className="text-xs text-paper-400 hover:underline">
                          Cancel
                        </button>
                      </div>
                      <form onSubmit={handleLogManualPayment} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Payment Amount ({propertyCurrency || 'USD'})</label>
                          <input 
                            type="number" 
                            placeholder="0.00" 
                            value={paymentLogForm.amount}
                            onChange={(e) => setPaymentLogForm({ ...paymentLogForm, amount: e.target.value })}
                            required
                            min="1"
                            className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-950 dark:text-white outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isActionSubmitting}
                          className="px-4 py-1.8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow transition-all"
                        >
                          Submit Payment
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {inspectTab === 'tickets' && (
                <div className="space-y-6">
                  {/* Maintenance Tickets list */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
                      Maintenance Requests History
                    </h3>
                    
                    {!unitDetails?.tickets || unitDetails.tickets.length === 0 ? (
                      <p className="text-xs text-paper-500 dark:text-ink-400 italic bg-paper-50 dark:bg-ink-950 p-4 rounded-lg text-center font-medium">
                        No maintenance request history found for this unit.
                      </p>
                    ) : (
                      <div className="border border-paper-200 dark:border-ink-800 rounded-lg overflow-hidden divide-y divide-paper-100 dark:divide-ink-800">
                        {unitDetails.tickets.map(tkt => (
                          <div key={tkt.id} className="p-4 flex justify-between gap-3 text-xs hover:bg-paper-50/50 dark:hover:bg-ink-950/20">
                            <div>
                              <h4 className="font-semibold text-paper-950 dark:text-white">{tkt.title}</h4>
                              <p className="text-[10px] text-paper-500 dark:text-ink-450 mt-1 max-w-sm leading-normal">
                                {tkt.description}
                              </p>
                              <p className="text-[9px] text-paper-400 dark:text-ink-500 mt-2 font-mono">
                                TKT: {tkt.id} | {new Date(tkt.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right space-y-1.5 shrink-0">
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                                tkt.urgency === 'High' 
                                  ? 'bg-red-500 text-white animate-pulse' 
                                  : tkt.urgency === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-zinc-100 dark:bg-ink-800 text-paper-500 dark:text-ink-400'
                              }`}>
                                {tkt.urgency}
                              </span>
                              <div>
                                <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  tkt.status === 'completed' || tkt.status === 'paid'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                    : tkt.status === 'assigned'
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                }`}>
                                  {tkt.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit maintenance request form */}
                  <div className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800/80 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
                      Log New Maintenance Request
                    </h3>
                    <form onSubmit={handleCreateTicket} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Category</label>
                        <select 
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                          className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white outline-none"
                        >
                          <option value="General">General</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Heating">Heating</option>
                          <option value="Appliances">Appliances</option>
                          <option value="Structural">Structural</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Urgency</label>
                        <select 
                          value={ticketForm.urgency}
                          onChange={(e) => setTicketForm({ ...ticketForm, urgency: e.target.value })}
                          className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white outline-none"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High / Emergency</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Request Title (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="E.g., Clogged kitchen drain" 
                          value={ticketForm.title}
                          onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                          className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-semibold mb-1">Problem Description</label>
                        <textarea 
                          placeholder="Describe the problem context details..." 
                          value={ticketForm.description}
                          onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                          required
                          rows={3}
                          className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-2">
                        <button
                          type="submit"
                          disabled={isActionSubmitting}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-coral-500 hover:bg-coral-600 active:scale-95 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm transition-all"
                        >
                          <Wrench className="w-3.5 h-3.5" /> Submit Request
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
