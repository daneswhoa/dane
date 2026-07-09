'use client';

import React from 'react';
import { FileText, DollarSign, Calendar, Heart } from 'lucide-react';

interface Conditions {
  leaseType: 'rent' | 'buy';
  rentAmount: number;
  depositAmount: number;
  minLeaseMonths: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
}

interface ConditionsEditorProps {
  conditions: Conditions;
  onChange: (conditions: Conditions) => void;
}

export const ConditionsEditor: React.FC<ConditionsEditorProps> = ({
  conditions,
  onChange,
}) => {
  const updateField = <K extends keyof Conditions>(key: K, value: Conditions[K]) => {
    onChange({
      ...conditions,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-coral-500" /> Terms, Price & Rules Configuration
        </h3>
        <p className="text-xs text-zinc-400">Configure financial demands and tenant criteria for syndication.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Deal Configuration */}
        <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-4">
          <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-coral-400" /> Listing Pricing
          </h4>

          {/* Lease Type Toggles */}
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
              Listing Category
            </label>
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => updateField('leaseType', 'rent')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                  conditions.leaseType === 'rent'
                    ? 'bg-coral-500 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                To Rent
              </button>
              <button
                type="button"
                onClick={() => updateField('leaseType', 'buy')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                  conditions.leaseType === 'buy'
                    ? 'bg-coral-500 text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                For Sale
              </button>
            </div>
          </div>

          {/* Rent/Sale Amount */}
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
              {conditions.leaseType === 'rent' ? 'Monthly Rent Rate ($)' : 'Listing Price ($)'}
            </label>
            <input
              type="number"
              value={conditions.rentAmount || ''}
              onChange={(e) => updateField('rentAmount', Number(e.target.value) || 0)}
              placeholder="e.g. 1500"
              className="w-full px-3 py-2 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-coral-500"
            />
          </div>

          {/* Deposit Amount (Rent only) */}
          {conditions.leaseType === 'rent' && (
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                Security Deposit Required ($)
              </label>
              <input
                type="number"
                value={conditions.depositAmount || ''}
                onChange={(e) => updateField('depositAmount', Number(e.target.value) || 0)}
                placeholder="e.g. 3000"
                className="w-full px-3 py-2 bg-zinc-950 border border-white/5 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-coral-500"
              />
            </div>
          )}
        </div>

        {/* Calendar / Duration configuration */}
        <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-4">
          <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-coral-400" /> Duration Details
          </h4>

          {/* Min Lease Months */}
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
              {conditions.leaseType === 'rent' ? 'Minimum Lease Duration (Months)' : 'Expected Completion Delay (Months)'}
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="24"
                value={conditions.minLeaseMonths}
                onChange={(e) => updateField('minLeaseMonths', Number(e.target.value))}
                className="w-full accent-coral-500 bg-zinc-950 rounded-lg h-2"
              />
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span>1 month</span>
                <span className="text-xs font-bold text-coral-400 bg-coral-500/10 border border-coral-500/20 px-2 py-0.5 rounded">
                  {conditions.minLeaseMonths} Months
                </span>
                <span>24 months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant/User Rules checklists */}
        <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-4">
          <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-coral-400" /> Regulations & Tenancy Rules
          </h4>

          <div className="space-y-4 pt-2">
            {/* Pets switch */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Animal Friendliness</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Allow domestic pets inside units.</p>
              </div>
              <button
                type="button"
                onClick={() => updateField('petsAllowed', !conditions.petsAllowed)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                  conditions.petsAllowed ? 'bg-coral-500' : 'bg-zinc-955 bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    conditions.petsAllowed ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Smoking switch */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Smoking Allowance</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Permit smoking inside lease boundaries.</p>
              </div>
              <button
                type="button"
                onClick={() => updateField('smokingAllowed', !conditions.smokingAllowed)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                  conditions.smokingAllowed ? 'bg-coral-500' : 'bg-zinc-955 bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    conditions.smokingAllowed ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
