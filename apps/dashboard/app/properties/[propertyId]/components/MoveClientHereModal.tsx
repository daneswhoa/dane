'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, UserPlus, Sparkles } from 'lucide-react';

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
  moveInFees?: number | null;
  recurringFees?: number | null;
  moveInFeeDetails?: string | null;
  recurringFeeDetails?: string | null;
}

interface MoveClientHereModalProps {
  targetVacantUnit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MoveClientHereModal({
  targetVacantUnit,
  onClose,
  onSuccess
}: MoveClientHereModalProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Existing roster state
  const [rosterTenants, setRosterTenants] = useState<any[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [selectedRosterTenantId, setSelectedRosterTenantId] = useState('');

  // Form fields for new tenant
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIdNumber, setNewIdNumber] = useState('');
  const [newMoveInDate, setNewMoveInDate] = useState(new Date().toISOString().split('T')[0]);

  // Next of kin details
  const [kinName, setKinName] = useState('');
  const [kinRelation, setKinRelation] = useState('');
  const [kinPhone, setKinPhone] = useState('');

  // Arrears & accordion
  const [newArrears, setNewArrears] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Invoices & Deposit
  const [createInvoices, setCreateInvoices] = useState(true);
  const [waiveDeposit, setWaiveDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(targetVacantUnit.rent.toString());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadRosterTenants() {
      setIsLoadingRoster(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setRosterTenants(data || []);
        }
      } catch (err) {
        console.error('Failed to load tenant roster', err);
      } finally {
        setIsLoadingRoster(false);
      }
    }
    loadRosterTenants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (activeTab === 'existing') {
        if (!selectedRosterTenantId) {
          throw new Error('Please select a tenant.');
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: selectedRosterTenantId,
            unitId: targetVacantUnit.id
          }),
          credentials: 'include'
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to move tenant.');
        }
      } else {
        // Validation
        if (!newName || !newEmail || !newPhone) {
          throw new Error('Full name, email and phone number are required.');
        }

        const kins = (kinName || kinRelation || kinPhone) ? [{
          name: kinName,
          relation: kinRelation,
          phone: kinPhone
        }] : undefined;

        const bodyPayload = {
          unitId: targetVacantUnit.id,
          name: newName,
          email: newEmail,
          phone: newPhone,
          idNumber: newIdNumber || undefined,
          moveInDate: newMoveInDate || undefined,
          arrears: newArrears ? Number(newArrears) : 0,
          kins,
          deposit: waiveDeposit ? 0 : Number(depositAmount || 0),
          createInvoices,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants/add-direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          credentials: 'include'
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to create and assign tenant.');
        }
      }

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-primary">
      <div className="bg-panel border border-default rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-default flex items-center justify-between bg-raised text-primary">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-coral-500" />
              Onboard Tenant to {targetVacantUnit.label}
            </h3>
            <p className="text-[10px] text-secondary mt-0.5">Assign an existing tenant or onboard a brand new client instantly.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-muted hover:text-primary text-base font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-default bg-raised/40">
          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center border-b-2 ${
              activeTab === 'existing'
                ? 'border-coral-500 text-coral-500 bg-panel/50'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Select Existing Tenant
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'new'
                ? 'border-coral-500 text-coral-500 bg-panel/50'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-coral-500" />
            Add New Tenant
          </button>
        </div>

        {/* Scrollable Form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {errorMessage && (
            <div className="bg-red-500/15 border border-red-500/20 text-red-600 dark:text-red-450 text-xs p-3 rounded-lg flex items-start gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'existing' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                  Select Tenant / Client
                </label>
                
                {isLoadingRoster ? (
                  <div className="py-4 flex items-center gap-2 justify-center text-paper-500 dark:text-ink-400">
                    <Loader2 className="w-4 h-4 text-coral-500 animate-spin" />
                    <span className="text-xs">Loading tenant roster...</span>
                  </div>
                ) : rosterTenants.length === 0 ? (
                  <p className="text-xs text-paper-550 dark:text-ink-500 italic py-2">
                    No active tenants found in the roster. Go to the "Add New Tenant" tab to register them.
                  </p>
                ) : (
                  <select
                    value={selectedRosterTenantId}
                    onChange={(e) => setSelectedRosterTenantId(e.target.value)}
                    required
                    className="w-full bg-raised border border-default text-primary rounded px-3 py-2 text-xs outline-none focus:border-coral-500"
                  >
                    <option value="">-- Choose Tenant --</option>
                    {rosterTenants.map((tenant: any) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.email}) {tenant.unitName && tenant.unitName !== 'N/A' ? `[Currently in ${tenant.propertyName} - ${tenant.unitName}]` : '[Unassigned]'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-raised p-3 rounded-lg border border-subtle text-[11px] space-y-1.5 text-secondary">
                <p className="font-semibold text-primary uppercase text-[9px] tracking-wider mb-1">
                  What happens next:
                </p>
                <p className="leading-relaxed">
                  • The selected tenant will be instantly reassigned to <strong>Unit {targetVacantUnit.label}</strong>.
                </p>
                <p className="leading-relaxed">
                  • If the tenant is currently in another unit, their old unit will automatically become <strong>Vacant</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-3 py-2 text-xs outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-3 py-2 text-xs outline-none focus:border-coral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+31 6 12345678"
                    className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-3 py-2 text-xs outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                    Govt ID / BSN
                  </label>
                  <input
                    type="text"
                    value={newIdNumber}
                    onChange={(e) => setNewIdNumber(e.target.value)}
                    placeholder="ID Number"
                    className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-3 py-2 text-xs outline-none focus:border-coral-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                  Move-In Date
                </label>
                <input
                  type="date"
                  value={newMoveInDate}
                  onChange={(e) => setNewMoveInDate(e.target.value)}
                  className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-3 py-2 text-xs outline-none focus:border-coral-500"
                />
              </div>

              {/* Next of Kin (Emergency Contact) */}
              <div className="border-t border-paper-150 dark:border-ink-800 pt-3">
                <span className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider mb-2">
                  Next of Kin (Emergency Contact)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={kinName}
                      onChange={(e) => setKinName(e.target.value)}
                      placeholder="Kin Name"
                      className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-coral-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={kinRelation}
                      onChange={(e) => setKinRelation(e.target.value)}
                      placeholder="Relation (e.g. Spouse)"
                      className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-coral-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="tel"
                      value={kinPhone}
                      onChange={(e) => setKinPhone(e.target.value)}
                      placeholder="Kin Phone"
                      className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-coral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Invoices Setup */}
              <div className="border-t border-paper-150 dark:border-ink-800 pt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createInvoices"
                    checked={createInvoices}
                    onChange={(e) => setCreateInvoices(e.target.checked)}
                    className="rounded border-paper-300 dark:border-ink-700 text-coral-500 focus:ring-coral-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="createInvoices" className="text-xs font-semibold text-paper-700 dark:text-ink-250 cursor-pointer">
                    Generate move-in invoices (Rent, Deposit)
                  </label>
                </div>

                {createInvoices && (
                  <div className="bg-paper-50 dark:bg-ink-950 p-3 rounded-lg border border-paper-150 dark:border-ink-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-paper-500 dark:text-ink-400">First Month's Rent Invoice:</span>
                      <span className="font-bold text-paper-900 dark:text-white">${targetVacantUnit.rent}</span>
                    </div>

                    <div className="space-y-2 border-t border-paper-150 dark:border-ink-800/50 pt-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-paper-500 dark:text-ink-400">Security Deposit Invoice:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id="waiveDeposit"
                            checked={waiveDeposit}
                            onChange={(e) => setWaiveDeposit(e.target.checked)}
                            className="rounded border-paper-300 dark:border-ink-700 text-coral-500 focus:ring-coral-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <label htmlFor="waiveDeposit" className="text-xs font-medium text-paper-600 dark:text-ink-300 cursor-pointer">
                            Waived
                          </label>
                        </div>
                      </div>

                      {!waiveDeposit && (
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-paper-400 dark:text-ink-500">$</span>
                          <input
                            type="number"
                            min="0"
                            required={!waiveDeposit}
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Deposit amount"
                            className="w-full bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded pl-6 pr-3 py-1.5 text-xs outline-none focus:border-coral-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Auto Move-in Fees */}
                    {(() => {
                      let parsedFees: Array<{ name: string; amount: number }> = [];
                      if (targetVacantUnit.moveInFeeDetails) {
                        try {
                          parsedFees = JSON.parse(targetVacantUnit.moveInFeeDetails);
                        } catch (e) {}
                      }
                      if (parsedFees.length > 0) {
                        return parsedFees.map((fee, idx) => (
                          <div key={`move-in-${idx}`} className="flex items-center justify-between text-xs border-t border-paper-150 dark:border-ink-800/50 pt-2.5">
                            <span className="text-paper-500 dark:text-ink-400">{fee.name || 'Move-in Fee'}:</span>
                            <span className="font-bold text-paper-900 dark:text-white">${fee.amount}</span>
                          </div>
                        ));
                      } else if (Number(targetVacantUnit.moveInFees || 0) > 0) {
                        return (
                          <div className="flex items-center justify-between text-xs border-t border-paper-150 dark:border-ink-800/50 pt-2.5">
                            <span className="text-paper-500 dark:text-ink-400">Move-in Fees:</span>
                            <span className="font-bold text-paper-900 dark:text-white">${targetVacantUnit.moveInFees}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Auto Recurring Fees */}
                    {(() => {
                      let parsedFees: Array<{ name: string; amount: number }> = [];
                      if (targetVacantUnit.recurringFeeDetails) {
                        try {
                          parsedFees = JSON.parse(targetVacantUnit.recurringFeeDetails);
                        } catch (e) {}
                      }
                      if (parsedFees.length > 0) {
                        return parsedFees.map((fee, idx) => (
                          <div key={`recurring-${idx}`} className="flex items-center justify-between text-xs border-t border-paper-150 dark:border-ink-800/50 pt-2.5">
                            <span className="text-paper-500 dark:text-ink-400">{fee.name || 'Recurring Fee'}:</span>
                            <span className="font-bold text-paper-900 dark:text-white">${fee.amount} (Monthly)</span>
                          </div>
                        ));
                      } else if (Number(targetVacantUnit.recurringFees || 0) > 0) {
                        return (
                          <div className="flex items-center justify-between text-xs border-t border-paper-150 dark:border-ink-800/50 pt-2.5">
                            <span className="text-paper-500 dark:text-ink-400">Recurring Fees:</span>
                            <span className="font-bold text-paper-900 dark:text-white">${targetVacantUnit.recurringFees} (Monthly)</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Optional/Advanced Accordion for Arrears */}
              <div className="border-t border-paper-150 dark:border-ink-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider hover:text-coral-500 transition-colors"
                >
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced (Import Arrears)</span>
                  <span>{showAdvanced ? '▲' : '▼'}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-1.5 animate-slide-down">
                    <label className="block text-[10px] text-paper-500 dark:text-ink-400 uppercase font-bold tracking-wider">
                      Initial Arrears (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-paper-400 dark:text-ink-500">$</span>
                      <input
                        type="number"
                        min="0"
                        value={newArrears}
                        onChange={(e) => setNewArrears(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-950 dark:text-white rounded pl-6 pr-3 py-1.5 text-xs outline-none focus:border-coral-500"
                      />
                    </div>
                    <p className="text-[9px] text-paper-400 dark:text-ink-500 leading-normal">
                      Specify if this tenant has a preexisting arrears balance to import. This will generate an unpaid "Arrears" type invoice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-raised hover:bg-panel text-primary text-xs font-semibold rounded border border-default transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (activeTab === 'existing' && !selectedRosterTenantId)}
              className="px-4 py-2 bg-coral-500 hover:bg-coral-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded shadow-md transition-all flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {activeTab === 'existing' ? 'Move Client' : 'Onboard Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
