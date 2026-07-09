'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, Search, Plus, Trash2, MapPin, AlertCircle, Loader, 
  Building, DollarSign, Home, X, Calendar, Mail, User, Clock,
  ArrowUpRight, RefreshCw, TrendingUp, Activity, Eye, CheckCircle2, Zap
} from 'lucide-react';
import { Property, ListedUnitData, formatCurrency } from './types';
import { SyndicationWizardModal } from './SyndicationWizardModal';
import { EditListedUnitModal } from './EditListedUnitModal';

export const getUnitFallbackImage = (unitType: string): string => {
  const type = (unitType || '').toLowerCase();
  if (type.includes('single')) return '/fallback_single_room.png';
  if (type.includes('bedsitter') || type.includes('studio')) return '/fallback_bedsitter.png';
  if (type.includes('one-bedroom') || type.includes('1 bedroom') || type.includes('one bedroom')) return '/fallback_one_bedroom.png';
  if (type.includes('two-bedroom') || type.includes('2 bedroom') || type.includes('two bedroom')) return '/fallback_two_bedroom.png';
  return '/default_apartment.png';
};

interface SyndicationCenterProps {
  defaultOpenNew?: boolean;
}

export const SyndicationCenter: React.FC<SyndicationCenterProps> = ({ defaultOpenNew = false }) => {
  const router = useRouter();
  const [listedUnits, setListedUnits] = useState<ListedUnitData[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(defaultOpenNew);
  const [editingUnit, setEditingUnit] = useState<ListedUnitData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Unlist confirmation states
  const [unitToUnlist, setUnitToUnlist] = useState<string | null>(null);
  const [unlisting, setUnlisting] = useState(false);
  const [unlistError, setUnlistError] = useState<string | null>(null);

  // Selected unit details popup states
  const [selectedUnitForDetails, setSelectedUnitForDetails] = useState<ListedUnitData | null>(null);
  const [unitInquiries, setUnitInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('');
  const [selectedCountyFilter, setSelectedCountyFilter] = useState('');

  // Fetch Listed Units and Properties
  const fetchData = async () => {
    try {
      setLoadingList(true);
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const unitsRes = await fetch(`${host}/api/dashboard/syndication/listed`, { credentials: 'include' });
      if (unitsRes.ok) {
        const data = await unitsRes.json();
        setListedUnits(data);
      }

      const propsRes = await fetch(`${host}/api/dashboard/properties`, { credentials: 'include' });
      if (propsRes.ok) {
        const data = await propsRes.json();
        setProperties(data);
      }
    } catch (e) {
      console.error('Failed to load syndication list data', e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update modal open status if defaultOpenNew changes
  useEffect(() => {
    setIsModalOpen(defaultOpenNew);
  }, [defaultOpenNew]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (defaultOpenNew) {
      router.push('/syndication');
    }
  };

  const handleOpenUnlistModal = (unitId: string) => {
    setUnlistError(null);
    setUnitToUnlist(unitId);
  };

  const handleShowUnitDetails = async (unit: ListedUnitData) => {
    setSelectedUnitForDetails(unit);
    setLoadingInquiries(true);
    setUnitInquiries([]);
    
    try {
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${host}/api/notifications`, { credentials: 'include' });
      if (res.ok) {
        const notifications = await res.json();
        
        // Filter notifications matching this unit (title contains unit label and property name)
        const matched = notifications.filter((n: any) => {
          const isRelevant = 
            (n.title.toLowerCase().includes('inquiry') || n.title.toLowerCase().includes('tour request')) &&
            n.title.toLowerCase().includes(`(unit ${unit.label.toLowerCase()})`) &&
            n.title.toLowerCase().includes(unit.propertyName.toLowerCase());
          return isRelevant;
        });

        // Parse relevant notifications into inquiries
        const parsed = matched.map((n: any) => {
          const isTour = n.title.toLowerCase().includes('tour');
          const messageText = n.message || '';
          
          let tenantName = 'Anonymous Tenant';
          let tenantEmail = '';
          const tenantMatch = messageText.match(/Tenant\s+(.*?)\s+\((.*?)\)/);
          if (tenantMatch) {
            tenantName = tenantMatch[1];
            tenantEmail = tenantMatch[2];
          }

          let tourDate = '';
          let tourTime = '';
          let inquiryMessage = '';

          if (isTour) {
            const tourMatch = messageText.match(/requested a tour on\s+(.*?)\s+at\s+([^.]+)/);
            if (tourMatch) {
              tourDate = tourMatch[1];
              tourTime = tourMatch[2];
            }
          } else {
            const inquiryMatch = messageText.match(/sent an inquiry:\s*[\r\n]*"([\s\S]*?)"/) || messageText.match(/sent an inquiry:\s*([\s\S]*)/);
            if (inquiryMatch) {
              inquiryMessage = inquiryMatch[1];
            }
          }

          return {
            id: n.id,
            type: isTour ? 'tour' : 'message',
            tenantName,
            tenantEmail,
            tourDate,
            tourTime,
            message: inquiryMessage || messageText,
            createdAt: n.createdAt,
            isRead: n.isRead
          };
        });

        setUnitInquiries(parsed);
      }
    } catch (e) {
      console.error('Failed to load inquiries for unit detail view', e);
    } finally {
      setLoadingInquiries(false);
    }
  };

  // Filter listed units
  const filteredUnits = listedUnits.filter(u => {
    const matchesSearch = 
      u.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.unitType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProperty = selectedPropertyFilter ? u.propertyId === selectedPropertyFilter : true;
    const matchesCounty = selectedCountyFilter ? u.county === selectedCountyFilter : true;

    return matchesSearch && matchesProperty && matchesCounty;
  });

  // Calculate statistics
  const totalRentAmount = listedUnits.reduce((sum, u) => sum + u.rent, 0);
  const avgRentAmount = listedUnits.length > 0 ? Math.round(totalRentAmount / listedUnits.length) : 0;
  const uniquePropertiesCount = new Set(listedUnits.map(u => u.propertyId)).size;

  return (
    <div className="p-6 w-full space-y-6 text-[var(--text-primary)]">
      
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-subtle pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-coral-500 animate-pulse" /> Marketing & Syndication Center
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage your syndicated rental vacancies. Sync vacant units instantly to rental portals and search directories.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-subtle rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh Listings"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-coral-500' : ''}`} />
          </button>
          
          <a
            href={`${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001'}/tenant/vacancies`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-raised)] text-[var(--text-primary)] border border-subtle rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Globe className="w-4 h-4 text-emerald-500" /> View Public Listings
          </a>
          <button
            onClick={() => {
              setIsModalOpen(true);
              router.push('/syndication/new');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-coral-500/20 animate-fade-in"
          >
            <Plus className="w-4 h-4" /> Syndicate New Units
          </button>
        </div>
      </div>

      {/* Location Pinning & Marketplace Readiness */}
      <div className="bg-[var(--bg-panel)] border border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs uppercase font-extrabold text-[var(--text-secondary)] tracking-widest flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-coral-500" />
            Marketplace Location Pinned Status
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Vacant units are easier to get occupied if you ensure they have county, subcounty, and exact map coordinate pins. Pinned units appear directly on our interactive map searches.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-subtle text-[var(--text-muted)]">
                <th className="pb-2.5 font-semibold">Property</th>
                <th className="pb-2.5 font-semibold">Region (County / Subcounty)</th>
                <th className="pb-2.5 font-semibold">Map Geo-Coords</th>
                <th className="pb-2.5 font-semibold">Syndication Status</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const propUnits = listedUnits.filter(u => u.propertyId === p.id);
                const isGeoPinned = p.latitude && p.longitude;
                return (
                  <tr key={p.id} className="border-b border-subtle last:border-0 hover:bg-[var(--bg-raised)]/45">
                    <td className="py-3 font-bold">{p.name}</td>
                    <td className="py-3 text-[var(--text-secondary)]">
                      {p.county && p.subcounty ? `${p.subcounty}, ${p.county}` : <span className="text-red-400 italic">Missing Region details</span>}
                    </td>
                    <td className="py-3">
                      {isGeoPinned ? (
                        <span className="text-emerald-500 font-semibold">{Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}</span>
                      ) : (
                        <span className="text-red-400 italic">Not Pinned on Map</span>
                      )}
                    </td>
                    <td className="py-3">
                      {propUnits.length > 0 ? (
                        <span className="px-2 py-0.5 bg-coral-500/10 text-coral-500 text-[10px] rounded border border-coral-500/20 font-bold">
                          {propUnits.length} Units Syndicated
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic">No units listed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-panel)] p-4 border border-subtle rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-coral-500/10 text-coral-500 rounded-lg">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">Syndicated Units</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{listedUnits.length} Units Active</p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] p-4 border border-subtle rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">Active Properties</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{uniquePropertiesCount} Assets</p>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] p-4 border border-subtle rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">Average Monthly Rent</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(avgRentAmount, 'KES')}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[var(--bg-panel)] p-3 border border-subtle rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search listed units, property, types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          <select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
          >
            <option value="">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedCountyFilter}
            onChange={(e) => setSelectedCountyFilter(e.target.value)}
            className="bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
          >
            <option value="">All Counties</option>
            {Array.from(new Set(listedUnits.map(u => u.county).filter(Boolean))).map(countyName => (
              <option key={countyName} value={countyName}>{countyName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Vacant Listings Grid */}
      {loadingList ? (
        <div className="flex flex-col items-center justify-center p-12 border border-subtle rounded-xl bg-[var(--bg-panel)]/40 h-80 space-y-2">
          <Loader className="w-7 h-7 text-[var(--coral)] animate-spin" />
          <span className="text-xs text-[var(--text-muted)]">Scanning active syndications...</span>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-subtle rounded-xl bg-[var(--bg-panel)]/30 h-80 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[var(--text-muted)]" />
          <div>
            <h3 className="text-sm font-semibold">No Listed Units Found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              There are no active vacant unit syndications matching your filters. Click "Syndicate New Units" to publish a new one!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((item) => {
            const parsedAmenities = item.amenities ? JSON.parse(item.amenities) : [];
            const parsedRules = item.rules ? JSON.parse(item.rules) : [];
            const propObj = properties.find(p => p.id === item.propertyId);

            let parsedImages: string[] = [];
            if (item.images) {
              try {
                parsedImages = JSON.parse(item.images);
              } catch (e) {}
            }
            const mainImage = parsedImages[0] || null;

            return (
              <div
                key={item.unitId}
                onClick={() => handleShowUnitDetails(item)}
                className="bg-[var(--bg-panel)] border border-subtle rounded-xl overflow-hidden shadow-sm hover:border-[var(--coral)]/30 hover:shadow-md cursor-pointer transition-all flex flex-col group"
              >
                {/* Main image banner */}
                <div className="w-full h-36 relative overflow-hidden bg-zinc-950/20 border-b border-subtle">
                  <img src={mainImage || getUnitFallbackImage(item.unitType)} alt={item.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>

                <div className="p-4 flex-1 space-y-3">
                  {/* Property Name & Location */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2 py-0.5 bg-[var(--coral)]/10 text-[var(--coral)] text-[9px] font-bold rounded uppercase tracking-wider">
                        {item.unitType}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] mt-1.5">{item.propertyName}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {item.county && item.subcounty ? `${item.subcounty}, ${item.county}` : item.propertyAddress}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenUnlistModal(item.unitId); }}
                      className="p-1.5 bg-[var(--bg-raised)] border border-subtle text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Take unit offline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unit Label */}
                  <div className="flex justify-between items-center bg-[var(--bg-raised)] p-2.5 rounded-lg border border-subtle">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Unit Label</span>
                    <span className="text-xs font-black text-[var(--text-primary)]">{item.label}</span>
                  </div>

                  {/* Financials Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[var(--bg-raised)] p-2.5 rounded-lg border border-subtle text-center">
                    <div>
                      <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Rent</p>
                      <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(item.rent, propObj?.currency)}</p>
                    </div>
                    <div className="border-l border-subtle">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Deposit</p>
                      <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(item.deposit, propObj?.currency)}</p>
                    </div>
                    <div className="border-l border-subtle">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Move In</p>
                      <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{formatCurrency(item.moveInFees, propObj?.currency)}</p>
                    </div>
                  </div>

                  {/* Amenities List */}
                  {parsedAmenities.length > 0 && (
                    <div className="space-y-1 pt-1.5">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedAmenities.map((amenity: string, idx: number) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-coral-500/10 text-coral-500 text-[9px] rounded-md border border-coral-500/20 font-medium">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rules List */}
                  {parsedRules.length > 0 && (
                    <div className="space-y-1 border-t border-subtle pt-2.5">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Rules</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedRules.map((rule: string, idx: number) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-zinc-500/10 text-zinc-400 text-[9px] rounded-md border border-zinc-500/20 font-medium">
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer coordinates and Edit action */}
                <div className="bg-[var(--bg-raised)]/60 px-4 py-2 border-t border-subtle flex justify-between items-center text-[9px] text-[var(--text-muted)] font-medium">
                  {(item.latitude || item.longitude) ? (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[var(--coral)]" /> Geo-pinned
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingUnit(item); }}
                    className="px-2.5 py-1 bg-coral-500/10 hover:bg-coral-500 text-coral-500 hover:text-white border border-coral-500/20 rounded-md text-[10px] font-bold transition-all shadow-sm"
                  >
                    Edit Listing
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Step Creation Wizard Modal */}
      <SyndicationWizardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        properties={properties}
        onSuccess={fetchData}
      />

      {/* Edit Single Unit Listing Modal */}
      <EditListedUnitModal
        isOpen={!!editingUnit}
        onClose={() => setEditingUnit(null)}
        unit={editingUnit}
        onSuccess={fetchData}
      />

      {/* Confirmation Modal */}
      {unitToUnlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 animate-fade-in text-[var(--text-primary)]">
          <div className="bg-[var(--bg-panel)] border border-subtle rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Take Listing Offline</h3>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to take this unit off the syndication portal? This will immediately remove it from public search networks and tenant vacancy pages.
            </p>

            {unlistError && (
              <p className="text-[10px] text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                {unlistError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={unlisting}
                onClick={() => setUnitToUnlist(null)}
                className="px-3.5 py-1.5 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] text-xs font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={unlisting}
                onClick={async () => {
                  setUnlisting(true);
                  setUnlistError(null);
                  try {
                    const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                    const res = await fetch(`${host}/api/dashboard/syndication/unlist-unit/${unitToUnlist}`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                    if (res.ok) {
                      setListedUnits(listedUnits.filter(u => u.unitId !== unitToUnlist));
                      setUnitToUnlist(null);
                    } else {
                      setUnlistError('Failed to unlist unit. Please try again.');
                    }
                  } catch (e) {
                    console.error(e);
                    setUnlistError('A network error occurred. Please try again.');
                  } finally {
                    setUnlisting(false);
                  }
                }}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-red-500/10 flex items-center gap-1"
              >
                {unlisting ? 'Taking offline...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Details & Inquiries Modal */}
      {selectedUnitForDetails && (() => {
        const item = selectedUnitForDetails;
        const parsedAmenities = item.amenities ? JSON.parse(item.amenities) : [];
        const parsedRules = item.rules ? JSON.parse(item.rules) : [];
        const propObj = properties.find(p => p.id === item.propertyId);

        let parsedImages: string[] = [];
        if (item.images) {
          try {
            parsedImages = JSON.parse(item.images);
          } catch (e) {}
        }
        const mainImage = parsedImages[0] || null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 animate-fade-in text-[var(--text-primary)]">
            <div className="bg-[var(--bg-panel)] border border-subtle rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
              
              {/* Cover Banner & Close Button */}
              <div className="relative h-48 w-full bg-[var(--bg-raised)] border-b border-subtle">
                <img src={mainImage || getUnitFallbackImage(item.unitType)} alt={item.label} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedUnitForDetails(null)}
                  className="absolute top-4 right-4 p-2 bg-zinc-950/60 hover:bg-zinc-950/80 border border-white/10 rounded-full text-white transition-all active:scale-95 shadow-md animate-fade-in"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/75 backdrop-blur-md border border-white/10 rounded-xl p-3 flex justify-between items-center text-white">
                  <div>
                    <span className="px-2 py-0.5 bg-coral-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                      {item.unitType}
                    </span>
                    <h3 className="text-sm font-black mt-1">{item.propertyName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-300 uppercase font-semibold">Rent Amount</p>
                    <p className="text-sm font-bold text-coral-400">{formatCurrency(item.rent, propObj?.currency)}</p>
                  </div>
                </div>
              </div>

              {/* Main Contents */}
              <div className="p-6 space-y-6">
                
                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[var(--bg-raised)] p-3 border border-subtle rounded-xl text-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Unit Label</span>
                    <p className="text-sm font-black text-[var(--text-primary)] mt-1">{item.label}</p>
                  </div>
                  <div className="bg-[var(--bg-raised)] p-3 border border-subtle rounded-xl text-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Floor</span>
                    <p className="text-sm font-black text-[var(--text-primary)] mt-1">{item.floor || 'G'}</p>
                  </div>
                  <div className="bg-[var(--bg-raised)] p-3 border border-subtle rounded-xl text-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Deposit</span>
                    <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{formatCurrency(item.deposit, propObj?.currency)}</p>
                  </div>
                  <div className="bg-[var(--bg-raised)] p-3 border border-subtle rounded-xl text-center">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Move In Fees</span>
                    <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{formatCurrency(item.moveInFees, propObj?.currency)}</p>
                  </div>
                </div>

                {/* Geo Location / Map address */}
                <div className="space-y-1 bg-[var(--bg-raised)]/40 p-3.5 border border-subtle rounded-xl flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">Location & Address</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {item.county && item.subcounty ? `${item.subcounty}, ${item.county}` : item.propertyAddress}
                    </p>
                    {item.latitude && item.longitude && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                        Coordinates: {Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amenities & Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amenities Included</h4>
                    {parsedAmenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedAmenities.map((amenity: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-coral-500/10 text-coral-500 text-[10px] rounded-lg border border-coral-500/20 font-medium">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic">No amenities specified.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Rules & Guidelines</h4>
                    {parsedRules.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedRules.map((rule: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-zinc-500/10 text-zinc-400 text-[10px] rounded-lg border border-zinc-500/20 font-medium">
                            {rule}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic">No house rules specified.</p>
                    )}
                  </div>
                </div>

                {/* INQUIRIES SECTION */}
                <div className="border-t border-subtle pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-coral-500 animate-pulse" />
                      Inquiries & Tour Requests
                    </h4>
                    <span className="px-2 py-0.5 bg-paper-250 dark:bg-ink-800 rounded-full text-[10px] font-semibold text-[var(--text-secondary)]">
                      {unitInquiries.length} Total
                    </span>
                  </div>

                  {loadingInquiries ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-subtle rounded-xl space-y-2">
                      <Loader className="w-5 h-5 text-coral-500 animate-spin" />
                      <span className="text-[10px] text-[var(--text-muted)]">Retrieving inquiries inbox...</span>
                    </div>
                  ) : unitInquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-subtle rounded-xl text-center space-y-2">
                      <Mail className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
                      <p className="text-xs font-semibold">No inquiries yet</p>
                      <p className="text-[10px] text-[var(--text-muted)] max-w-xs">
                        When prospective tenants send messages or tour requests for this listing on the portal, they will show up here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {unitInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className={`p-4 border border-subtle rounded-xl space-y-3 transition-colors ${
                            !inq.isRead ? 'bg-coral-500/5 border-coral-500/10' : 'bg-[var(--bg-raised)]/40'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-coral-500/10 text-coral-500 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                {inq.tenantName.substring(0, 2)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[var(--text-primary)]">{inq.tenantName}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{inq.tenantEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 self-start sm:self-auto">
                              {inq.type === 'tour' ? (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 text-[9px] font-bold rounded uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                                  <Calendar className="w-3 h-3" /> Tour Requested
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded uppercase tracking-wider flex items-center gap-1 border border-blue-500/20">
                                  <Mail className="w-3 h-3" /> Message
                                </span>
                              )}
                              <span className="text-[9px] text-[var(--text-muted)] font-medium">
                                {new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {inq.type === 'tour' && (inq.tourDate || inq.tourTime) && (
                            <div className="bg-[var(--bg-panel)] border border-subtle p-2.5 rounded-lg flex items-center gap-2 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Proposed Tour Date: <strong>{inq.tourDate}</strong> at <strong>{inq.tourTime}</strong></span>
                            </div>
                          )}

                          {inq.message && (
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-panel)] p-2.5 rounded-lg border border-subtle whitespace-pre-line">
                              "{inq.message}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Action Footer */}
              <div className="bg-[var(--bg-raised)] px-6 py-4 border-t border-subtle flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnitForDetails(null);
                    setEditingUnit(item);
                  }}
                  className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-coral-500/10 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  Edit Listing
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnitForDetails(null);
                      handleOpenUnlistModal(item.unitId);
                    }}
                    className="px-3.5 py-2 bg-transparent border border-subtle text-red-500 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    Take Offline
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUnitForDetails(null)}
                    className="px-4 py-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-raised)] text-[var(--text-primary)] border border-subtle rounded-lg text-xs font-bold transition-all"
                  >
                    Close Details
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
