import React from 'react';
import { Home, User, AlertTriangle, ArrowRightLeft, Pencil, UserPlus } from 'lucide-react';
import { formatMoney } from '../types';

interface Unit {
  id: string;
  label: string;
  rent: number;
  status: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
  floor: string | null;
  unitType: string | null;
  arrears: number | null;
  deposit?: number | null;
}

interface FloorVisualizationProps {
  sortedFloors: string[];
  unitsByFloor: Record<string, Unit[]>;
  onInspect: (unit: Unit) => void;
  onMoveClient: (unit: Unit) => void;
  onMoveTenant: (unit: Unit) => void;
  onConfigure: (unit: Unit) => void;
  canEdit: boolean;
  canManageLeases: boolean;
  propertyCurrency?: string;
}

export default function FloorVisualization({
  sortedFloors,
  unitsByFloor,
  onInspect,
  onMoveClient,
  onMoveTenant,
  onConfigure,
  canEdit,
  canManageLeases,
  propertyCurrency
}: FloorVisualizationProps) {
  return (
    <div className="space-y-8 text-primary">
      {sortedFloors.length === 0 ? (
        <div className="bg-panel border border-default rounded-xl p-8 text-center text-xs text-secondary font-medium">
          No matching units or house configurations found under current filters.
        </div>
      ) : (
        sortedFloors.map(floorLabel => (
          <div 
            key={floorLabel}
            className="bg-panel border border-default rounded-xl p-5 shadow-sm space-y-4"
          >
            {/* Floor Header */}
            <div className="flex items-center justify-between border-b border-subtle pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-coral-500/10 text-coral-500 text-xs font-bold uppercase tracking-wider">
                  {floorLabel}
                </span>
                <span className="text-[10px] text-secondary">
                  ({unitsByFloor[floorLabel].length} unit{unitsByFloor[floorLabel].length > 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Units Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unitsByFloor[floorLabel].map(unit => {
                const hasArrears = Number(unit.arrears || 0) > 0;
                return (
                  <div 
                    key={unit.id}
                    onClick={() => onInspect(unit)}
                    className={`group relative rounded-xl p-4 border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[170px] ${
                      unit.status === 'occupied' 
                        ? hasArrears 
                          ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/40 hover:border-red-500/80 shadow-md shadow-red-500/5' 
                          : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/70 shadow-sm'
                        : 'bg-panel hover:bg-raised border-dashed border-default hover:border-coral-500/50 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Unit Title and ID */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                            <Home className={`w-3.5 h-3.5 ${unit.status === 'occupied' ? (hasArrears ? 'text-red-500 animate-pulse' : 'text-emerald-500') : 'text-muted'}`} />
                            {unit.label}
                          </h3>
                          <p className="text-[9px] text-muted font-mono mt-0.5">
                            ID: {unit.id}
                          </p>
                        </div>
                        
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          unit.status === 'occupied' 
                            ? hasArrears 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-raised text-secondary'
                        }`}>
                          {unit.status === 'occupied' ? (hasArrears ? 'Arrears' : 'Occupied') : 'Vacant'}
                        </span>
                      </div>

                      {/* Unit details */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted">Rent Rate:</span>
                          <span className="font-semibold text-primary">{formatMoney(Number(unit.rent), propertyCurrency)}/mo</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted">Housetype:</span>
                          <span className="px-1.5 py-0.2 bg-raised rounded text-[9px] text-secondary">
                            {unit.unitType || 'Standard'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted">Deposit:</span>
                          {unit.deposit === undefined || unit.deposit === null || Number(unit.deposit) === 0 ? (
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold">
                              Waived
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold">
                              {formatMoney(Number(unit.deposit), propertyCurrency)}
                            </span>
                          )}
                        </div>

                        {/* Occupant Detail */}
                        {unit.status === 'occupied' && unit.tenantName ? (
                          <div className="pt-2 border-t border-subtle flex items-center gap-1.5 text-[10px] text-secondary font-medium truncate">
                            <User className="w-3 h-3 text-coral-500 shrink-0" />
                            <span className="truncate">{unit.tenantName}</span>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-dashed border-subtle text-[10px] text-muted italic">
                            Ready for move-in
                          </div>
                        )}

                        {/* Arrears Badge */}
                        {hasArrears && (
                          <div className="flex items-center gap-1 text-[10px] text-red-500 font-semibold animate-pulse mt-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Arrears: {formatMoney(Number(unit.arrears), propertyCurrency)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="mt-4 pt-2.5 border-t border-subtle flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspect(unit);
                        }}
                        className="text-[10px] font-bold text-coral-500 hover:underline"
                      >
                        Inspect
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        {unit.status === 'vacant' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveClient(unit);
                            }}
                            className="flex items-center gap-0.5 px-2 py-0.8 bg-coral-500 hover:bg-coral-600 active:scale-95 text-white rounded text-[9px] font-bold shadow-sm transition-all"
                          >
                            <UserPlus className="w-2.5 h-2.5" /> Move Client Here
                          </button>
                        ) : (
                          unit.tenantId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!canManageLeases) {
                                  onMoveTenant(unit); // Will trigger permission error in parent
                                } else {
                                  onMoveTenant(unit);
                                }
                              }}
                              className="flex items-center gap-0.5 px-2 py-0.8 bg-raised hover:bg-panel text-secondary rounded text-[9px] font-bold border border-default transition-all"
                            >
                              <ArrowRightLeft className="w-2.5 h-2.5 text-coral-500" /> Move Tenant
                            </button>
                          )
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canEdit) {
                              onConfigure(unit); // Will trigger permission error in parent
                            } else {
                              onConfigure(unit);
                            }
                          }}
                          className="px-1.5 py-0.8 rounded hover:bg-raised text-muted hover:text-coral-500 transition-colors"
                          title="Configure Unit Rate/Details"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
