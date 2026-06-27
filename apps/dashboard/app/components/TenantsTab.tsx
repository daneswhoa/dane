'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, AlertCircle, SlidersHorizontal, Download, UserPlus } from 'lucide-react';
import { TenantKpiCards } from './tenants/TenantKpiCards';
import { TenantsTable } from './tenants/TenantsTable';
import { InviteTenantModal } from './tenants/InviteTenantModal';
import { MoveTenantModal } from './tenants/MoveTenantModal';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  floor: string;
  rent: number;
  arrears: number;
  status: string;
  leaseStart: string;
  leaseEnd: string;
}

const defaultTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '555-019-8234',
    propertyName: 'Westside Lofts',
    unitId: '304',
    unitName: 'Unit 304',
    floor: '3',
    rent: 2100,
    arrears: 2150,
    status: 'LATE',
    leaseStart: '2023-01-01',
    leaseEnd: '2024-12-31',
  },
  {
    id: 'tenant-2',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    phone: '555-010-8234',
    propertyName: 'Grandview Apts',
    unitId: '12B',
    unitName: 'Unit 12B',
    floor: '1',
    rent: 1850,
    arrears: 0,
    status: 'ACTIVE',
    leaseStart: '2023-09-01',
    leaseEnd: '2025-08-31',
  },
  {
    id: 'tenant-3',
    name: 'David Kim',
    email: 'd.kim@example.com',
    phone: '555-010-8888',
    propertyName: 'The Beacon',
    unitId: '8C',
    unitName: 'Unit 8C',
    floor: '8',
    rent: 2450,
    arrears: 0,
    status: 'RENEWING',
    leaseStart: '2023-07-01',
    leaseEnd: '2026-06-30',
  },
  {
    id: 'tenant-4',
    name: 'Emma & Tom Reed',
    email: 'e.t.reed@example.com',
    phone: '555-020-1122',
    propertyName: 'Grandview Apts',
    unitId: '5C',
    unitName: 'Unit 5C',
    floor: '5',
    rent: 1900,
    arrears: 0,
    status: 'NOTICE GIVEN',
    leaseStart: '2022-11-01',
    leaseEnd: '2024-10-31',
  },
  {
    id: 'tenant-5',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '555-020-3344',
    propertyName: 'Oakridge Estates',
    unitId: '42',
    unitName: 'Unit 42',
    floor: '1',
    rent: 1600,
    arrears: 1600,
    status: 'MOVE-IN PREP',
    leaseStart: '2024-06-01',
    leaseEnd: '2025-05-31',
  },
];
export default function TenantsTab() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [delinquentOnly, setDelinquentOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const itemsPerPage = 8;

  const [movingTenant, setMovingTenant] = useState<{ id: string; name: string; unitId: string; propertyName: string } | null>(null);

  async function loadTenants() {
    setIsLoading(true);
    let loadedData = defaultTenants;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/tenants`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          loadedData = data;
        }
      }
    } catch (e) {
      console.warn('Backend API offline, falling back to local storage');
      const saved = localStorage.getItem('landlordnl_tenants_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            loadedData = parsed;
          }
        } catch (e) {}
      }
    }
    
    // Deduplicate by ID to prevent "two children with same key" crash
    const uniqueTenants = Array.from(new Map(loadedData.map(item => [item.id, item])).values()) as Tenant[];
    setTenants(uniqueTenants);
    setIsLoading(false);
  }

  useEffect(() => {
    loadTenants();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Unit', 'Rent', 'Arrears', 'Status'];
    const rows = tenants.map(t => [t.name, t.email, t.phone, t.unitName, t.rent, t.arrears, t.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'landlordnl_tenant_directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (t.unitId || '').toLowerCase().includes(filterQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || (t.status || '').toUpperCase() === statusFilter.toUpperCase();
    const matchesDelinquent = !delinquentOnly || Number(t.arrears || 0) > 0;
    const matchesProperty = propertyFilter === 'ALL' || t.propertyName === propertyFilter;

    return matchesSearch && matchesStatus && matchesDelinquent && matchesProperty;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / itemsPerPage));
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueProperties = Array.from(new Set(tenants.map(t => t.propertyName))).filter(Boolean);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full flex-1 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-paper-900 dark:text-white tracking-tight">Tenant Directory</h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Manage leases, communicate with residents, and track balances.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 rounded-md hover:bg-paper-50 dark:hover:bg-ink-700 transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-coral-500 text-white rounded-md hover:bg-coral-600 transition-all shadow-sm shadow-coral-500/20">
            <UserPlus className="w-3.5 h-3.5" /> Add Tenant
          </button>
        </div>
      </div>

      {isInviteModalOpen && <InviteTenantModal onClose={() => setIsInviteModalOpen(false)} />}

      <TenantKpiCards tenants={tenants} />

      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-sm flex flex-col">
        <div className="p-3 border-b border-paper-200 dark:border-ink-700 flex flex-wrap items-center gap-3 bg-paper-50/50 dark:bg-ink-900/20 rounded-t-lg">
          <div className="relative flex-grow max-w-xs">
            <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, unit, or email..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
            />
          </div>
          <div className="h-5 w-px bg-paper-200 dark:bg-ink-700 hidden sm:block mx-1"></div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="relative group min-w-[140px]">
              <select 
                value={propertyFilter}
                onChange={(e) => { setPropertyFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full flex items-center justify-between gap-2 pl-2.5 pr-8 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 transition-all cursor-pointer font-medium outline-none"
              >
                <option value="ALL">All Properties</option>
                {uniqueProperties.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-paper-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative group">
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none flex items-center justify-between gap-2 pl-2.5 pr-8 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-800 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700 transition-all cursor-pointer font-medium outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="LATE">Late</option>
                <option value="RENEWING">Renewing</option>
                <option value="NOTICE GIVEN">Notice Given</option>
              </select>
              <ChevronDown className="w-3 h-3 text-paper-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => { setDelinquentOnly(!delinquentOnly); setCurrentPage(1); }}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs border rounded-md transition-all whitespace-nowrap font-medium ${
                delinquentOnly
                  ? 'border-coral-200 bg-coral-50 text-coral-700 dark:border-coral-500/30 dark:bg-coral-500/10 dark:text-coral-400'
                  : 'border-paper-200 bg-white text-paper-750 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 mr-0.5" /> Delinquent Only
            </button>
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-700 rounded transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Views
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-paper-500 dark:text-ink-400 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium tracking-tight">Loading tenant records...</span>
          </div>
        ) : (
          <>
            {paginatedTenants.length > 0 ? (
              <TenantsTable 
                tenants={paginatedTenants} 
                onMoveTenant={setMovingTenant}
              />
            ) : (
              <div className="p-16 text-center text-paper-500 dark:text-ink-400 flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-medium tracking-tight">No tenants match your filters.</span>
                <span className="text-xs">Try adjusting your search criteria or resetting filters.</span>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3.5 px-5 border-t border-paper-200 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/20">
                <span className="text-xs text-paper-500 dark:text-ink-400 font-medium">
                  Showing {filteredTenants.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold border border-paper-200 dark:border-ink-700 rounded text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-semibold border border-paper-200 dark:border-ink-700 rounded text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {movingTenant && (
        <MoveTenantModal
          tenantId={movingTenant.id}
          tenantName={movingTenant.name}
          currentUnitLabel={movingTenant.unitId}
          currentPropertyName={movingTenant.propertyName}
          onClose={() => setMovingTenant(null)}
          onSuccess={() => {
            setMovingTenant(null);
            loadTenants();
          }}
        />
      )}
      <div className="pb-8"></div>
    </div>
  );
}
