'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface UnitsFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedHouseType: string;
  onHouseTypeChange: (val: string) => void;
  selectedOccupancy: string;
  onOccupancyChange: (val: string) => void;
  selectedArrears: string;
  onArrearsChange: (val: string) => void;
  houseTypesList: string[];
}

export default function UnitsFilterBar({
  searchQuery,
  onSearchChange,
  selectedHouseType,
  onHouseTypeChange,
  selectedOccupancy,
  onOccupancyChange,
  selectedArrears,
  onArrearsChange,
  houseTypesList
}: UnitsFilterBarProps) {
  return (
    <div className="bg-panel border border-default rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-primary">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Filter className="w-4 h-4 text-coral-500 shrink-0" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider hidden sm:inline">Filters:</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          {/* Housetype filter */}
          <select
            value={selectedHouseType}
            onChange={(e) => onHouseTypeChange(e.target.value)}
            className="bg-raised border border-default rounded px-2.5 py-1.5 text-xs text-primary outline-none focus:border-coral-500"
          >
            <option value="all">All Housetypes</option>
            {houseTypesList.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Occupancy filter */}
          <select
            value={selectedOccupancy}
            onChange={(e) => onOccupancyChange(e.target.value)}
            className="bg-raised border border-default rounded px-2.5 py-1.5 text-xs text-primary outline-none focus:border-coral-500"
          >
            <option value="all">All Occupancies</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>

          {/* Arrears filter */}
          <select
            value={selectedArrears}
            onChange={(e) => onArrearsChange(e.target.value)}
            className="bg-raised border border-default rounded px-2.5 py-1.5 text-xs text-primary outline-none focus:border-coral-500"
          >
            <option value="all">All Balances</option>
            <option value="arrears">Has Arrears</option>
            <option value="no-arrears">No Arrears</option>
          </select>
        </div>
      </div>

      <div className="w-full md:w-64">
        <input
          type="text"
          placeholder="Search by ID, label, tenant..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-raised border border-default rounded px-3 py-1.5 text-xs text-primary outline-none focus:border-coral-500"
        />
      </div>
    </div>
  );
}
