import React from 'react';
import { MapPin, Settings } from 'lucide-react';
import { Property, formatMoney } from '../types';

interface PropertyHeroCardProps {
  property: Property;
  occupancyRate: number;
  totalRentRoll: number;
  avgRent: number;
  totalArrears: number;
  canEdit: boolean;
  onSettingsClick: () => void;
  onSetupClick: () => void;
}

export default function PropertyHeroCard({
  property,
  occupancyRate,
  totalRentRoll,
  avgRent,
  totalArrears,
  canEdit,
  onSettingsClick,
  onSetupClick
}: PropertyHeroCardProps) {
  return (
    <div className="bg-panel border border-default rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row text-primary">
      {/* Image Wrap */}
      <div className="md:w-1/3 h-48 md:h-auto relative bg-raised">
        <img 
          src={property.photoUrl || '/default_apartment.png'} 
          alt={property.name} 
          className="w-full h-full object-cover"
        />
        {property.status === 'pending' && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
            Pending Setup
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="p-6 md:w-2/3 flex flex-col justify-between space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-primary">
              {property.name}
            </h1>
            <button
              onClick={onSettingsClick}
              className="p-1 rounded hover:bg-raised text-secondary hover:text-coral-500 transition-colors"
              title="Edit Property settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${property.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {property.status === 'active' ? 'Active' : 'Pending Configuration'}
            </span>
          </div>
          
          <p className="text-xs text-secondary flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-coral-500 shrink-0" />
            {property.address}
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-subtle">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Total Units</span>
            <span className="text-sm font-bold text-primary mt-0.5">{property.unitsCount}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Occupancy</span>
            <span className="text-sm font-bold text-primary mt-0.5">{occupancyRate}%</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Rent Roll</span>
            <span className="text-sm font-bold text-primary mt-0.5">{formatMoney(totalRentRoll, property.currency)}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Average Rent</span>
            <span className="text-sm font-bold text-primary mt-0.5">{formatMoney(avgRent, property.currency)}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Arrears Balance</span>
            <span className={`text-sm font-bold mt-0.5 ${totalArrears > 0 ? 'text-coral-500 animate-pulse font-extrabold' : 'text-emerald-500'}`}>
              {formatMoney(totalArrears, property.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
