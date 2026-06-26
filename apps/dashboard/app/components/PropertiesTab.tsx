'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp, MapPin, Home, Activity, SlidersHorizontal,
  LayoutGrid, List, Plus, AlertTriangle, ChevronDown,
  ChevronLeft, ChevronRight, Database, ShieldAlert, ArrowRight
} from 'lucide-react';
import { usePermissionsStore } from '../store/usePermissionsStore';
import { useAuditStore } from '../store/useAuditStore';
import { AccessDeniedOverlay } from './team/AccessDeniedOverlay';
import { useSession } from '@repo/auth';
import { AddPropertyModal } from './properties/AddPropertyModal';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  avgRent: string;
  image: string;
  badge?: string;
  badgeType?: string;
  units?: number;
  occupancy?: string;
  status?: string;
  tickets?: number;
  isVacant?: boolean;
  turnoverProgress?: number;
  hasPulse?: boolean;
}

const defaultProperties: Property[] = [
  {
    id: 'lumina',
    name: 'The Lumina',
    address: '100 Downtown Ave, Metro City',
    type: 'Multi-Family',
    avgRent: '$8.2k/mo Avg',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=250',
    badge: 'High Yield',
    badgeType: 'success',
    units: 24,
    occupancy: '98%',
    tickets: 1,
  },
  {
    id: 'westside',
    name: 'Westside Lofts',
    address: '844 West End, Industrial Dist.',
    type: 'Commercial/Loft',
    avgRent: '$4.5k/mo Avg',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=400&h=250',
    badge: 'Maintenance',
    badgeType: 'warning',
    units: 12,
    occupancy: '85%',
    tickets: 4,
    hasPulse: true,
  },
  {
    id: 'maple',
    name: '442 Maple Drive',
    address: 'Suburbs, North District',
    type: 'Single Family',
    avgRent: '$3,200/mo',
    isVacant: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400&h=250',
    badge: 'Vacant',
    badgeType: 'neutral',
    turnoverProgress: 40,
  },
  {
    id: 'riverside',
    name: 'Riverside Complex',
    address: '220 River Rd, Eastside',
    type: 'Multi-Family',
    avgRent: '$1.8k/mo Avg',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=400&h=250',
    units: 48,
    occupancy: '92%',
    tickets: 0,
  }
];

