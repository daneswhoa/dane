'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModLayout from '../components/ModLayout';
import PropertyStats from './PropertyStats';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, Settings, Building, MapPin, Compass
} from 'lucide-react';

export interface Property {
  id: string;
  name: string;
  owner: string;
  address: string;
  county: string;
  subcounty: string;
  assetType: 'Apartment' | 'Multi-Family' | 'Single Family' | 'Commercial';
  yearBuilt: number;
  sqft: number;
  warningStatus: 'Clean' | 'Flagged' | 'Auditing';
  cover: string;
  monthlyRevenue: number;
  securityDeposits: number;
  unitsCount: number;
  occupancyRate: number;
  tickets: number;
}

const INITIAL_PROPERTIES: Property[] = [
  {
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
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=60',
    monthlyRevenue: 850000,
    securityDeposits: 1200000,
    unitsCount: 24,
    occupancyRate: 98,
    tickets: 1
  },
  {
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
    unitsCount: 12,
    occupancyRate: 85,
    tickets: 4
  },
  {
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
    unitsCount: 48,
    occupancyRate: 92,
    tickets: 0
  },
  {
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
    unitsCount: 8,
    occupancyRate: 75,
    tickets: 2
  },
  {
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
    unitsCount: 16,
    occupancyRate: 100,
    tickets: 0
  }
];

