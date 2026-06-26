import React, { useState } from 'react';
import { X, Building, User, CheckCircle2, DollarSign, Loader2 } from 'lucide-react';
export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  urgency: string;
  category: string;
  status: string;
  tenantId?: string;
  tenantName?: string;
  tenantEmail?: string;
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitLabel?: string;
  amount?: string;
  hourlyRate?: string;
  maxAuthorization?: string;
  contractorId?: string;
  contractorName?: string;
  photoUrl?: string;
  scheduledAt?: string;
  quoteAmount?: string;
  quoteStatus?: string;
  contractorMessage?: string;
  proofPhotoUrl?: string;
  createdAt: string;
}

interface SettleMaintenanceModalProps {
  ticket: MaintenanceTicket;
  onClose: () => void;
  onSettleCompanyExpense: (ticketId: string) => Promise<void>;
  onSettleChargeTenant: (ticketId: string, amount: number) => Promise<void>;
  onSettleWithoutPay: (ticketId: string) => Promise<void>;
}

export default function SettleMaintenanceModal({
  ticket,
  onClose,
  onSettleCompanyExpense,
  onSettleChargeTenant,
  onSettleWithoutPay
}: SettleMaintenanceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasTenant = !!ticket.tenantId;

  const handleAction = async (actionFn: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await actionFn();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
      <div className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-slide-up trans-theme text-left">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Settle Work Order
            </h3>
            <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
              Choose how to process the final payment for #{ticket.id.toUpperCase().substring(0, 8)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-paper-100 dark:bg-ink-800 rounded-full text-paper-500 hover:bg-paper-200 dark:hover:bg-ink-700 trans-subtle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Box */}
        <div className="mb-6 p-4 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-750 rounded-2xl flex justify-between items-center trans-theme">
          <span className="text-xs font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">Total Invoice Amount</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${ticket.amount || '0.00'}</span>
        </div>

        {/* Options */}
        <div className="space-y-3">
          
          {/* Option 1: Company Expense */}
          <button 
            onClick={() => handleAction(() => onSettleCompanyExpense(ticket.id))}
            disabled={isSubmitting}
            className="w-full p-4 border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-850 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 rounded-2xl flex items-center gap-4 group trans-subtle disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-paper-100 dark:bg-ink-800 flex items-center justify-center text-paper-600 dark:text-ink-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 trans-subtle">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-paper-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 trans-subtle">Pay at Company Expense</p>
              <p className="text-[10px] text-paper-500 dark:text-ink-400">Approve payment to contractor from operating accounts.</p>
            </div>
          </button>

          {/* Option 2: Charge Tenant */}
          {hasTenant && (
            <button 
              onClick={() => handleAction(() => onSettleChargeTenant(ticket.id, Number(ticket.amount || 0)))}
              disabled={isSubmitting}
              className="w-full p-4 border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-850 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-2xl flex items-center gap-4 group trans-subtle disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-paper-100 dark:bg-ink-800 flex items-center justify-center text-paper-600 dark:text-ink-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 trans-subtle">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-paper-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 trans-subtle">Pay & Charge Tenant</p>
                <p className="text-[10px] text-paper-500 dark:text-ink-400">Pay contractor, then automatically invoice {ticket.tenantName}.</p>
              </div>
            </button>
          )}

          {/* Option 3: Finalize Without Payout */}
          <button 
            onClick={() => handleAction(() => onSettleWithoutPay(ticket.id))}
            disabled={isSubmitting}
            className="w-full p-4 border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-850 hover:border-paper-300 dark:hover:border-ink-500 rounded-2xl flex items-center gap-4 group trans-subtle disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-paper-100 dark:bg-ink-800 flex items-center justify-center text-paper-600 dark:text-ink-300 trans-subtle">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-paper-900 dark:text-white">Finalize Without Paying</p>
              <p className="text-[10px] text-paper-500 dark:text-ink-400">Mark as completed. Use this if tenant paid directly.</p>
            </div>
          </button>

        </div>
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-paper-50/50 dark:bg-ink-900/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
