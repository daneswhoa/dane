'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import {
  ArrowLeft, Calendar, DollarSign, Mail, Phone, ShieldCheck,
  User, UserCheck, AlertTriangle, FileText, Landmark, Clock, 
  ArrowRightLeft, BadgeAlert, BadgeCheck, BadgeHelp, Wrench, Info, Plus
} from 'lucide-react';
import { MoveTenantModal } from '../../components/tenants/MoveTenantModal';

interface KinDetail {
  name: string;
  phone: string;
  relation: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  urgency: string;
  createdAt: string;
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
  currency?: string;
  tickets?: Ticket[];
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
  const [activeTab, setActiveTab] = useState<'lease' | 'ledger' | 'maintenance'>('lease');

  const formatMoney = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return `${currency || '$'} ${amount}`;
    }
  };

  async function loadTenantDetails() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenant/profile?userId=${params.id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Handle both direct object response and wrapped { success, profile } response
        const profile = data.profile || (data.id ? data : null);
        if (profile) {
          setTenant(profile);
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coral-500"></div>
          <p className="text-secondary text-xs">Fetching resident dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  const initials = tenant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasArrears = tenant.arrears > 0;
  const isLeaseActive = tenant.leaseEnd ? new Date(tenant.leaseEnd) > new Date() : true;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in text-sm text-primary">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/tenants')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-default hover:bg-raised rounded-lg text-xs font-semibold text-secondary transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
          </button>
          
          <button
            onClick={() => setIsMoveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-coral-500 hover:bg-coral-600 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Move Tenant</span>
          </button>
        </div>

        {/* Tenant Header Dossier Card */}
        <div className="bg-panel border border-default rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-coral-500/10 border border-coral-500/20 flex items-center justify-center font-bold text-coral-500 text-xl tracking-wider">
                {initials}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-primary">{tenant.name}</h1>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isLeaseActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {isLeaseActive ? 'Active Lease' : 'Lease Expired'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    hasArrears ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {hasArrears ? `Arrears Ledger` : 'Good Standing'}
                  </span>
                </div>
                
                {tenant.unitId ? (
                  <p className="text-xs text-secondary font-medium">
                    {tenant.propertyName || 'Residential property'} • {tenant.unitName || `Unit ${tenant.unitId}`} (Floor {tenant.floor || 'G'})
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-500/5 px-2.5 py-1 rounded">
                    <AlertTriangle className="w-3.5 h-3.5" /> Unassigned Unit (Vacant/Transit Roster)
                  </div>
                )}
              </div>
            </div>

            {/* Quick Balance Metrics */}
            <div className="flex gap-4 md:gap-8 flex-wrap pt-4 md:pt-0 border-t border-subtle md:border-t-0 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Arrears Balance</span>
                <span className={`text-lg font-bold mt-0.5 ${hasArrears ? 'text-red-500 animate-pulse font-extrabold' : 'text-emerald-500'}`}>
                  {formatMoney(tenant.arrears || 0, tenant.currency)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Monthly Base Rent</span>
                <span className="text-lg font-bold text-primary mt-0.5">
                  {formatMoney(tenant.rent || 0, tenant.currency)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Security Deposit</span>
                <span className="text-lg font-bold text-primary mt-0.5">
                  {tenant.deposit === 0 ? 'Waived' : formatMoney(tenant.deposit || 0, tenant.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-default space-x-4">
          <button
            onClick={() => setActiveTab('lease')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'lease'
                ? 'border-coral-500 text-coral-500'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Lease & Personal Dossier
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-coral-500 text-coral-500'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <FileText className="w-4 h-4" /> Ledger & Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-coral-500 text-coral-500'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <Wrench className="w-4 h-4" /> Maintenance Log ({tenant.tickets?.length || 0})
          </button>
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === 'lease' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Lease Specifications */}
            <div className="lg:col-span-7 bg-panel border border-default rounded-xl p-5 space-y-4">
              <h2 className="text-xs uppercase font-extrabold text-primary tracking-wider border-b border-subtle pb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-coral-500" /> Lease & Rental Agreement
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-raised p-3.5 rounded-lg border border-subtle space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Lease Duration</span>
                  <p className="font-semibold text-xs text-primary">
                    {tenant.leaseStart || 'N/A'} — {tenant.leaseEnd || 'Present'}
                  </p>
                </div>

                <div className="bg-raised p-3.5 rounded-lg border border-subtle space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Unit Type class</span>
                  <p className="font-semibold text-xs text-primary capitalize">
                    {tenant.unitType || 'Standard Residential'}
                  </p>
                </div>

                <div className="bg-raised p-3.5 rounded-lg border border-subtle space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">One-time Move-in Cost</span>
                  <p className="font-semibold text-xs text-primary">
                    {formatMoney(tenant.moveInFees || 0, tenant.currency)}
                  </p>
                </div>

                <div className="bg-raised p-3.5 rounded-lg border border-subtle space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Recurring Monthly Charges</span>
                  <p className="font-semibold text-xs text-primary">
                    {formatMoney(tenant.recurringFees || 0, tenant.currency)}/mo
                  </p>
                </div>
              </div>

              {/* Warnings & Notices */}
              {hasArrears && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3.5 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-xs">Arrears Flag Detected</span>
                    <p className="text-[11px] leading-relaxed text-red-400">
                      The current tenant ledger registers an unpaid deficit of {formatMoney(tenant.arrears, tenant.currency)}. Custom billing notices can be triggered under the ledger panel.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Dossier & Contacts */}
            <div className="lg:col-span-5 bg-panel border border-default rounded-xl p-5 space-y-4">
              <h2 className="text-xs uppercase font-extrabold text-primary tracking-wider border-b border-subtle pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-coral-500" /> Identity & Contact Profile
              </h2>
              
              <div className="space-y-3.5">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-raised flex items-center justify-center text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted uppercase font-bold block tracking-wider">Email Address</span>
                    <a href={`mailto:${tenant.email}`} className="font-medium text-xs text-primary hover:underline hover:text-coral-500">
                      {tenant.email}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-raised flex items-center justify-center text-muted">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted uppercase font-bold block tracking-wider">Phone Number</span>
                    <a href={`tel:${tenant.phone}`} className="font-medium text-xs text-primary hover:underline hover:text-coral-500">
                      {tenant.phone || 'No phone registered'}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-raised flex items-center justify-center text-muted">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted uppercase font-bold block tracking-wider">Government ID / Passport</span>
                    <span className="font-semibold text-xs text-primary">
                      {tenant.idNumber || 'Not verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts / Next of Kin */}
              <div className="mt-4 pt-4 border-t border-subtle space-y-3">
                <span className="text-[10px] text-muted uppercase tracking-wider font-extrabold block">Emergency Contact & Next of Kin</span>
                {tenant.kins && tenant.kins.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {tenant.kins.map((k, idx) => (
                      <div key={idx} className="bg-raised p-3 rounded-lg border border-default flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-primary block">{k.name}</span>
                          <span className="text-[10px] text-muted capitalize">{k.relation || 'Emergency Contact'}</span>
                        </div>
                        <a href={`tel:${k.phone}`} className="text-coral-500 hover:underline font-bold text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {k.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted italic bg-raised p-3 rounded-lg text-center border border-dashed border-default">
                    No emergency contact registered.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Ledger & Invoice history */}
        {activeTab === 'ledger' && (
          <div className="bg-panel border border-default rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-2 flex-wrap gap-2">
              <h2 className="text-xs uppercase font-extrabold text-primary tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-coral-500" /> Invoice History & Payment Ledger
              </h2>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <FileText className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs text-secondary italic">No billing history registered for this resident.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-default rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-raised border-b border-default text-muted uppercase font-bold text-[9px] tracking-wider">
                      <th className="p-3.5">Invoice Ref</th>
                      <th className="p-3.5">Billing Type</th>
                      <th className="p-3.5">Issue Date</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
                    {invoices.map((inv) => (
                      <tr 
                        key={inv.id}
                        onClick={() => router.push(`/finance/invoices/${inv.id}`)}
                        className="hover:bg-raised/40 cursor-pointer transition-colors duration-150"
                      >
                        <td className="p-3.5 font-bold text-coral-500">{inv.invoiceNumber}</td>
                        <td className="p-3.5 capitalize font-medium">{inv.type.toLowerCase()}</td>
                        <td className="p-3.5 text-secondary">{inv.issueDate || 'N/A'}</td>
                        <td className="p-3.5 text-secondary">{inv.dueDate || 'N/A'}</td>
                        <td className="p-3.5 text-right font-bold">{formatMoney(inv.amount, tenant.currency)}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : inv.status === 'OVERDUE'
                              ? 'bg-red-500/10 text-red-500 animate-pulse'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Maintenance Log Tab */}
        {activeTab === 'maintenance' && (
          <div className="bg-panel border border-default rounded-xl p-5 space-y-4">
            <h2 className="text-xs uppercase font-extrabold text-primary tracking-wider border-b border-subtle pb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-coral-500" /> Resident Maintenance Logs
            </h2>

            {!tenant.tickets || tenant.tickets.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Wrench className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs text-secondary italic">No active maintenance workorders or issues reported by this tenant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenant.tickets.map((t) => (
                  <div key={t.id} className="bg-raised p-4 rounded-xl border border-default hover:border-coral-500/35 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-xs text-primary">{t.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          t.status === 'completed' || t.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : t.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary mt-1.5 leading-relaxed truncate-3-lines">{t.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-subtle text-[10px] text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Filed {t.createdAt ? t.createdAt.split('T')[0] : 'Recently'}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        t.urgency === 'high' || t.urgency === 'critical'
                          ? 'text-red-500 bg-red-500/10 animate-pulse'
                          : 'text-amber-500 bg-amber-500/10'
                      }`}>
                        {t.urgency} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {isMoveModalOpen && (
        <MoveTenantModal
          tenantId={tenant.id}
          tenantName={tenant.name}
          currentUnitLabel={tenant.unitName || tenant.unitId || 'N/A'}
          currentPropertyName={tenant.propertyName || 'Residential Roster'}
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