export default function PropertiesTab() {
  const router = useRouter();
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'full' | 'vacant'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'tickets'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [deniedAction, setDeniedAction] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const itemsPerPage = 8;
  
  const { checkPermission } = usePermissionsStore();
  const { logAction } = useAuditStore();
  const { data: session } = useSession();
  const user = session?.user;
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'JD';

  const canView = checkPermission('Properties', 'View Properties');
  const canListNew = checkPermission('Properties', 'List New');

  useEffect(() => {
    const close = () => { setIsOccupancyOpen(false); setIsSortOpen(false); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    async function loadProperties() {
      // Log the fetch action
      logAction({
        actor: { 
          initials: userInitials, 
          name: user?.name || 'System User', 
          email: user?.email || 'user@landlord.nl' 
        },
        category: { icon: Database, label: 'Properties' },
        description: 'Fetched properties list from database.',
        ip: 'Unknown', location: 'Unknown', status: 'success', severity: 'info'
      });
      
      try {
        const res = await fetch('http://localhost:4000/api/dashboard/properties', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPropertiesList(data);
            return;
          }
        }
      } catch (e) {
        console.warn('Backend API offline, falling back to local storage');
      }

      // Local storage fallback
      const saved = localStorage.getItem('landlordnl_properties_list');
      if (saved) {
        try {
          const customProps: Property[] = JSON.parse(saved);
          setPropertiesList([...customProps, ...defaultProperties]);
          return;
        } catch (e) {
          console.error('Failed to load custom properties list', e);
        }
      }
      setPropertiesList(defaultProperties);
    }
    if (session) {
      loadProperties();
    }
  }, [session]);

  const handleAddPropertyClick = () => {
    if (!canListNew) {
      setDeniedAction('List New');
      logAction({
        actor: { 
          initials: userInitials, 
          name: user?.name || 'System User', 
          email: user?.email || 'user@landlord.nl' 
        },
        category: { icon: ShieldAlert, label: 'Security & Audit' },
        description: `Blocked attempt to add new property. Missing 'List New' permission.`,
        ip: 'Unknown', location: 'Unknown', status: 'blocked', severity: 'critical'
      });
      return;
    }
    setIsAddModalOpen(true);
  };

  if (!canView) {
    return <AccessDeniedOverlay moduleName="Properties" actionName="View Properties" />;
  }

  const filteredProperties = propertiesList.filter(prop => {
    if (occupancyFilter === 'full') {
      return prop.occupancy === '100%';
    }
    if (occupancyFilter === 'vacant') {
      return prop.occupancy !== '100%';
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'tickets') {
      return (b.tickets || 0) - (a.tickets || 0);
    }
    return 0; // Default order
  });

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / itemsPerPage));
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const overallOccupancy = propertiesList.length ? Math.round(propertiesList.reduce((acc, p) => acc + parseFloat(p.occupancy || '0'), 0) / propertiesList.length) : 0;
  const vacantProps = propertiesList.filter(p => p.occupancy !== '100%').length;
  const pendingProperties = propertiesList.filter(p => p.status === 'pending');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in relative">
      {deniedAction && (
        <AccessDeniedOverlay 
          moduleName="Properties" 
          actionName={deniedAction} 
          onClose={() => setDeniedAction(null)} 
        />
      )}

      {pendingProperties.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
            <div>
              <span className="font-semibold text-amber-655 dark:text-amber-400">Setup Required:</span> You have{' '}
              <strong className="underline decoration-amber-500/50 font-bold">
                {pendingProperties.length} pending property asset{pendingProperties.length > 1 ? 's' : ''}
              </strong>{' '}
              requiring unit details and team access scope configuration before they go active.
            </div>
          </div>
          <button
            onClick={() => {
              router.push(`/properties/${pendingProperties[0].id}/setup`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-amber-500 text-white rounded hover:bg-amber-600 active:scale-95 transition-all whitespace-nowrap shadow-sm shadow-amber-500/20"
          >
            Configure First Asset <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Page Header & Portfolio Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-paper-900 dark:text-white tracking-tight flex items-center gap-2">
            <img src="/logomark.png" alt="Landlord.nl" className="h-5 w-auto" />
            Property Portfolio
          </h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">Manage and monitor all active assets across regions.</p>
        </div>

        {/* Quick Stats Row */}
        <div className="flex bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-md shadow-sm transition-colors duration-200 divide-x divide-paper-200 dark:divide-ink-700 overflow-hidden animate-fade-in">
          <div className="px-4 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-paper-500 dark:text-ink-400">Total Properties</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-paper-900 dark:text-white">{propertiesList.length}</span>
            </div>
          </div>
          <div className="px-4 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-medium uppercase tracking-wider text-paper-500 dark:text-ink-400">Overall Occupancy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-paper-900 dark:text-white">{overallOccupancy}%</span>
            </div>
          </div>
          <div className="px-4 py-2 flex flex-col justify-center bg-paper-50/50 dark:bg-ink-900/50">
            <span className="text-[10px] font-medium uppercase tracking-wider text-paper-500 dark:text-ink-400">Props w/ Vacancies</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-semibold ${vacantProps > 0 ? 'text-coral-500' : 'text-paper-900 dark:text-white'}`}>{vacantProps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-1.5 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg transition-colors duration-200">
        {/* Filters Left */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="relative group">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOccupancyOpen(!isOccupancyOpen); setIsSortOpen(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-all shadow-sm whitespace-nowrap ${occupancyFilter !== 'all' ? 'bg-coral-50 dark:bg-coral-500/10 border-coral-200 dark:border-coral-500/20 text-coral-700 dark:text-coral-400' : 'bg-white dark:bg-ink-800 border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700'}`}
            >
              <Activity className="w-3.5 h-3.5 opacity-70" />
              {occupancyFilter === 'all' ? 'Occupancy' : occupancyFilter === 'full' ? 'Fully Occupied' : 'Has Vacancies'}
              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
            </button>
            {isOccupancyOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-lg z-10 overflow-hidden py-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setOccupancyFilter('all'); setIsOccupancyOpen(false); setCurrentPage(1); }} className="w-full text-left px-3 py-2 text-xs text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700">All Occupancy</button>
                <button onClick={() => { setOccupancyFilter('full'); setIsOccupancyOpen(false); setCurrentPage(1); }} className="w-full text-left px-3 py-2 text-xs text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700">Fully Occupied</button>
                <button onClick={() => { setOccupancyFilter('vacant'); setIsOccupancyOpen(false); setCurrentPage(1); }} className="w-full text-left px-3 py-2 text-xs text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700">Has Vacancies</button>
              </div>
            )}
          </div>
          <div className="relative group">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); setIsOccupancyOpen(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-all shadow-sm whitespace-nowrap ${sortBy !== 'newest' ? 'bg-coral-50 dark:bg-coral-500/10 border-coral-200 dark:border-coral-500/20 text-coral-700 dark:text-coral-400' : 'bg-white dark:bg-ink-800 border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
              {sortBy === 'newest' ? 'Sort By' : 'Most Tickets'}
              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
            </button>
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-lg z-10 overflow-hidden py-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setSortBy('newest'); setIsSortOpen(false); setCurrentPage(1); }} className="w-full text-left px-3 py-2 text-xs text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700">Newest</button>
                <button onClick={() => { setSortBy('tickets'); setIsSortOpen(false); setCurrentPage(1); }} className="w-full text-left px-3 py-2 text-xs text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-700">Most Tickets</button>
              </div>
            )}
          </div>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded shadow-sm overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 border-r border-paper-200 dark:border-ink-600 transition-all ${viewMode === 'grid' ? 'bg-paper-100 dark:bg-ink-700 text-paper-900 dark:text-white' : 'text-paper-400 dark:text-ink-500 hover:text-paper-700 dark:hover:text-ink-200 hover:bg-paper-50/50 dark:hover:bg-ink-900/50'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 transition-all ${viewMode === 'list' ? 'bg-paper-100 dark:bg-ink-700 text-paper-900 dark:text-white' : 'text-paper-400 dark:text-ink-500 hover:text-paper-700 dark:hover:text-ink-200 hover:bg-paper-50/50 dark:hover:bg-ink-900/50'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAddPropertyClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-coral-500 text-white rounded hover:bg-coral-600 active:scale-95 transition-all shadow-sm shadow-coral-500/20 whitespace-nowrap animate-fade-in"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Property
          </button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm animate-fade-in overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-paper-50 dark:bg-ink-900 border-b border-paper-200 dark:border-ink-700">
                <th className="px-4 py-3 text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Property Asset</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Avg Rent</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Units</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Occupancy</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Active Tickets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-100 dark:divide-ink-700/50">
              {paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-paper-500 dark:text-ink-400">
                    No properties match your filters.
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => (
                  <tr 
                    key={property.id} 
                    onClick={() => {
                      if (property.status === 'pending') {
                        router.push(`/properties/${property.id}/setup`);
                      } else {
                        router.push(`/properties/${property.id}`);
                      }
                    }}
                    className="hover:bg-paper-50/50 dark:hover:bg-ink-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={property.image} alt={property.name} className="w-10 h-10 rounded object-cover border border-paper-200 dark:border-ink-700" />
                        <div>
                          <p className="text-sm font-medium text-paper-900 dark:text-white flex items-center gap-1.5">
                            {property.name}
                            {property.status === 'pending' && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 uppercase tracking-wider animate-pulse">
                                Pending Setup
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-paper-400 dark:text-ink-500">{property.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-paper-700 dark:text-ink-300">
                      {property.status === 'pending' ? 'Unconfigured' : property.type}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-paper-900 dark:text-white">
                      {property.status === 'pending' ? '—' : property.avgRent}
                    </td>
                    <td className="px-4 py-3 text-xs text-paper-700 dark:text-ink-300">{property.units}</td>
                    <td className="px-4 py-3">
                      {property.status === 'pending' ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-505 border border-amber-500/20">
                          Inactive
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${property.occupancy === '100%' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-coral-500/10 text-coral-600 dark:text-coral-400'}`}>
                          {property.occupancy}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {property.status === 'pending' ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/properties/${property.id}/setup`);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-amber-500 text-white rounded hover:bg-amber-600 active:scale-95 transition-all shadow-sm"
                        >
                          Setup
                        </button>
                      ) : (
                        <span className={`text-xs font-semibold ${property.tickets && property.tickets > 0 ? 'text-coral-500' : 'text-paper-400 dark:text-ink-500'}`}>
                          {property.tickets || 0}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
        {paginatedProperties.map((property) => (
          <div
            key={property.id}
            onClick={() => {
              if (property.status === 'pending') {
                router.push(`/properties/${property.id}/setup`);
              } else {
                router.push(`/properties/${property.id}`);
              }
            }}
            className="group bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-150 flex flex-col cursor-pointer relative"
          >
            {/* Image Wrapper */}
            <div className="h-36 relative overflow-hidden bg-paper-100 dark:bg-ink-900">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex gap-1">
                {property.status === 'pending' ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm border border-amber-600/30 animate-pulse animate-duration-1000">
                    Pending Setup
                  </span>
                ) : property.badge ? (
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm text-white ${
                    property.badgeType === 'success' ? 'bg-emerald-500' :
                    property.badgeType === 'warning' ? 'bg-coral-500' :
                    'bg-paper-800/80 border border-white/20'
                  }`}>
                    {property.badgeType === 'warning' && <AlertTriangle className="w-2.5 h-2.5" />}
                    {property.badge}
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-2 left-3">
                <p className="text-white font-semibold text-sm leading-tight drop-shadow-md">{property.name}</p>
                <p className="text-white/80 text-[10px] flex items-center gap-1 drop-shadow-md">
                  <MapPin className="w-2.5 h-2.5" /> {property.address}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200">
                  {property.status === 'pending' ? 'Unconfigured' : property.type}
                </span>
                <span className={`text-xs font-semibold ${property.status === 'pending' ? 'text-paper-400' : property.isVacant ? 'text-paper-400 line-through decoration-coral-500/50' : 'text-paper-900 dark:text-white'}`}>
                  {property.status === 'pending' ? '—' : property.avgRent}
                </span>
              </div>

              {property.status === 'pending' ? (
                <div className="pt-3 border-t border-paper-100 dark:border-ink-700/50 flex flex-col gap-2">
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 leading-normal">
                    This asset requires unit rental prices and team accessibility settings.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/properties/${property.id}/setup`);
                    }}
                    className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-amber-500 text-white rounded hover:bg-amber-600 active:scale-95 transition-all shadow-sm shadow-amber-500/10"
                  >
                    Setup Now
                  </button>
                </div>
              ) : property.isVacant && property.turnoverProgress !== undefined ? (
                /* Turnover progress */
                <div className="mt-auto pt-3 border-t border-paper-100 dark:border-ink-700/50 flex flex-col gap-1">
                  <div className="w-full bg-paper-100 dark:bg-ink-900 h-1.5 overflow-hidden transition-colors">
                    <div className="bg-blue-500 h-full rounded-sm" style={{ width: `${property.turnoverProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-paper-400 dark:text-ink-500 font-medium uppercase tracking-wide">
                    <span>Turnover Progress</span>
                    <span>{property.turnoverProgress}%</span>
                  </div>
                </div>
              ) : (
                /* Mini Stats Grid */
                <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-paper-100 dark:border-ink-700/50">
                  <div className="flex flex-col items-center justify-center p-1.5 bg-paper-50/50 dark:bg-ink-900/50 rounded transition-colors">
                    <span className="text-[10px] text-paper-400 dark:text-ink-500 mb-0.5">Units</span>
                    <span className="font-semibold text-paper-900 dark:text-white text-xs">{property.units}</span>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-1.5 rounded border transition-colors ${property.occupancy === '100%' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-coral-500/10 border-coral-500/20'}`}>
                    <span className="text-[10px] text-paper-400 dark:text-ink-500 mb-0.5">Occupancy</span>
                    <span className={`font-semibold text-xs ${property.occupancy === '100%' ? 'text-emerald-600 dark:text-emerald-400' : 'text-coral-600 dark:text-coral-400'}`}>{property.occupancy}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-1.5 bg-paper-50/50 dark:bg-ink-900/50 rounded transition-colors relative">
                    <span className="text-[10px] text-paper-400 dark:text-ink-500 mb-0.5">Tickets</span>
                    <span className={`font-semibold text-xs ${property.tickets && property.tickets > 0 ? 'text-coral-500' : 'text-paper-900 dark:text-white'}`}>
                      {property.tickets}
                    </span>
                    {property.hasPulse && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add New Property Placeholder */}
        {currentPage === totalPages && (
          <div
            onClick={handleAddPropertyClick}
            className="group bg-paper-50/30 dark:bg-ink-900/20 border-2 border-dashed border-paper-200 dark:border-ink-800 rounded-lg hover:border-coral-500 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-full bg-paper-100 dark:bg-ink-800 flex items-center justify-center text-paper-400 dark:text-ink-500 group-hover:bg-coral-500/20 group-hover:text-coral-500 transition-all mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-paper-900 dark:text-white text-xs">Add New Property</span>
            <span className="text-[10px] text-paper-400 dark:text-ink-500 mt-1">Import or create manual entry</span>
          </div>
        )}
      </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-paper-200 dark:border-ink-850 pt-4 mt-8 transition-colors">
          <span className="text-xs text-paper-400 dark:text-ink-500 font-medium">
            Showing {filteredProperties.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} properties
          </span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-paper-200 dark:border-ink-800 text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white hover:border-paper-300 dark:hover:border-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-semibold transition-all ${
                  currentPage === i + 1 
                    ? 'bg-coral-500/10 border-coral-500/20 text-coral-500' 
                    : 'border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-800'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-paper-200 dark:border-ink-800 text-paper-400 dark:text-ink-500 hover:text-paper-900 dark:hover:text-white hover:border-paper-300 dark:hover:border-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddPropertyModal 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(propertyId) => {
            setIsAddModalOpen(false);
            router.push(`/properties/${propertyId}/setup`);
          }}
        />
      )}
    </div>
  );
}
