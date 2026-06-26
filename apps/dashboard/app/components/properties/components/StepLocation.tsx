import React from 'react';
import { MapPin } from 'lucide-react';

interface StepLocationProps {
  propertyAddress: string;
  taxId: string;
  constructionYear: string;
  mapLatitude: string;
  mapLongitude: string;
  onChangeField: (key: 'propertyAddress' | 'taxId' | 'constructionYear' | 'mapLatitude' | 'mapLongitude', value: string) => void;
  errors: Record<string, string>;
  limit: number;
}

export function StepLocation({
  propertyAddress,
  taxId,
  constructionYear,
  mapLatitude,
  mapLongitude,
  onChangeField,
  errors,
  limit,
}: StepLocationProps) {
  return (
    <div className="space-y-5 animate-slide-in">
      <div>
        <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
          <MapPin className="w-4.5 h-4.5 text-coral-500" /> Location & Map Coordinates
        </h2>
        <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
          Specify geography and billing info. Maps help local maintenance routing logic.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Full Physical Address</label>
            <span className="text-[10px] text-paper-400">
              {propertyAddress.length}/{limit}
            </span>
          </div>
          <input
            type="text"
            maxLength={limit}
            placeholder="e.g. 12 Elm St, Industrial Dist., Metro City"
            value={propertyAddress}
            onChange={(e) => onChangeField('propertyAddress', e.target.value)}
            className={`w-full px-3 py-2 text-xs border rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors ${
              errors.propertyAddress ? 'border-coral-500' : 'border-paper-200 dark:border-ink-700'
            }`}
          />
          {errors.propertyAddress && (
            <span className="text-[10px] text-coral-500 font-semibold mt-0.5">{errors.propertyAddress}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Property Tax ID</label>
            <input
              type="text"
              placeholder="e.g. NL-908A-88"
              value={taxId}
              onChange={(e) => onChangeField('taxId', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-700 rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Construction Year</label>
            <input
              type="text"
              placeholder="e.g. 2012"
              value={constructionYear}
              onChange={(e) => onChangeField('constructionYear', e.target.value)}
              className={`w-full px-3 py-2 text-xs border rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 ${
                errors.constructionYear ? 'border-coral-500' : 'border-paper-200 dark:border-ink-700'
              }`}
            />
            {errors.constructionYear && (
              <span className="text-[10px] text-coral-500 font-semibold mt-0.5">{errors.constructionYear}</span>
            )}
          </div>
        </div>

        {/* GPS Map Pinning */}
        <div className="bg-paper-50 dark:bg-ink-900/50 border border-paper-200 dark:border-ink-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-paper-800 dark:text-ink-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coral-500" /> GPS Map Pinning
            </span>
            <span className="text-[10px] text-paper-400">Click map preview to pin location</span>
          </div>

          <div className="relative h-28 bg-paper-200 dark:bg-ink-950 rounded-lg overflow-hidden flex items-center justify-center border border-paper-200 dark:border-ink-800">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }}
            ></div>
            <div className="relative text-center pointer-events-none z-10 space-y-1">
              <MapPin className="w-6 h-6 text-coral-500 mx-auto animate-bounce" />
              <span className="text-[9px] font-mono text-paper-500 dark:text-ink-400 block">
                {mapLatitude}, {mapLongitude}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <span className="text-[9px] uppercase font-bold text-paper-400 block">Latitude</span>
              <input
                type="text"
                value={mapLatitude}
                onChange={(e) => onChangeField('mapLatitude', e.target.value)}
                className="w-full mt-0.5 bg-white dark:bg-ink-900 px-2.5 py-1 text-xs border border-paper-200 dark:border-ink-700 rounded font-mono"
              />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-paper-400 block">Longitude</span>
              <input
                type="text"
                value={mapLongitude}
                onChange={(e) => onChangeField('mapLongitude', e.target.value)}
                className="w-full mt-0.5 bg-white dark:bg-ink-900 px-2.5 py-1 text-xs border border-paper-200 dark:border-ink-700 rounded font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
