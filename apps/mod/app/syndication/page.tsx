'use client';

import React, { useState } from 'react';
import ModLayout from '../components/ModLayout';
import SyndicationStats from './SyndicationStats';
import SyndicationAuditModal, { ListedUnit } from './SyndicationAuditModal';
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, ShieldCheck, Globe, MapPin, Settings
} from 'lucide-react';

const INITIAL_LISTED_UNITS: ListedUnit[] = [
  {
    unitId: 'LIS-901',
    propertyName: 'The Lumina',
    propertyId: 'lumina',
    label: 'Suite 201',
    unitType: '1 Bedroom',
    county: 'Nairobi',
    subcounty: 'Westlands',
    propertyAddress: '102 Peponi Road, Westlands',
    rent: 65000,
    deposit: 65000,
    moveInFees: 5000,
    status: 'Under Review',
    referralTraffic: 'Organic',
    amenities: ['High-speed Fiber Internet', 'Backup Generator', 'CCTV Security', 'Borehole Water'],
    rules: ['Quiet Hours (10 PM - 6 AM)', 'No Pets Allowed'],
    latitude: '-1.2618',
    longitude: '36.8041',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=60'],
    inquiries: [
      { id: 'INQ-001', type: 'message', tenantName: 'Kevin Kamau', tenantEmail: 'kamau.k@gmail.com', message: 'Is water included in the monthly rent?', createdAt: '2026-07-07T08:14:00Z' },
      { id: 'INQ-002', type: 'tour', tenantName: 'Martha Wanjiku', tenantEmail: 'wanjiku.m@yahoo.com', message: 'I would like to schedule a physical walkthrough this weekend.', tourDate: '2026-07-11', tourTime: '10:00 AM', createdAt: '2026-07-06T15:20:00Z' }
    ]
  },
  {
    unitId: 'LIS-902',
    propertyName: 'The Lumina',
    propertyId: 'lumina',
    label: 'Suite 101',
    unitType: '2 Bedroom',
    county: 'Nairobi',
    subcounty: 'Westlands',
    propertyAddress: '102 Peponi Road, Westlands',
    rent: 75000,
    deposit: 75000,
    moveInFees: 8000,
    status: 'Active',
    referralTraffic: 'Paid Promo',
    amenities: ['High-speed Fiber Internet', 'Backup Generator', 'Balcony', 'CCTV Security'],
    rules: ['Quiet Hours (10 PM - 6 AM)', 'Non-smoking Premises'],
    latitude: '-1.2620',
    longitude: '36.8044',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop&q=60'],
    inquiries: []
  },
  {
    unitId: 'LIS-903',
    propertyName: 'Westside Lofts',
    propertyId: 'westside',
    label: 'Unit A2',
    unitType: '2 Bedroom',
    county: 'Kiambu',
    subcounty: 'Kikuyu',
    propertyAddress: '44 Southern Bypass',
    rent: 45000,
    deposit: 45000,
    moveInFees: 4000,
    status: 'Active',
    referralTraffic: 'Organic',
    amenities: ['Fiber Internet', 'Borehole Water', 'Parking Space'],
    rules: ['Pets Allowed (max 1)', 'Quiet Hours (11 PM - 6 AM)'],
    latitude: '-1.2480',
    longitude: '36.6800',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=60'],
    inquiries: [
      { id: 'INQ-003', type: 'message', tenantName: 'Erick Omwamba', tenantEmail: 'omwamba.e@hotmail.com', message: 'Is parking included in the monthly rent or billed separately?', createdAt: '2026-07-05T09:40:00Z' }
    ]
  },
  {
    unitId: 'LIS-904',
    propertyName: 'Naivasha Gateways',
    propertyId: 'naivasha',
    label: 'Villa 1',
    unitType: '3 Bedroom',
    county: 'Nakuru',
    subcounty: 'Naivasha',
    propertyAddress: 'Lakeview Estate, Sector 3',
    rent: 50000,
    deposit: 50000,
    moveInFees: 10000,
    status: 'Suspended',
    referralTraffic: 'Social Share',
    amenities: ['Borehole Water', 'Private Backyard', 'Solar Heating'],
    rules: ['Quiet Hours (10 PM - 6 AM)'],
    latitude: '-0.7180',
    longitude: '36.4300',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=60'],
    inquiries: []
  },
  {
    unitId: 'LIS-905',
    propertyName: 'Nyali Sunset Suites',
    propertyId: 'nyali',
    label: 'Suite A',
    unitType: 'Commercial',
    county: 'Mombasa',
    subcounty: 'Nyali',
    propertyAddress: 'Links Road, Nyali',
    rent: 120000,
    deposit: 240000,
    moveInFees: 15000,
    status: 'Flagged',
    referralTraffic: 'Paid Promo',
    amenities: ['CCTV Security', 'Elevator Access', 'Fiber Internet', 'Backup Generator'],
    rules: ['Business Activities Only', 'No Overnight Lodging'],
    latitude: '-4.0280',
    longitude: '39.7120',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=60'],
    inquiries: [
      { id: 'INQ-004', type: 'message', tenantName: 'Fatma Juma', tenantEmail: 'juma.f@msaforex.co.ke', message: 'Do you offer flexible corporate leases for multi-year terms?', createdAt: '2026-07-04T11:00:00Z' }
    ]
  }
];

