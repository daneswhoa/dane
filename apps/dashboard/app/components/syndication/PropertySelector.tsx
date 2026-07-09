'use client';

import React from 'react';
import { Home, MapPin, ChevronDown, Check } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  units?: number;
  image?: string;
  occupancy?: string;
}

interface PropertySelectorProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelect: (property: Property) => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedProperty,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative w-full">
      <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2">
        Select Portfolio Asset
      </label>
      
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-xl text-left hover:border-white/20 transition-all shadow-lg"
      >
        {selectedProperty ? (
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={selectedProperty.image || '/default_apartment.png'}
              alt={selectedProperty.name}
              className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{selectedProperty.name}</h4>
              <p className="text-xs text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-coral-500 shrink-0" />
                {selectedProperty.address}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-zinc-500">Choose a property to syndicate...</span>
        )}
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-white/5 animate-fade-in">
          {properties.map((prop) => {
            const isSelected = selectedProperty?.id === prop.id;
            return (
              <button
                key={prop.id}
                onClick={() => {
                  onSelect(prop);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/50 text-left transition-colors ${
                  isSelected ? 'bg-zinc-800/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prop.image || '/default_apartment.png'}
                    alt={prop.name}
                    className="w-10 h-10 object-cover rounded-md border border-white/5 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{prop.name}</h5>
                    <p className="text-[10px] text-zinc-400 truncate flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-coral-500 shrink-0" />
                      {prop.address}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-coral-500 shrink-0 mr-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
