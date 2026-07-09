'use client';

import React from 'react';
import { Map, MapPin, Search, Navigation } from 'lucide-react';

interface MapPinningProps {
  lat: number;
  lng: number;
  address: string;
  notes?: string;
  onChange: (data: { lat: number; lng: number; address: string; notes?: string }) => void;
}

export const MapPinning: React.FC<MapPinningProps> = ({
  lat,
  lng,
  address,
  notes = '',
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = React.useState(address);
  const [loading, setLoading] = React.useState(false);

  // Pre-configured geocoding simulator for key regions (Netherlands & Kenya)
  const geocodeAddress = () => {
    if (!searchQuery) return;
    setLoading(true);

    setTimeout(() => {
      let resolvedLat = lat;
      let resolvedLng = lng;
      
      const q = searchQuery.toLowerCase();
      if (q.includes('amsterdam')) {
        resolvedLat = 52.3676;
        resolvedLng = 4.9041;
      } else if (q.includes('rotterdam')) {
        resolvedLat = 51.9244;
        resolvedLng = 4.4777;
      } else if (q.includes('nairobi')) {
        resolvedLat = -1.2921;
        resolvedLng = 36.8219;
      } else if (q.includes('utrecht')) {
        resolvedLat = 52.0907;
        resolvedLng = 5.1214;
      } else {
        // Random offset for mockup search realism
        resolvedLat = lat + (Math.random() - 0.5) * 0.05;
        resolvedLng = lng + (Math.random() - 0.5) * 0.05;
      }

      onChange({
        lat: Number(resolvedLat.toFixed(5)),
        lng: Number(resolvedLng.toFixed(5)),
        address: searchQuery,
        notes,
      });
      setLoading(false);
    }, 800);
  };

  // Generate OpenStreetMap embedding bbox and parameters
  const bboxRange = 0.005;
  const bboxLeft = lng - bboxRange;
  const bboxBottom = lat - bboxRange;
  const bboxRight = lng + bboxRange;
  const bboxTop = lat + bboxRange;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxLeft}%2C${bboxBottom}%2C${bboxRight}%2C${bboxTop}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Map className="w-4 h-4 text-coral-500" /> Geography & Location Pinning
        </h3>
        <p className="text-xs text-zinc-400">Position the asset using OpenStreetMap geolocation coordinates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left pane: Inputs */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Address Lookup */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
              Physical Location Input
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter address or municipality..."
                className="w-full pl-9 pr-16 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-coral-500"
              />
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={loading}
                className="absolute right-2 top-1.5 px-2.5 py-1 bg-coral-500 hover:bg-coral-600 disabled:bg-zinc-800 text-white font-bold text-[10px] rounded transition-colors"
              >
                {loading ? 'Locating...' : 'Locate'}
              </button>
            </div>
          </div>

          {/* Coordinate Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="0.00001"
                value={lat}
                onChange={(e) =>
                  onChange({ lat: parseFloat(e.target.value) || 0, lng, address, notes })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-coral-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="0.00001"
                value={lng}
                onChange={(e) =>
                  onChange({ lat, lng: parseFloat(e.target.value) || 0, address, notes })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-coral-500"
              />
            </div>
          </div>

          {/* Access Directions Notes */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
              Access instructions & Location Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => onChange({ lat, lng, address, notes: e.target.value })}
              placeholder="e.g. Third gate, keypad pin code required, close to the regional transit terminal..."
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-coral-500"
            />
          </div>
        </div>

        {/* Right pane: OSM Interactive Map Frame */}
        <div className="lg:col-span-2 relative border border-white/10 rounded-xl overflow-hidden shadow-2xl h-64 lg:h-auto min-h-[250px] bg-zinc-950">
          <iframe
            title="OpenStreetMap Location Frame"
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            src={embedUrl}
            className="w-full h-full filter invert hue-rotate-[180deg] brightness-[0.85] contrast-[1.2]"
          />
          
          {/* Geolocation indicator overlays */}
          <div className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur border border-white/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-zinc-300">
            <Navigation className="w-3.5 h-3.5 text-coral-500 animate-pulse" />
            OSM WGS84 COORDINATES
          </div>
        </div>
      </div>
    </div>
  );
};
