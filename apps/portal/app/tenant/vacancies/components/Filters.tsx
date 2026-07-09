'use client';

import React, { useRef } from 'react';
import { Search, MapPin, Heart, ArrowUpDown, X, SlidersHorizontal, DollarSign } from 'lucide-react';
import KENYAN_COUNTIES from '../kenyan_counties.json';

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  maxRent: number;
  setMaxRent: (v: number) => void;
  selectedCounty: string;
  setSelectedCounty: (v: string) => void;
  countySearchInput: string;
  setCountySearchInput: (v: string) => void;
  showCountySuggestions: boolean;
  setShowCountySuggestions: (v: boolean) => void;
  selectedSubcounty: string;
  setSelectedSubcounty: (v: string) => void;
  selectedUnitType: string;
  setSelectedUnitType: (v: string) => void;
  favoritesOnly: boolean;
  setFavoritesOnly: (v: boolean) => void;
  sortBy: 'default' | 'rentAsc' | 'rentDesc';
  setSortBy: (v: 'default' | 'rentAsc' | 'rentDesc') => void;
  unitTypes: string[];
  onClearFilters: () => void;
  setCurrentPage: (p: number) => void;
}

export default function Filters({
  searchQuery,
  setSearchQuery,
  maxRent,
  setMaxRent,
  selectedCounty,
  setSelectedCounty,
  countySearchInput,
  setCountySearchInput,
  showCountySuggestions,
  setShowCountySuggestions,
  selectedSubcounty,
  setSelectedSubcounty,
  selectedUnitType,
  setSelectedUnitType,
  favoritesOnly,
  setFavoritesOnly,
  sortBy,
  setSortBy,
  unitTypes,
  onClearFilters,
  setCurrentPage
}: FiltersProps) {
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const matchingCounties = KENYAN_COUNTIES.filter(c => 
    c.name.toLowerCase().includes(countySearchInput.toLowerCase())
  );

  const handleSelectCounty = (countyName: string) => {
    setSelectedCounty(countyName);
    setCountySearchInput(countyName);
    setShowCountySuggestions(false);
    setSelectedSubcounty('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-2xl shadow-sm">
        
        {/* Column 1: Text Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-paper-400 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Search Keywords
          </label>
          <input 
            type="text"
            placeholder="Property, unit label, location..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs text-paper-900 dark:text-white placeholder-paper-400 focus:outline-none focus:border-coral-500"
          />
        </div>

        {/* Column 2: Max Rent Filter (Kes) */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-paper-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-coral-500" /> Max Rent (KSh)
          </label>
          <select
            value={maxRent}
            onChange={e => { setMaxRent(Number(e.target.value)); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
          >
            <option value="0">Any Budget</option>
            <option value="3000">Max KSh 3,000</option>
            <option value="5000">Max KSh 5,000</option>
            <option value="10000">Max KSh 10,000</option>
            <option value="15000">Max KSh 15,000</option>
            <option value="20000">Max KSh 20,000</option>
            <option value="30000">Max KSh 30,000</option>
            <option value="50000">Max KSh 50,000</option>
            <option value="9999999">Above KSh 50,000</option>
          </select>
        </div>

        {/* Column 3: Autocomplete County */}
        <div className="space-y-1.5 relative" ref={suggestionsRef}>
          <label className="text-[10px] uppercase font-bold text-paper-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> County
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search county..."
              value={countySearchInput}
              onFocus={() => setShowCountySuggestions(true)}
              onChange={e => {
                setCountySearchInput(e.target.value);
                setSelectedCounty('');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs text-paper-900 dark:text-white placeholder-paper-400 focus:outline-none focus:border-coral-500"
            />
            {countySearchInput && (
              <button 
                onClick={() => {
                  setSelectedCounty('');
                  setCountySearchInput('');
                  setSelectedSubcounty('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-paper-400 hover:text-coral-500"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {showCountySuggestions && matchingCounties.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl shadow-lg max-h-40 overflow-y-auto z-30 text-xs">
              {matchingCounties.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSelectCounty(c.name)}
                  className="w-full text-left px-3 py-2 hover:bg-paper-100 dark:hover:bg-ink-900 transition-colors text-paper-800 dark:text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 4: Subcounty Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-paper-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Subcounty
          </label>
          <select
            value={selectedSubcounty}
            disabled={!selectedCounty}
            onChange={e => { setSelectedSubcounty(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-xl text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 disabled:opacity-50"
          >
            <option value="">Any Subcounty</option>
            {selectedCounty && 
              KENYAN_COUNTIES.find(c => c.name === selectedCounty)?.subcounties.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))
            }
          </select>
        </div>

      </div>

      {/* Sorting & Filter Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Dynamic Unit Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-paper-400">Unit Type:</span>
            {unitTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => { setSelectedUnitType(type); setCurrentPage(1); }}
                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  selectedUnitType === type 
                    ? 'bg-paper-200 dark:bg-ink-800 text-paper-800 dark:text-white font-bold' 
                    : 'text-paper-500 hover:text-paper-850'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Wishlist only */}
          <button 
            type="button"
            onClick={() => { setFavoritesOnly(!favoritesOnly); setCurrentPage(1); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
              favoritesOnly 
                ? 'bg-coral-500/10 border-coral-500/20 text-coral-500' 
                : 'border-paper-200 dark:border-ink-800 text-paper-400 hover:text-paper-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-coral-500' : ''}`} /> Wishlist
          </button>

          {/* Sort rent */}
          <div className="flex items-center gap-1">
            <span className="text-paper-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg text-[10px] text-paper-900 dark:text-white focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="rentAsc">Rent: Low-High</option>
              <option value="rentDesc">Rent: High-Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