const KENYAN_COUNTIES = [
  { name: 'Nairobi', subcounties: ['Westlands', 'Dagoretti North', 'Lang\'ata', 'Kibra', 'Kasarani', 'Starehe'] },
  { name: 'Mombasa', subcounties: ['Mvita', 'Nyali', 'Changamwe', 'Kisauni', 'Likoni'] },
  { name: 'Kiambu', subcounties: ['Ruiru', 'Thika Town', 'Kikuyu', 'Limuru', 'Kabete', 'Kiambu Town'] },
  { name: 'Machakos', subcounties: ['Mavoko (Syokimau/Athi River)', 'Machakos Town', 'Kangundo'] },
  { name: 'Nakuru', subcounties: ['Naivasha', 'Nakuru East', 'Nakuru West', 'Gilgil'] }
];

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters: County, Subcounty, Asset Type, Occupancy, Warnings, and Price Range
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedSubcounty, setSelectedSubcounty] = useState('All');
  const [selectedAssetType, setSelectedAssetType] = useState('All');
  const [selectedOccupancy, setSelectedOccupancy] = useState('All');
  const [selectedWarning, setSelectedWarning] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchQuery('');
      setSelectedCounty('All');
      setSelectedSubcounty('All');
      setSelectedAssetType('All');
      setSelectedOccupancy('All');
      setSelectedWarning('All');
      setSelectedPriceRange('All');
      setCurrentPage(1);
      setIsLoading(false);
      triggerToast('Properties directory updated');
    }, 600);
  };

  // Filter properties logic
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCounty = selectedCounty === 'All' || p.county === selectedCounty;
    const matchesSubcounty = selectedSubcounty === 'All' || p.subcounty === selectedSubcounty;
    const matchesAsset = selectedAssetType === 'All' || p.assetType === selectedAssetType;
    const matchesWarning = selectedWarning === 'All' || p.warningStatus === selectedWarning;

    // Occupancy logic
    let matchesOccupancy = true;
    if (selectedOccupancy !== 'All') {
      if (selectedOccupancy === 'Fully Occupied') {
        matchesOccupancy = p.occupancyRate === 100;
      } else if (selectedOccupancy === 'Partially Vacant') {
        matchesOccupancy = p.occupancyRate < 100 && p.occupancyRate > 0;
      } else if (selectedOccupancy === 'Vacant') {
        matchesOccupancy = p.occupancyRate === 0;
      }
    }

    // Price range logic (Est. monthly revenue)
    let matchesPrice = true;
    if (selectedPriceRange !== 'All') {
      const rev = p.monthlyRevenue;
      if (selectedPriceRange === 'low') {
        matchesPrice = rev < 200000;
      } else if (selectedPriceRange === 'mid') {
        matchesPrice = rev >= 200000 && rev <= 500000;
      } else if (selectedPriceRange === 'high') {
        matchesPrice = rev > 500000;
      }
    }

    return matchesSearch && matchesCounty && matchesSubcounty && matchesAsset && matchesWarning && matchesOccupancy && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get subcounties of selected county
  const currentCountyObj = KENYAN_COUNTIES.find(c => c.name === selectedCounty);
  const subcountyOptions = currentCountyObj ? currentCountyObj.subcounties : [];

  // Stats calculation
  const totalUnits = properties.reduce((acc, p) => acc + p.unitsCount, 0);
  const averageOccupancy = properties.length > 0 ? Math.round(properties.reduce((acc, p) => acc + p.occupancyRate, 0) / properties.length) : 0;
  const grossBilling = properties.reduce((acc, p) => acc + p.monthlyRevenue, 0);
  const activeTickets = properties.reduce((acc, p) => acc + p.tickets, 0);

  return (
    <ModLayout title="Properties">
      <div className="space-y-6 w-full pb-10 relative">
        
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fade-in font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* METRIC CARDS */}
        <PropertyStats 
          totalProperties={properties.length}
          totalUnits={totalUnits}
          occupancyRate={averageOccupancy}
          grossBilling={grossBilling}
          activeTickets={activeTickets}
        />

        {/* ECOSYSTEM REGISTRY FILTER BAR */}
        <div className="bg-white dark:bg-ink-900 p-4 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm trans-theme w-full space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search property name, street address, or landlord organization..." 
                className="w-full pl-9 pr-4 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-coral-500 dark:text-white shadow-inner trans-theme"
              />
            </div>
            
            <button 
              onClick={handleRefresh}
              className="p-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-paper-700 dark:text-ink-200 trans-subtle flex items-center justify-center self-end md:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-coral-500' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 pt-1 items-center">
            {/* County */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">County:</span>
              <select 
                value={selectedCounty}
                onChange={(e) => {
                  const county = e.target.value;
                  setSelectedCounty(county);
                  setSelectedSubcounty('All');
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Counties</option>
                {KENYAN_COUNTIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcounty */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Subcounty:</span>
              <select 
                value={selectedSubcounty}
                disabled={selectedCounty === 'All'}
                onChange={(e) => {
                  setSelectedSubcounty(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="All">All Subcounties</option>
                {subcountyOptions.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Asset Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Type:</span>
              <select 
                value={selectedAssetType}
                onChange={(e) => {
                  setSelectedAssetType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Multi-Family">Multi-Family</option>
                <option value="Single Family">Single Family</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Occupancy */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Occupancy:</span>
              <select 
                value={selectedOccupancy}
                onChange={(e) => {
                  setSelectedOccupancy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Occupancies</option>
                <option value="Fully Occupied">Fully Occupied</option>
                <option value="Partially Vacant">Partially Vacant</option>
                <option value="Vacant">Vacant</option>
              </select>
            </div>

            {/* Warnings */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Warning:</span>
              <select 
                value={selectedWarning}
                onChange={(e) => {
                  setSelectedWarning(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All warnings</option>
                <option value="Clean">Clean</option>
                <option value="Flagged">Flagged</option>
                <option value="Auditing">Auditing</option>
              </select>
            </div>

            {/* Rent price range */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Rent Range:</span>
              <select 
                value={selectedPriceRange}
                onChange={(e) => {
                  setSelectedPriceRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Ranges</option>
                <option value="low">Under KES 200,000</option>
                <option value="mid">KES 200,000 - KES 500,000</option>
                <option value="high">Over KES 500,000</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROPERTY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedProperties.map((prop) => (
            <div 
              key={prop.id}
              onClick={() => router.push(`/properties/${prop.id}`)}
              className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-sm hover:border-coral-400 dark:hover:border-coral-500/30 trans-subtle flex flex-col group cursor-pointer"
            >
              <div className="h-36 w-full overflow-hidden relative bg-ink-950 shrink-0">
                <img src={prop.cover} alt={prop.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border border-ink-700/50 text-[9px] font-bold text-white uppercase tracking-wider">
                    {prop.unitsCount} Units
                  </span>
                  <span className={`px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border text-[9px] font-bold uppercase tracking-wider ${
                    prop.warningStatus === 'Clean' 
                      ? 'text-emerald-400 border-emerald-500/20' 
                      : prop.warningStatus === 'Flagged'
                      ? 'text-red-400 border-red-500/20'
                      : 'text-amber-400 border-amber-500/20'
                  }`}>
                    {prop.warningStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-paper-900 dark:text-white leading-tight group-hover:text-coral-500 trans-subtle">{prop.name}</h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-paper-400" /> 
                    {prop.address}, {prop.county}
                  </p>
                  
                  <div className="flex gap-4 mt-2.5 text-[10px] text-paper-500 dark:text-ink-400 font-semibold font-mono">
                    <span>Occupancy: {prop.occupancyRate}%</span>
                    <span>Est. Billing: KES {prop.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-paper-100 dark:border-ink-800 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400">
                  <span>Owner: <strong className="text-paper-700 dark:text-ink-200">{prop.owner}</strong></span>
                  <button 
                    className="px-2.5 py-1 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-md text-[10px] font-bold trans-subtle flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3 text-paper-400 group-hover:text-coral-500 transition-colors" />
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paginatedProperties.length === 0 && (
            <div className="col-span-full py-16 text-center text-paper-400 dark:text-ink-500 text-xs border border-dashed border-paper-300 dark:border-ink-800 rounded-2xl bg-white dark:bg-ink-900/50">
              No registered properties found matching the selected filters.
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl p-4 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme w-full shadow-sm">
            <span>Showing {paginatedProperties.length} of {filteredProperties.length} properties</span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || totalPages <= 1}
                className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed trans-subtle"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className="p-1.5 rounded bg-white hover:bg-paper-100 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed trans-subtle"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </ModLayout>
  );
}
