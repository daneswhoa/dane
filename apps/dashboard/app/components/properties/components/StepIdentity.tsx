import React from 'react';
import { Building2 } from 'lucide-react';

interface StepIdentityProps {
  propertyName: string;
  propertyType: string;
  propertyRegion: string;
  currency: string;
  onChangeField: (key: 'propertyName' | 'propertyType' | 'propertyRegion' | 'currency', value: string) => void;
  errors: Record<string, string>;
  limit: number;
}

export function StepIdentity({
  propertyName,
  propertyType,
  propertyRegion,
  currency,
  onChangeField,
  errors,
  limit,
}: StepIdentityProps) {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
          <Building2 className="w-4.5 h-4.5 text-coral-500" /> Property Identity
        </h2>
        <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
          Determine how this asset is classified and named throughout your portfolio database.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Property Name</label>
            <span className="text-[10px] text-paper-400">
              {propertyName.length}/{limit}
            </span>
          </div>
          <input
            type="text"
            maxLength={limit}
            placeholder="e.g. Westside scattered rentals, or Maple Complex"
            value={propertyName}
            onChange={(e) => onChangeField('propertyName', e.target.value)}
            className={`w-full px-3 py-2 text-xs border rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors ${
              errors.propertyName ? 'border-coral-500' : 'border-paper-200 dark:border-ink-700'
            }`}
          />
          {errors.propertyName && (
            <span className="text-[10px] text-coral-500 font-semibold mt-0.5">{errors.propertyName}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Classification</label>
            <select
              value={propertyType}
              onChange={(e) => onChangeField('propertyType', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-700 rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors"
            >
              <option>Multi-Family</option>
              <option>Single Family</option>
              <option>Commercial/Loft</option>
              <option>Condominium</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Region</label>
            <select
              value={propertyRegion}
              onChange={(e) => onChangeField('propertyRegion', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-700 rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors"
            >
              <option>Downtown</option>
              <option>North District</option>
              <option>Industrial Dist.</option>
              <option>Eastside</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Currency</label>
          <select
            value={currency}
            onChange={(e) => onChangeField('currency', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-700 rounded-lg bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="KES">Kenyan Shilling (KES)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
