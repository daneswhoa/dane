'use client';

import React from 'react';
import { Wifi, Sun, Thermometer, Wind, Trash2, Car, Sparkles, Droplets } from 'lucide-react';

interface UtilitySelectorProps {
  selectedUtilities: string[];
  onChange: (utilities: string[]) => void;
}

interface UtilityItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

const UTILITY_OPTIONS: UtilityItem[] = [
  { id: 'wifi', name: 'High-speed Wi-Fi', description: 'Fiber broadband connectivity throughout the unit.', icon: Wifi },
  { id: 'solar', name: 'Solar Panels', description: 'Fitted with green photovoltaic grid setups.', icon: Sun },
  { id: 'heating', name: 'Central Heating', description: 'Fully regulated boilers and radiators.', icon: Thermometer },
  { id: 'ac', name: 'Air Conditioning', description: 'Independently controlled cooling units.', icon: Wind },
  { id: 'garbage', name: 'Waste Disposal', description: 'Regular municipal waste pick-ups included.', icon: Trash2 },
  { id: 'parking', name: 'Secure Parking', description: 'Assigned indoor or gated surface parking spaces.', icon: Car },
  { id: 'laundry', name: 'Laundry Rooms', description: 'Access to common or private washer/dryer facilities.', icon: Sparkles },
  { id: 'water', name: 'Water Reservoir', description: 'Borehole backup or high capacity mains connection.', icon: Droplets },
];

export const UtilitySelector: React.FC<UtilitySelectorProps> = ({
  selectedUtilities,
  onChange,
}) => {
  const toggleUtility = (id: string) => {
    if (selectedUtilities.includes(id)) {
      onChange(selectedUtilities.filter((u) => u !== id));
    } else {
      onChange([...selectedUtilities, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-coral-500" /> Amenities & Utilities Config
        </h3>
        <p className="text-xs text-zinc-400">Toggle amenities included in the syndicated lease listing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {UTILITY_OPTIONS.map((util) => {
          const isSelected = selectedUtilities.includes(util.id);
          const IconComp = util.icon;

          return (
            <button
              key={util.id}
              type="button"
              onClick={() => toggleUtility(util.id)}
              className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between h-36 ${
                isSelected
                  ? 'bg-coral-500/10 border-coral-500/40 text-white shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20 hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isSelected
                      ? 'bg-coral-500/25 border-coral-500/30 text-coral-500'
                      : 'bg-zinc-800 border-white/5 text-zinc-400'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                
                {/* Custom toggle circle indicator */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-coral-500 border-coral-400'
                      : 'border-white/25 bg-transparent'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                </div>
              </div>

              <div>
                <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                  {util.name}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                  {util.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
