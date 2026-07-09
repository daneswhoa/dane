import React, { useState } from 'react';
import { 
  X, Settings, Building, MapPin, ShieldAlert, Shield, FileText, AlertTriangle, 
  Ban, Trash2, ChevronDown, AlertCircle, Briefcase, User, Percent, DollarSign,
  TrendingUp, Users, Calendar, Wrench, Lock, CheckCircle
} from 'lucide-react';

export interface PropUnit {
  id: string;
  status: 'Occupied' | 'Vacant';
  monthlyRent: number;
  beds: number;
  baths: number;
  tenantName?: string;
}

export interface PropTenant {
  name: string;
  unit: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
  status: 'Active' | 'Delinquent';
}

export interface PropInvoice {
  id: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

export interface Property {
  id: string;
  name: string;
  owner: string;
  address: string;
  country: string;
  state: string;
  assetType: 'Apartment' | 'House' | 'Commercial' | 'Townhouse';
  yearBuilt: number;
  sqft: number;
  warningStatus: 'Clean' | 'Flagged' | 'Auditing';
  cover: string;
  units: Array<PropUnit>;
  tenants: Array<PropTenant>;
  invoices: Array<PropInvoice>;
  monthlyRevenue: number;
  securityDeposits: number;
}

interface PropertyManagerModalProps {
  property: Property;
  onClose: () => void;
  onSuspendSyndication: (propertyId: string) => void;
  onDeleteProperty: (propertyId: string) => void;
}

export default function PropertyManagerModal({
  property,
  onClose,
  onSuspendSyndication,
  onDeleteProperty
}: PropertyManagerModalProps) {
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'units' | 'tenants' | 'finance'>('profile');

  // Confirmation overlay states
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={() => {
          if (!showSuspendConfirm && !showDeleteConfirm) onClose();
        }}
        className="absolute inset-0 bg-black/35 dark:bg-black/65 dark:backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Body */}
      <div className="relative bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col z-10 animate-fade-in trans-theme max-h-[90vh]">
        
        {/* Cover Gradient Header */}
        <div className="h-24 bg-gradient-to-r from-coral-500 to-coral-600 flex items-end justify-between p-6 shrink-0 relative">
          <div className="flex items-center gap-3 text-white z-10">
            <Building className="w-8 h-8 animate-pulse-slow" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Property Control Center</span>
              <span className="text-lg font-black block mt-0.5 leading-tight">{property.name}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/10 hover:bg-black/25 text-white backdrop-blur-sm transition-colors absolute top-4 right-4"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/60 px-6 shrink-0 trans-theme">
          {[
            { id: 'profile', label: 'Asset Profile', icon: Building },
            { id: 'units', label: `Units Inventory (${property.units.length})`, icon: Settings },
            { id: 'tenants', label: `Tenants (${property.tenants.length})`, icon: Users },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign }
          ].map(tab => {
            const isActive = activeModalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModalTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all relative ${
                  isActive 
                    ? 'text-coral-500 border-b-2 border-coral-500' 
                    : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Content Context */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: ASSET PROFILE */}
          {activeModalTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <img src={property.cover} alt={property.name} className="w-full md:w-64 h-36 rounded-2xl object-cover border border-paper-200 dark:border-ink-800 shadow-sm" />
                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-bold text-paper-900 dark:text-white">Registered Address</h4>
                  <p className="text-xs text-paper-600 dark:text-ink-300 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-coral-500" /> {property.address}, {property.state}, {property.country}</p>
                  
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase block">Registered Corporate Owner</span>
                    <span className="text-xs font-bold text-paper-800 dark:text-white flex items-center gap-1 mt-1"><Briefcase className="w-4 h-4 text-purple-500" /> {property.owner}</span>
                  </div>
                </div>
              </div>

              {/* Specific Property Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Asset Type</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1">{property.assetType}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Year Built</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1">{property.yearBuilt}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Total Space</p>
                  <p className="text-xs font-bold text-paper-900 dark:text-white mt-1">{property.sqft.toLocaleString()} Sq Ft</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase">Compliance Status</p>
                  <p className={`text-xs font-bold mt-1 ${
                    property.warningStatus === 'Clean' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : property.warningStatus === 'Flagged'
                      ? 'text-red-500'
                      : 'text-amber-500'
                  }`}>
                    {property.warningStatus}
                  </p>
                </div>
              </div>

              {/* Moderate Actions */}
              <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200/50 dark:border-red-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Ecosystem Policy Actions</h4>
                </div>
                <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                  Platform moderators can restrict listing syndication for properties under investigation for lease violations or fraudulent descriptions.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => setShowSuspendConfirm(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" /> Block Vacancy Syndication
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Property from Directory
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNITS INVENTORY */}
          {activeModalTab === 'units' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Registered Units Inventory</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Ecosystem Registry ({property.units.length} Units)</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-2.5">Unit Name / ID</th>
                        <th className="px-4 py-2.5">Beds / Baths</th>
                        <th className="px-4 py-2.5">Monthly Rent</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Registered Tenant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {property.units.map((unit) => (
                        <tr key={unit.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3 font-bold text-paper-900 dark:text-white">{unit.id}</td>
                          <td className="px-4 py-3 text-paper-600 dark:text-ink-300">{unit.beds} Bed • {unit.baths} Bath</td>
                          <td className="px-4 py-3 font-mono font-semibold text-paper-800 dark:text-ink-150">${unit.monthlyRent.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {unit.status === 'Occupied' ? (
                              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase rounded-full">Occupied</span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase rounded-full">Vacant</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-paper-700 dark:text-ink-200 font-bold">
                            {unit.tenantName || <span className="text-paper-400 dark:text-ink-600 font-normal">None</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TENANTS DIRECTORY */}
          {activeModalTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Active Leases & Tenants</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Lease Registry</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-2.5">Tenant Name</th>
                        <th className="px-4 py-2.5">Unit</th>
                        <th className="px-4 py-2.5">Contact Detail</th>
                        <th className="px-4 py-2.5">Lease Duration</th>
                        <th className="px-4 py-2.5 text-right">Lease Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {property.tenants.map((t, idx) => (
                        <tr key={idx} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3 font-bold text-paper-900 dark:text-white">{t.name}</td>
                          <td className="px-4 py-3 font-bold text-coral-500">{t.unit}</td>
                          <td className="px-4 py-3">
                            <span className="block text-paper-800 dark:text-ink-150">{t.email}</span>
                            <span className="block text-[10px] text-paper-400 mt-0.5">{t.phone}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px]">
                            {t.leaseStart} to {t.leaseEnd}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {t.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px] rounded">Active Lease</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase text-[9px] rounded">Delinquent Ledger</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {property.tenants.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-paper-400 dark:text-ink-500">
                            No active tenant leases listed on this property.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCE LEDGER */}
          {activeModalTab === 'finance' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Finance & Ledger Overview</h4>
                <span className="text-[10px] font-mono text-paper-500 dark:text-ink-400 uppercase">Ecosystem Rent Statements</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200/60 dark:border-ink-800/80 space-y-2">
                  <h5 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Revenue & Security Deposit Holds</h5>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-paper-600 dark:text-ink-300">Monthly Est. Gross Revenue</span>
                      <strong className="text-paper-950 dark:text-white font-mono">${property.monthlyRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-600 dark:text-ink-300">Held Security Deposits</span>
                      <strong className="text-paper-950 dark:text-white font-mono">${property.securityDeposits.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200/60 dark:border-ink-800/80 space-y-2 flex flex-col justify-center">
                  <h5 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Revenue Compliance</h5>
                  <p className="text-xs text-paper-600 dark:text-ink-300 mt-1 leading-relaxed">
                    Financial records match verified tenancy lease ledgers. No reporting discrepancies identified.
                  </p>
                </div>
              </div>

              {/* Invoices */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Invoices History Log</h5>
                <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">
                        <th className="px-4 py-2">Invoice Code</th>
                        <th className="px-4 py-2">Month</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2 text-right">Ledger Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {property.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-2.5 font-bold font-mono text-paper-900 dark:text-white">{inv.id}</td>
                          <td className="px-4 py-2.5 text-paper-600 dark:text-ink-300">{inv.month}</td>
                          <td className="px-4 py-2.5 font-semibold font-mono">${inv.amount.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">
                            {inv.status === 'Paid' ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px] rounded">Paid</span>
                            ) : inv.status === 'Unpaid' ? (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase text-[9px] rounded">Unpaid</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 font-bold uppercase text-[9px] rounded">Overdue</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-paper-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/40 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-paper-200 hover:bg-paper-300 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-100 text-xs font-bold rounded-lg trans-subtle"
          >
            Close
          </button>
        </div>

        {/* SUSPEND CONFIRMATION OVERLAY */}
        {showSuspendConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/75 dark:backdrop-blur-sm p-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-fade-in trans-theme">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h5 className="font-bold text-sm">Deactivate Listing Syndication</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Are you sure you want to deactivate vacancy listing syndication for <strong>{property.name}</strong>? This blocks vacant units from appearing on public listing channels.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  onClick={() => setShowSuspendConfirm(false)}
                  className="px-3.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onSuspendSyndication(property.id);
                    setShowSuspendConfirm(false);
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Deactivate Syndication
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION OVERLAY */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/75 dark:backdrop-blur-sm p-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-fade-in trans-theme">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h5 className="font-bold text-sm">Remove Property Record</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Are you sure you want to permanently delete <strong>{property.name}</strong> from the ecosystem registry? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onDeleteProperty(property.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-750 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
