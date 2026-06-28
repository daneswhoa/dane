import React from 'react';
import { Building, CheckCircle2, AlertTriangle, ArrowRight, Home, Wrench } from 'lucide-react';

interface PropertyItem {
  propertyId: string;
  name: string;
  address: string;
  photoUrl: string | null;
  unitsCount: number;
  status: 'pending' | 'active';
  units?: any[];
}

interface SophiaPropertyDashboardProps {
  properties: PropertyItem[];
  onSetupProperty?: (propertyId: string) => void;
}

export default function SophiaPropertyDashboard({ properties, onSetupProperty }: SophiaPropertyDashboardProps) {
  const unsetupProperties = properties.filter(p => p.status === 'pending');
  const setupProperties = properties.filter(p => p.status === 'active');

  const getFallbackPhoto = (unitsCount: number) => {
    // Returns default illustration path based on whether it is single or multi-unit
    return unitsCount > 1 
      ? '/default_apartment_1782604553729.png' 
      : '/default_house_1782604541217.png';
  };

  return (
    <div className="space-y-4 my-2 max-w-2xl">
      {/* Pending / Unsetup section */}
      {unsetupProperties.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              Pending Setup ({unsetupProperties.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unsetupProperties.map(prop => (
              <div 
                key={prop.propertyId}
                className="bg-white/60 dark:bg-ink-800/60 border border-amber-500/20 rounded-2xl p-3 flex gap-3 hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-bl-full flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                </div>

                <img 
                  src={prop.photoUrl || getFallbackPhoto(prop.unitsCount)} 
                  alt={prop.name}
                  className="w-14 h-14 object-cover rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-paper-900 dark:text-white truncate pr-4">{prop.name}</h5>
                    <p className="text-[10px] text-paper-400 truncate mt-0.5">{prop.address}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-semibold font-mono text-paper-500 dark:text-ink-300 bg-paper-100 dark:bg-ink-850 px-1.5 py-0.5 rounded">
                      {prop.unitsCount} {prop.unitsCount > 1 ? 'Units' : 'Unit'}
                    </span>
                    
                    {onSetupProperty && (
                      <button
                        onClick={() => onSetupProperty(prop.propertyId)}
                        className="flex items-center gap-1 text-[9px] font-bold text-coral-500 hover:text-coral-650 transition-all font-mono"
                      >
                        SETUP <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active / Fully Setup section */}
      {setupProperties.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              Active Properties ({setupProperties.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {setupProperties.map(prop => (
              <div 
                key={prop.propertyId}
                className="bg-white/60 dark:bg-ink-800/60 border border-paper-200 dark:border-ink-700/50 rounded-2xl p-3 flex gap-3 hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-full flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>

                <img 
                  src={prop.photoUrl || getFallbackPhoto(prop.unitsCount)} 
                  alt={prop.name}
                  className="w-14 h-14 object-cover rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-paper-900 dark:text-white truncate pr-4">{prop.name}</h5>
                    <p className="text-[10px] text-paper-400 truncate mt-0.5">{prop.address}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-semibold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {prop.unitsCount} {prop.unitsCount > 1 ? 'Units' : 'Unit'}
                    </span>
                    <span className="text-[9px] font-bold text-paper-500 dark:text-ink-400 italic">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
