'use client';

import React, { useState, useEffect } from 'react';
import { Building2, List, Map as MapIcon, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { VacancyProperty, getDistance } from './types';
import Filters from './components/Filters';
import ListTab from './components/ListTab';
import MapTab from './components/MapTab';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<VacancyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRent, setMaxRent] = useState<number>(0);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [countySearchInput, setCountySearchInput] = useState('');
  const [showCountySuggestions, setShowCountySuggestions] = useState(false);
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'rentAsc' | 'rentDesc'>('default');

  // Radial Map Search
  const [circleCenter, setCircleCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [circleRadius, setCircleRadius] = useState<number>(3); // 3km, capped at 5km

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Leaflet scripts loader
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const loadVacancies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/vacancies`);
      if (res.ok) {
        const data = await res.json();
        setVacancies(data);
      }
    } catch (err) {
      console.error("Failed to load vacancies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, []);

  // Dynamically load Leaflet CDN assets
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Extract Dynamic Unit Types from active listings
  const unitTypes = ['All', ...Array.from(new Set(vacancies.map(v => v.unitType).filter(Boolean)))];

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setMaxRent(0);
    setSelectedCounty('');
    setCountySearchInput('');
    setSelectedSubcounty('');
    setSelectedUnitType('All');
    setFavoritesOnly(false);
    setCircleCenter(null);
    setCircleRadius(3);
    setSortBy('default');
    setCurrentPage(1);
  };

  // Filter Pipeline
  const filteredList = vacancies.filter(item => {
    const matchesSearch = 
      item.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRent = maxRent === 0 ? true : item.rent <= maxRent;
    const matchesCounty = selectedCounty ? item.county === selectedCounty : true;
    const matchesSubcounty = selectedSubcounty ? item.subcounty === selectedSubcounty : true;
    const matchesUnitType = selectedUnitType === 'All' ? true : item.unitType.toLowerCase() === selectedUnitType.toLowerCase();
    const matchesFavorites = favoritesOnly ? favorites.includes(item.id) : true;

    let matchesRadial = true;
    if (circleCenter && item.latitude && item.longitude) {
      const dist = getDistance(circleCenter.lat, circleCenter.lng, item.latitude, item.longitude);
      matchesRadial = dist <= circleRadius;
    }

    return matchesSearch && matchesRent && matchesCounty && matchesSubcounty && matchesUnitType && matchesFavorites && matchesRadial;
  });

  // Sort Pipeline
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'rentAsc') return a.rent - b.rent;
    if (sortBy === 'rentDesc') return b.rent - a.rent;
    return 0;
  });

  // Pagination Pipeline
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);
  const paginatedList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-[98%] px-4 md:px-8 mx-auto py-6 space-y-6 pb-20 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-paper-200 dark:border-ink-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-coral-500 tracking-wider">Internal Relocation Portal</span>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-paper-900 dark:text-white tracking-tight">Available Vacancies</h1>
            <button 
              onClick={loadVacancies}
              disabled={loading}
              className="p-1.5 rounded-md hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white transition-colors"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            Browse listed vacant units inside Landlord.nl Kenia organization.
          </p>
        </div>

        {/* Tab Switcher Controls - mapmode is its own tab inside vacancies tab */}
        <div className="flex items-center bg-paper-100 dark:bg-ink-950 p-1.5 rounded-2xl border border-paper-250 dark:border-ink-800">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'list' 
                ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' 
                : 'text-paper-500 hover:text-paper-700'
            }`}
          >
            <List className="w-4 h-4" /> Cards List
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'map' 
                ? 'bg-white dark:bg-ink-800 text-paper-900 dark:text-white shadow-sm' 
                : 'text-paper-500 hover:text-paper-700'
            }`}
          >
            <MapIcon className="w-4 h-4" /> OpenStreetMap Search
          </button>
        </div>
      </div>

      {/* Shared Filter Dashboard Panel */}
      <Filters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        maxRent={maxRent}
        setMaxRent={setMaxRent}
        selectedCounty={selectedCounty}
        setSelectedCounty={setSelectedCounty}
        countySearchInput={countySearchInput}
        setCountySearchInput={setCountySearchInput}
        showCountySuggestions={showCountySuggestions}
        setShowCountySuggestions={setShowCountySuggestions}
        selectedSubcounty={selectedSubcounty}
        setSelectedSubcounty={setSelectedSubcounty}
        selectedUnitType={selectedUnitType}
        setSelectedUnitType={setSelectedUnitType}
        favoritesOnly={favoritesOnly}
        setFavoritesOnly={setFavoritesOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        unitTypes={unitTypes}
        onClearFilters={handleClearFilters}
        setCurrentPage={setCurrentPage}
      />

      {/* Loading indicator */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-paper-500 dark:text-ink-400">Loading listings from Landlord.nl network...</p>
        </div>
      ) : (
        /* Tab Display Panels */
        <div className="space-y-6">
          {activeTab === 'list' ? (
            <ListTab 
              sortedList={sortedList}
              paginatedList={paginatedList}
              favorites={favorites}
              toggleFavorite={handleToggleFavorite}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <MapTab 
              vacancies={filteredList}
              circleCenter={circleCenter}
              onSetCircleCenter={setCircleCenter}
              circleRadius={circleRadius}
              onSetCircleRadius={setCircleRadius}
              leafletLoaded={leafletLoaded}
            />
          )}
        </div>
      )}

    </div>
  );
}
