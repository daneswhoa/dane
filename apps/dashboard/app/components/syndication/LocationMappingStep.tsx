import React from 'react';
import { Loader, Map } from 'lucide-react';
import KENYAN_COUNTIES from './kenyan_counties.json';
import { COUNTY_COORDINATES } from './types';

interface LocationMappingStepProps {
  countySearchInput: string;
  setCountySearchInput: (v: string) => void;
  showCountySuggestions: boolean;
  setShowCountySuggestions: (v: boolean) => void;
  countySuggestionsRef: React.RefObject<HTMLDivElement | null>;
  county: string;
  setCounty: (v: string) => void;
  subcounty: string;
  setSubcounty: (v: string) => void;
  latitude: number;
  setLatitude: (v: number) => void;
  longitude: number;
  setLongitude: (v: number) => void;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  mapLoaded: boolean;
  filteredCountySuggestions: typeof KENYAN_COUNTIES;
  handleSelectCounty: (countyName: string) => void;
}

export const LocationMappingStep: React.FC<LocationMappingStepProps> = ({
  countySearchInput,
  setCountySearchInput,
  showCountySuggestions,
  setShowCountySuggestions,
  countySuggestionsRef,
  county,
  setCounty,
  subcounty,
  setSubcounty,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  mapContainerRef,
  mapLoaded,
  filteredCountySuggestions,
  handleSelectCounty,
}) => {
  return (
    <div className="space-y-4">
      {/* County Selection */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1 relative" ref={countySuggestionsRef}>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Kenyan County</label>
          <input
            type="text"
            value={countySearchInput}
            onChange={(e) => {
              setCountySearchInput(e.target.value);
              setShowCountySuggestions(true);
              const found = KENYAN_COUNTIES.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
              if (found) {
                setCounty(found.name);
                const subList = found.subcounties || [];
                setSubcounty(subList[0] || '');
                const coords = COUNTY_COORDINATES[found.name];
                if (coords) {
                  setLatitude(coords.lat);
                  setLongitude(coords.lng);
                }
              }
            }}
            onFocus={() => setShowCountySuggestions(true)}
            placeholder="Search County (e.g. Nairobi)"
            className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
          />
          {showCountySuggestions && filteredCountySuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-[var(--bg-panel)] border border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredCountySuggestions.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => handleSelectCounty(c.name)}
                  className="w-full text-left px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-raised)] hover:text-coral-500 transition-colors border-b border-subtle/50 last:border-b-0"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Sub-County</label>
          <select
            value={subcounty}
            onChange={(e) => setSubcounty(e.target.value)}
            className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
          >
            {(KENYAN_COUNTIES.find(c => c.name === county)?.subcounties || []).map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* OpenStreetMap Map Selection Widget */}
      <div className="space-y-2 bg-[var(--bg-raised)] p-4 border border-subtle rounded-xl">
        <div className="flex justify-between items-center border-b border-subtle pb-2 mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            <Map className="w-3.5 h-3.5 text-coral-500" /> OpenStreetMap Interactive Pinner
          </label>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">Click Map or Drag Pin</span>
        </div>

        {/* Interactive OSM Container */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[280px] bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden relative z-10"
          style={{ minHeight: '280px' }}
        >
          {!mapLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 z-20 text-xs text-[var(--text-muted)] space-y-1">
              <Loader className="w-6 h-6 animate-spin text-coral-500" />
              <span>Loading interactive OSM map...</span>
            </div>
          )}
        </div>

        {/* Coordinates Inputs Display */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-2">
          <div className="space-y-1">
            <label className="text-[10px] text-[var(--text-muted)] font-semibold">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(Number(Number(e.target.value).toFixed(5)))}
              className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[var(--text-muted)] font-semibold">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(Number(Number(e.target.value).toFixed(5)))}
              className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