const KENYAN_COUNTIES = [
  { name: 'Nairobi', subcounties: ['Westlands', 'Dagoretti North', 'Lang\'ata', 'Kibra', 'Kasarani', 'Starehe'] },
  { name: 'Mombasa', subcounties: ['Mvita', 'Nyali', 'Changamwe', 'Kisauni', 'Likoni'] },
  { name: 'Kiambu', subcounties: ['Ruiru', 'Thika Town', 'Kikuyu', 'Limuru', 'Kabete', 'Kiambu Town'] },
  { name: 'Machakos', subcounties: ['Mavoko (Syokimau/Athi River)', 'Machakos Town', 'Kangundo'] },
  { name: 'Nakuru', subcounties: ['Naivasha', 'Nakuru East', 'Nakuru West', 'Gilgil'] }
];

export default function SyndicationPage() {
  const [listedUnits, setListedUnits] = useState(INITIAL_LISTED_UNITS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 6 Advanced filters
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedSubcounty, setSelectedSubcounty] = useState('All');
  const [selectedUnitType, setSelectedUnitType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [selectedTraffic, setSelectedTraffic] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedUnit, setSelectedUnit] = useState<ListedUnit | null>(null);
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
      setSelectedUnitType('All');
      setSelectedStatus('All');
      setSelectedBudget('All');
      setSelectedTraffic('All');
      setCurrentPage(1);
      setIsLoading(false);
      triggerToast('Syndication directory updated');
    }, 600);
  };

  const handleSuspend = (unitId: string) => {
    setListedUnits(prev => prev.map(u => u.unitId === unitId ? { ...u, status: 'Suspended' } : u));
    triggerToast(`Vacancy listing ${unitId} has been suspended`);
    setSelectedUnit(null);
  };

  const handleApprove = (unitId: string) => {
    setListedUnits(prev => prev.map(u => u.unitId === unitId ? { ...u, status: 'Active' } : u));
    triggerToast(`Vacancy listing ${unitId} approved and active`);
    setSelectedUnit(null);
  };

  // Filter listings logic
  const filteredUnits = listedUnits.filter(u => {
    const matchesSearch = u.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.unitId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCounty = selectedCounty === 'All' || u.county === selectedCounty;
    const matchesSubcounty = selectedSubcounty === 'All' || u.subcounty === selectedSubcounty;
    const matchesUnitType = selectedUnitType === 'All' || u.unitType === selectedUnitType;
    const matchesStatus = selectedStatus === 'All' || u.status === selectedStatus;
    const matchesTraffic = selectedTraffic === 'All' || u.referralTraffic === selectedTraffic;

    // Budget range logic
    let matchesBudget = true;
    if (selectedBudget !== 'All') {
      const price = u.rent;
      if (selectedBudget === 'low') {
        matchesBudget = price < 50000;
      } else if (selectedBudget === 'mid') {
        matchesBudget = price >= 50000 && price <= 100000;
      } else if (selectedBudget === 'high') {
        matchesBudget = price > 100000;
      }
    }

    return matchesSearch && matchesCounty && matchesSubcounty && matchesUnitType && matchesStatus && matchesBudget && matchesTraffic;
  });

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const subcountyOptions = KENYAN_COUNTIES.find(c => c.name === selectedCounty)?.subcounties || [];

  // Metrics calculation
  const activeCount = listedUnits.filter(u => u.status === 'Active').length;
  const underReviewCount = listedUnits.filter(u => u.status === 'Under Review' || u.status === 'Flagged').length;
  const blockedCount = listedUnits.filter(u => u.status === 'Suspended').length;
  const totalInquiries = listedUnits.reduce((acc, u) => acc + u.inquiries.length, 0);

  return (
    <ModLayout title="Syndication">
      <div className="space-y-6 w-full pb-10 relative">
        
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-ink-950 border border-coral-500/30 text-coral-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-coral-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* METRICS ROW */}
        <SyndicationStats 
          activeCount={activeCount}
          totalInquiries={totalInquiries}
          underReviewCount={underReviewCount}
          blockedCount={blockedCount}
        />

        {/* SYNDICATION SEARCH & FILTER BAR */}
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
                placeholder="Search by property, unit code, county, or reference id..." 
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
                  setSelectedCounty(e.target.value);
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

            {/* Unit Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Unit Type:</span>
              <select 
                value={selectedUnitType}
                onChange={(e) => {
                  setSelectedUnitType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="1 Bedroom">1 Bedroom</option>
                <option value="2 Bedroom">2 Bedroom</option>
                <option value="3 Bedroom">3 Bedroom</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Status:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Under Review">Under Review</option>
                <option value="Flagged">Flagged</option>
              </select>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Budget Range:</span>
              <select 
                value={selectedBudget}
                onChange={(e) => {
                  setSelectedBudget(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Budgets</option>
                <option value="low">Under KES 50,000</option>
                <option value="mid">KES 50,000 - KES 100,000</option>
                <option value="high">Over KES 100,000</option>
              </select>
            </div>

            {/* Traffic Route */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-paper-400 dark:text-ink-500">Traffic Source:</span>
              <select 
                value={selectedTraffic}
                onChange={(e) => {
                  setSelectedTraffic(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg px-2 py-1.5 text-[11px] text-paper-700 dark:text-ink-200 font-semibold outline-none cursor-pointer"
              >
                <option value="All">All Sources</option>
                <option value="Organic">Organic</option>
                <option value="Paid Promo">Paid Promo</option>
                <option value="Social Share">Social Share</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIVE LISTINGS CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedUnits.map(unit => (
            <div 
              key={unit.unitId}
              onClick={() => setSelectedUnit(unit)}
              className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-sm hover:border-coral-400 dark:hover:border-coral-500/30 trans-subtle flex flex-col group cursor-pointer"
            >
              <div className="h-36 w-full overflow-hidden relative bg-ink-950 shrink-0">
                <img src={unit.images[0]} alt={unit.label} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border border-ink-700/50 text-[9px] font-bold text-white uppercase tracking-wider">
                    {unit.unitType}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border text-[9px] font-bold uppercase tracking-wider ${
                    unit.status === 'Active' 
                      ? 'text-emerald-400 border-emerald-500/20' 
                      : unit.status === 'Suspended'
                      ? 'text-red-400 border-red-500/20'
                      : 'text-amber-400 border-amber-500/20'
                  }`}>
                    {unit.status}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-sm font-bold text-paper-900 dark:text-white leading-tight group-hover:text-coral-500 trans-subtle">
                      {unit.propertyName} • Unit {unit.label}
                    </h3>
                    <span className="text-[10px] font-mono text-paper-400 dark:text-ink-500 font-semibold">{unit.unitId}</span>
                  </div>
                  
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-paper-400" /> 
                    {unit.subcounty}, {unit.county}
                  </p>
                  
                  <div className="flex gap-4 mt-3 text-[10px] text-paper-500 dark:text-ink-400 font-semibold font-mono">
                    <span>Rent: KES {unit.rent.toLocaleString()}</span>
                    <span>Inquiries: {unit.inquiries.length}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-paper-100 dark:border-ink-800 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400">
                  <span>Source: <strong className="text-paper-700 dark:text-ink-200">{unit.referralTraffic}</strong></span>
                  <button 
                    className="px-2.5 py-1 bg-paper-100 hover:bg-paper-200 dark:bg-ink-950 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded-md text-[10px] font-bold trans-subtle flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3 text-paper-400 group-hover:text-coral-500 transition-colors" />
                    Audit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paginatedUnits.length === 0 && (
            <div className="col-span-full py-16 text-center text-paper-400 dark:text-ink-500 text-xs border border-dashed border-paper-300 dark:border-ink-800 rounded-2xl bg-white dark:bg-ink-900/50">
              No active syndicated vacancies found matching the selected filters.
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl p-4 flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-400 trans-theme w-full shadow-sm">
            <span>Showing {paginatedUnits.length} of {filteredUnits.length} listings</span>
            
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

        {/* AUDIT MODAL */}
        {selectedUnit && (
          <SyndicationAuditModal 
            unit={selectedUnit}
            onClose={() => setSelectedUnit(null)}
            onSuspend={handleSuspend}
            onApprove={handleApprove}
          />
        )}

      </div>
    </ModLayout>
  );
}
