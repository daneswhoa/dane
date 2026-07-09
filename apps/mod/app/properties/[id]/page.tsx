'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModLayout from '../../components/ModLayout';
import { 
  ArrowLeft, Building, MapPin, Compass, Briefcase, Calendar, Wrench, Shield, ShieldAlert, ShieldCheck,
  Settings, Users, DollarSign, Ban, Trash2, AlertTriangle, AlertCircle, CheckCircle, Check
} from 'lucide-react';

const PROPERTIES_DATA: Record<string, any> = {
  lumina: {
    id: 'lumina',
    name: 'The Lumina',
    owner: 'Westside Realty Group',
    address: '102 Peponi Road, Westlands',
    county: 'Nairobi',
    subcounty: 'Westlands',
    assetType: 'Multi-Family',
    yearBuilt: 2018,
    sqft: 28000,
    warningStatus: 'Clean',
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60',
    monthlyRevenue: 850000,
    securityDeposits: 1200000,
    units: [
      { id: 'Suite 101', status: 'Occupied', monthlyRent: 75000, beds: 2, baths: 2, tenantName: 'Sarah Jenkins' },
      { id: 'Suite 102', status: 'Occupied', monthlyRent: 85000, beds: 3, baths: 2, tenantName: 'Robert Vance' },
      { id: 'Suite 201', status: 'Vacant', monthlyRent: 65000, beds: 1, baths: 1 }
    ],
    tenants: [
      { name: 'Sarah Jenkins', unit: 'Suite 101', email: 'sarah.j@gmail.com', phone: '(254) 712-345678', leaseStart: '2025-01-01', leaseEnd: '2026-01-01', status: 'Active' },
      { name: 'Robert Vance', unit: 'Suite 102', email: 'vance@refrigeration.com', phone: '(254) 723-889900', leaseStart: '2024-06-15', leaseEnd: '2026-06-15', status: 'Active' }
    ],
    invoices: [
      { id: 'INV-2041', month: 'June 2026', amount: 160000, status: 'Paid' },
      { id: 'INV-1901', month: 'May 2026', amount: 160000, status: 'Paid' }
    ]
  },
  westside: {
    id: 'westside',
    name: 'Westside Lofts',
    owner: 'Riverview Management',
    address: '44 Southern Bypass',
    county: 'Kiambu',
    subcounty: 'Kikuyu',
    assetType: 'Apartment',
    yearBuilt: 2020,
    sqft: 14500,
    warningStatus: 'Flagged',
    cover: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&auto=format&fit=crop&q=60',
    monthlyRevenue: 285000,
    securityDeposits: 450000,
    units: [
      { id: 'Unit A1', status: 'Occupied', monthlyRent: 45000, beds: 2, baths: 1, tenantName: 'Alice Cooper' },
      { id: 'Unit A2', status: 'Vacant', monthlyRent: 45000, beds: 2, baths: 1 }
    ],
    tenants: [
      { name: 'Alice Cooper', unit: 'Unit A1', email: 'alice@cooper.org', phone: '(254) 734-909090', leaseStart: '2025-03-01', leaseEnd: '2026-03-01', status: 'Delinquent' }
    ],
    invoices: [
      { id: 'INV-2849', month: 'June 2026', amount: 45000, status: 'Unpaid' },
      { id: 'INV-2712', month: 'May 2026', amount: 45000, status: 'Overdue' }
    ]
  },
  riverside: {
    id: 'riverside',
    name: 'Riverside Complex',
    owner: 'Summit Properties LLC',
    address: 'Chady Road, Syokimau',
    county: 'Machakos',
    subcounty: 'Mavoko (Syokimau/Athi River)',
    assetType: 'Multi-Family',
    yearBuilt: 2015,
    sqft: 18200,
    warningStatus: 'Clean',
    cover: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&auto=format&fit=crop&q=60',
    monthlyRevenue: 210000,
    securityDeposits: 320000,
    units: [
      { id: 'Apt 101', status: 'Occupied', monthlyRent: 32000, beds: 2, baths: 1, tenantName: 'David Kimani' }
    ],
    tenants: [
      { name: 'David Kimani', unit: 'Apt 101', email: 'david.k@gmail.com', phone: '(254) 755-121212', leaseStart: '2023-01-01', leaseEnd: '2025-12-31', status: 'Active' }
    ],
    invoices: [
      { id: 'INV-3041', month: 'June 2026', amount: 32000, status: 'Paid' }
    ]
  },
  naivasha: {
    id: 'naivasha',
    name: 'Naivasha Gateways',
    owner: 'Beacon Housing Consortium',
    address: 'Lakeview Estate, Sector 3',
    county: 'Nakuru',
    subcounty: 'Naivasha',
    assetType: 'Single Family',
    yearBuilt: 2021,
    sqft: 8500,
    warningStatus: 'Auditing',
    cover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=60',
    monthlyRevenue: 150000,
    securityDeposits: 150000,
    units: [
      { id: 'Villa 1', status: 'Occupied', monthlyRent: 50000, beds: 3, baths: 3, tenantName: 'Grace Mwari' }
    ],
    tenants: [
      { name: 'Grace Mwari', unit: 'Villa 1', email: 'grace.m@yahoo.com', phone: '(254) 701-998877', leaseStart: '2024-01-01', leaseEnd: '2025-12-31', status: 'Active' }
    ],
    invoices: [
      { id: 'INV-4012', month: 'June 2026', amount: 50000, status: 'Paid' }
    ]
  },
  nyali: {
    id: 'nyali',
    name: 'Nyali Sunset Suites',
    owner: 'Coastal Holdings Ltd',
    address: 'Links Road, Nyali',
    county: 'Mombasa',
    subcounty: 'Nyali',
    assetType: 'Commercial',
    yearBuilt: 2019,
    sqft: 22000,
    warningStatus: 'Clean',
    cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=60',
    monthlyRevenue: 980000,
    securityDeposits: 1960000,
    units: [
      { id: 'Suite A', status: 'Occupied', monthlyRent: 120000, beds: 0, baths: 1, tenantName: 'Mombasa Forex Bureau' }
    ],
    tenants: [
      { name: 'Mombasa Forex Bureau', unit: 'Suite A', email: 'info@msaforex.co.ke', phone: '(254) 41-223344', leaseStart: '2021-05-01', leaseEnd: '2026-05-01', status: 'Active' }
    ],
    invoices: [
      { id: 'INV-5011', month: 'June 2026', amount: 120000, status: 'Paid' }
    ]
  }
};

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const router = useRouter();
  
  // Dynamic param unwrap
  const unwrappedParams = React.use(params as any) as any;
  const propertyId = unwrappedParams?.id || 'lumina';

  const [property, setProperty] = useState(PROPERTIES_DATA[propertyId] || PROPERTIES_DATA.lumina);
  const [activeTab, setActiveTab] = useState<'units' | 'tenants' | 'finance'>('units');
  
  // Action confirmations
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSuspend = () => {
    triggerToast('Syndication blocked successfully');
    setShowSuspendConfirm(false);
  };

  const handleDelete = () => {
    triggerToast('Property entry removed');
    setShowDeleteConfirm(false);
    setTimeout(() => {
      router.push('/properties');
    }, 1000);
  };

  return (
    <ModLayout title={`Property - ${property.name}`}>
      <div className="space-y-6 w-full pb-12 relative animate-fade-in">
        
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back Link Header */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/properties')}
            className="flex items-center gap-1.5 text-xs text-paper-500 dark:text-ink-400 hover:text-paper-950 dark:hover:text-white font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to properties
          </button>
        </div>

        {/* Asset Header Showcase */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-sm trans-theme flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-80 h-48 md:h-auto shrink-0 relative bg-ink-950">
            <img src={property.cover} alt={property.name} className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent"></div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-coral-500/10 border border-coral-500/20 text-coral-600 dark:text-coral-400 text-[9px] font-bold uppercase tracking-wider">
                  {property.assetType}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  property.warningStatus === 'Clean' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : property.warningStatus === 'Flagged'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                }`}>
                  Status: {property.warningStatus}
                </span>
              </div>
              
              <h2 className="text-xl font-black text-paper-950 dark:text-white mt-2 leading-tight">{property.name}</h2>
              
              <p className="text-xs text-paper-600 dark:text-ink-300 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-coral-500 shrink-0" />
                {property.address}, {property.subcounty}, {property.county} County
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-paper-100 dark:border-ink-800">
              <div>
                <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase block">Landlord Entity</span>
                <span className="text-xs font-bold text-paper-800 dark:text-white flex items-center gap-1 mt-0.5"><Briefcase className="w-3.5 h-3.5 text-purple-500" /> {property.owner}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase block">Total Area</span>
                <span className="text-xs font-bold text-paper-800 dark:text-white block mt-0.5">{property.sqft.toLocaleString()} Sq Ft</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase block">Year Built</span>
                <span className="text-xs font-bold text-paper-800 dark:text-white block mt-0.5">{property.yearBuilt}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase block">Ecosystem Units</span>
                <span className="text-xs font-bold text-paper-800 dark:text-white block mt-0.5">{property.units.length} Registered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="flex border-b border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-900 rounded-2xl px-2 shadow-sm trans-theme">
          {[
            { id: 'units', label: `Units Inventory (${property.units.length})`, icon: Settings },
            { id: 'tenants', label: `Active Tenants (${property.tenants.length})`, icon: Users },
            { id: 'finance', label: 'Finance & Ledger', icon: DollarSign }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all relative ${
                  isActive 
                    ? 'text-coral-500 border-b-2 border-coral-500' 
                    : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Context Content */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl p-6 shadow-sm trans-theme min-h-[250px]">
          
          {/* TAB 1: UNITS INVENTORY */}
          {activeTab === 'units' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Registered Units Inventory</h4>
                <span className="text-[10px] font-mono text-paper-400 dark:text-ink-500">Registry list</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-3">Unit Name / ID</th>
                        <th className="px-4 py-3">Beds / Baths</th>
                        <th className="px-4 py-3">Monthly Rent</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Resident Tenant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {property.units.map((unit: any) => (
                        <tr key={unit.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white">{unit.id}</td>
                          <td className="px-4 py-3.5 text-paper-600 dark:text-ink-300">{unit.beds} Bed • {unit.baths} Bath</td>
                          <td className="px-4 py-3.5 font-mono font-semibold text-paper-800 dark:text-ink-150">KES {unit.monthlyRent.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            {unit.status === 'Occupied' ? (
                              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase rounded-full">Occupied</span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase rounded-full">Vacant</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right text-paper-750 dark:text-ink-200 font-bold">
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

          {/* TAB 2: TENANTS DIRECTORY */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Active Leases & Tenants</h4>
                <span className="text-[10px] font-mono text-paper-400 dark:text-ink-500">Lease Registry</span>
              </div>

              <div className="border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 trans-theme">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 trans-theme">
                        <th className="px-4 py-3">Tenant Name</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Contact Detail</th>
                        <th className="px-4 py-3">Lease Duration</th>
                        <th className="px-4 py-3 text-right">Lease Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-100 dark:divide-ink-800/45 font-medium">
                      {property.tenants.map((t: any, idx: number) => (
                        <tr key={idx} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-3.5 font-bold text-paper-900 dark:text-white">{t.name}</td>
                          <td className="px-4 py-3.5 font-bold text-coral-500">{t.unit}</td>
                          <td className="px-4 py-3.5">
                            <span className="block text-paper-800 dark:text-ink-150">{t.email}</span>
                            <span className="block text-[10px] text-paper-400 mt-0.5">{t.phone}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[10px]">
                            {t.leaseStart} to {t.leaseEnd}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {t.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9px] rounded">Active Lease</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-505 font-bold uppercase text-[9px] rounded">Delinquent</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {property.tenants.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-paper-400 dark:text-ink-600">
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

          {/* TAB 3: FINANCE LEDGER */}
          {activeTab === 'finance' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Finance & Ledger Overview</h4>
                <span className="text-[10px] font-mono text-paper-400 dark:text-ink-500">Rent Ledger</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200/60 dark:border-ink-800/80 space-y-2">
                  <h5 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Revenue & Security Deposit Holds</h5>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-paper-600 dark:text-ink-300">Monthly Est. Gross Revenue</span>
                      <strong className="text-paper-950 dark:text-white font-mono">KES {property.monthlyRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-paper-600 dark:text-ink-300">Held Security Deposits</span>
                      <strong className="text-paper-950 dark:text-white font-mono">KES {property.securityDeposits.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-2xl border border-paper-200/60 dark:border-ink-800/80 space-y-2 flex flex-col justify-center">
                  <h5 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Ledger Reconciliation</h5>
                  <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed mt-1">
                    Financial records reconcile successfully with verified mobile bank transfer entries (MPESA logs).
                  </p>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Statements History Log</h5>
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
                      {property.invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-paper-50/40 dark:hover:bg-ink-800/10">
                          <td className="px-4 py-2.5 font-bold font-mono text-paper-900 dark:text-white">{inv.id}</td>
                          <td className="px-4 py-2.5 text-paper-600 dark:text-ink-300">{inv.month}</td>
                          <td className="px-4 py-2.5 font-semibold font-mono">KES {inv.amount.toLocaleString()}</td>
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

        {/* MODERATOR CONTROL PANEL */}
        <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200/50 dark:border-red-500/10 rounded-3xl p-6 space-y-3 shadow-sm trans-theme">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wide">Ecosystem Policy Actions</h4>
          </div>
          <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
            Platform moderators can block vacancy listing syndication for properties under investigation for lease violations or fraudulent descriptions.
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

        {/* SUSPEND CONFIRMATION OVERLAY */}
        {showSuspendConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 dark:bg-black/75 p-6 animate-fade-in">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 trans-theme">
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
                  onClick={handleSuspend}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 dark:bg-black/75 p-6 animate-fade-in">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 trans-theme">
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
                  onClick={handleDelete}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-750 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ModLayout>
  );
}
