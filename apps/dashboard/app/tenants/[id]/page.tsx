'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import {
  ArrowLeft, Calendar, DollarSign, Mail, Phone, ShieldCheck,
  User, UserCheck, AlertTriangle, FileText, Landmark, Clock, ArrowRightLeft
} from 'lucide-react';
import { MoveTenantModal } from '../../components/tenants/MoveTenantModal';

interface KinDetail {
  name: string;
  phone: string;
  relation: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  propertyName: string;
  propertyAddress: string;
  unitId: string;
  unitName: string;
  floor: string;
  unitType: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  recurringFees: number;
  arrears: number;
  status: string;
  leaseStart: string;
  leaseEnd: string;
  kins?: KinDetail[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  amount: number;
  type: string;
  status: string;
  issueDate: string;
  dueDate: string;
  description: string;
}

export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  async function loadTenantDetails() {
    try {
      const res = await fetch(`http://localhost:4000/api/dashboard/tenant/profile?userId=${params.id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setTenant(data.profile);
          return;
        }
      }
    } catch (e) {
      console.warn('API error, falling back to localStorage');
    }

    // Fallback to localStorage
    const tenantsStr = localStorage.getItem('landlordnl_tenants_list');
    if (tenantsStr) {
      try {
        const list: Tenant[] = JSON.parse(tenantsStr);
        const found = list.find((t) => t.id === params.id);
        if (found) setTenant(found);
      } catch (e) {}
    }
  }

  useEffect(() => {
    if (params.id) {
      loadTenantDetails();
    }

    const invoicesStr = localStorage.getItem('landlordnl_invoices_list');
    if (invoicesStr) {
      try {
        const list: Invoice[] = JSON.parse(invoicesStr);
        setInvoices(list.filter((inv) => inv.tenantId === params.id));
      } catch (e) {}
    }
  }, [params.id]);

  if (!tenant) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-paper-400">Loading resident details...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full animate-fade-in text-sm">
        <button
          onClick={() => router.push('/tenants')}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-paper-200 dark:border-ink-800 hover:bg-paper-100 dark:hover:bg-ink-900 rounded-lg text-xs font-semibold text-paper-700 dark:text-ink-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        {/* Tenant Header card */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-coral-500/10 border border-coral-500/30 flex items-center justify-center font-bold text-coral-500 text-lg">
              {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">{tenant.name}</h1>
              <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">{tenant.propertyName} — Unit {tenant.unitId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsMoveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-ink-900 border border-paper-250 dark:border-ink-700 text-paper-700 dark:text-ink-200 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-xs font-bold transition-all shadow-sm"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-coral-500" />
              <span>Move Tenant</span>
            </button>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
              tenant.arrears > 0
                ? 'bg-coral-500/10 border-coral-500/30 text-coral-500'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}>
              {tenant.arrears > 0 ? 'DELINQUENT LEDGER' : 'GOOD STANDING'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Details block */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-coral-500" /> Lease & Pricing Agreement
              </h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-paper-400 block font-semibold">Lease Term</span>
                  <span className="font-semibold text-paper-800 dark:text-white">{tenant.leaseStart} to {tenant.leaseEnd}</span>
                </div>
                <div>
                  <span className="text-[10px] text-paper-400 block font-semibold">Unit Type Class</span>
                  <span className="font-semibold text-paper-800 dark:text-white">{tenant.unitType || 'Residential'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-paper-400 block font-semibold">Base Rent</span>
                  <span className="font-semibold text-paper-800 dark:text-white">${tenant.rent.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-paper-400 block font-semibold">Security Deposit</span>
                  <span className="font-semibold text-paper-800 dark:text-white">${tenant.deposit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-paper-400 block font-semibold">Total Move-in Costs</span>
                  <span className="font-semibold text-paper-800 dark:text-white">${tenant.moveInFees.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-paper-400 block font-semibold">Total Monthly Cost</span>
                  <span className="font-semibold text-paper-800 dark:text-white">${tenant.recurringFees.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Contacts & Kin info */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-coral-500" /> Personal Identity & Contacts
              </h2>
              <div className="space-y-3">
                <div className="flex gap-4 items-center">
                  <Mail className="w-4 h-4 text-paper-400" />
                  <div>
                    <span className="text-[9px] text-paper-400 block font-semibold">Email Address</span>
                    <span className="font-medium text-paper-850 dark:text-white">{tenant.email}</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <Phone className="w-4 h-4 text-paper-400" />
                  <div>
                    <span className="text-[9px] text-paper-400 block font-semibold">Phone Number</span>
                    <span className="font-medium text-paper-850 dark:text-white">{tenant.phone}</span>
                  </div>
                </div>
                {tenant.idNumber && (
                  <div className="flex gap-4 items-center">
                    <Landmark className="w-4 h-4 text-paper-400" />
                    <div>
                      <span className="text-[9px] text-paper-400 block font-semibold">Government ID / Passport</span>
                      <span className="font-medium text-paper-850 dark:text-white">{tenant.idNumber}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Kin Details */}
              {tenant.kins && tenant.kins.length > 0 && (
                <div className="mt-4 pt-4 border-t border-paper-150 dark:border-ink-700 space-y-2">
                  <span className="text-[10px] text-paper-400 uppercase tracking-wider font-bold block">Kin & Emergency Contacts</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tenant.kins.map((k, idx) => (
                      <div key={idx} className="bg-paper-50 dark:bg-ink-950 p-2.5 rounded-lg border border-paper-200 dark:border-ink-800">
                        <span className="font-bold text-paper-800 dark:text-white block text-[11px]">{k.name}</span>
                        <span className="text-[10px] text-paper-400">{k.relation} — {k.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Ledger Invoice history */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-coral-500" /> Invoice History & Ledger
              </h2>

              {tenant.arrears > 0 && (
                <div className="bg-coral-500/10 border border-coral-500/20 text-coral-500 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] leading-relaxed">
                    This account is marked as overdue with an outstanding balance of <strong>${tenant.arrears.toLocaleString()}</strong>. Unpaid invoices are flagged below.
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {invoices.length === 0 ? (
                  <p className="text-[11px] text-paper-400 text-center py-6">No historical invoice receipts registered for this resident.</p>
                ) : (
                  invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => router.push(`/finance/invoices/${inv.id}`)}
                      className="bg-paper-50 dark:bg-ink-900/40 border border-paper-200 dark:border-ink-850 hover:border-coral-500/50 rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-paper-800 dark:text-white text-[11px] block">{inv.type} — {inv.invoiceNumber}</span>
                        <span className="text-[9px] text-paper-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due {inv.dueDate}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-bold text-paper-900 dark:text-white block">${inv.amount.toLocaleString()}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          inv.status === 'OVERDUE'
                            ? 'bg-coral-500/15 text-coral-500'
                            : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMoveModalOpen && (
        <MoveTenantModal
          tenantId={tenant.id}
          tenantName={tenant.name}
          currentUnitLabel={tenant.unitId}
          currentPropertyName={tenant.propertyName}
          onClose={() => setIsMoveModalOpen(false)}
          onSuccess={() => {
            setIsMoveModalOpen(false);
            loadTenantDetails();
          }}
        />
      )}
    </DashboardLayout>
  );
}
