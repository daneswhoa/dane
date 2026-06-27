'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, MapPin, DollarSign, Home, User, Mail, 
  Phone, Calendar, Users, ArrowLeft, Loader2, AlertTriangle, ShieldCheck,
  Settings, Pencil, ArrowRightLeft
} from 'lucide-react';
import { EditPropertyModal } from '../../components/properties/EditPropertyModal';
import { EditUnitModal } from '../../components/properties/EditUnitModal';
import { MoveTenantModal } from '../../components/tenants/MoveTenantModal';

interface Unit {
  id: string;
  label: string;
  rent: number;
  status: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
}

interface Property {
  id: string;
  name: string;
  address: string;
  unitsCount: number;
  status: string;
  photoUrl: string | null;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [movingTenant, setMovingTenant] = useState<{ id: string; name: string; unitLabel: string } | null>(null);

  async function loadProperty() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties/${propertyId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Property asset not found or access denied.');
      const data = await res.json();
      
      setProperty(data.property);
      setUnits(data.units || []);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading property details.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-coral-500 animate-spin mb-2" />
        <p className="text-xs text-paper-500 dark:text-ink-400 font-semibold uppercase tracking-wider">
          Retrieving Property Profile...
        </p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase text-paper-950 dark:text-white">Profile Retrieval Failed</h2>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">{error}</p>
        </div>
        <button 
          onClick={() => router.push('/properties')}
          className="px-4 py-2 bg-coral-500 text-white rounded text-xs font-semibold hover:bg-coral-600 transition-all shadow-sm"
        >
          Return to Portfolio
        </button>
      </div>
    );
  }

  const activeUnits = units.length;
  const occupiedCount = units.filter(u => u.status === 'occupied').length;
  const totalRentRoll = units.reduce((sum, u) => sum + (Number(u.rent) || 0), 0);
  const avgRent = activeUnits > 0 ? Math.round(totalRentRoll / activeUnits) : 0;
  const occupancyRate = activeUnits > 0 ? Math.round((occupiedCount / activeUnits) * 100) : 100;

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white p-4 md:p-8 space-y-6 transition-colors duration-200">
      
      {/* Top action bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={() => router.push('/properties')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-ink-900 border border-paper-250 dark:border-ink-800 text-paper-700 dark:text-ink-200 rounded hover:bg-paper-100 dark:hover:bg-ink-800 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </button>

        {property.status === 'pending' && (
          <button
            onClick={() => router.push(`/properties/${property.id}/setup`)}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded hover:bg-amber-600 transition-all shadow-sm"
          >
            Complete Setup Configuration
          </button>
        )}
      </div>

      {/* Hero Card */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        {/* Photo */}
        <div className="md:w-1/3 h-48 md:h-auto relative bg-paper-100 dark:bg-ink-950">
          <img 
            src={property.photoUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=250'} 
            alt={property.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 md:hidden"></div>
          {property.status === 'pending' && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
              Pending Setup
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="p-6 md:w-2/3 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-paper-950 dark:text-white">
                {property.name}
              </h1>
              <button
                onClick={() => setIsEditPropOpen(true)}
                className="p-1 rounded hover:bg-paper-100 dark:hover:bg-ink-800 text-paper-400 dark:text-ink-400 hover:text-coral-500 transition-colors"
                title="Edit Property & Adjust Rent"
              >
                <Settings className="w-4 h-4" />
              </button>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                Active
              </span>
            </div>
            
            <p className="text-xs text-paper-500 dark:text-ink-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              {property.address}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-paper-150 dark:border-ink-800/80">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Total Units
              </span>
              <span className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">
                {property.unitsCount}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Occupancy Rate
              </span>
              <span className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">
                {occupancyRate}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Monthly Rent Roll
              </span>
              <span className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">
                ${totalRentRoll.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-paper-400 dark:text-ink-500 tracking-wider">
                Average Rent
              </span>
              <span className="text-sm font-bold text-paper-900 dark:text-white mt-0.5">
                ${avgRent.toLocaleString()}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-paper-400 dark:text-ink-500">
          Units Configuration Details
        </h2>

        {units.length === 0 ? (
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg p-6 text-center text-xs text-paper-500 dark:text-ink-400">
            No units configured. Complete setup to generate rental items.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map((unit) => (
              <div 
                key={unit.id}
                className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg p-5 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-paper-150 dark:border-ink-800">
                  <span className="text-xs font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-coral-500" />
                    {unit.label}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    unit.status === 'occupied' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-paper-100 dark:bg-ink-800 text-paper-500 dark:text-ink-400'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                {/* Finance Info */}
                <div className="flex items-center justify-between text-xs text-paper-700 dark:text-ink-300">
                  <span>Monthly Rate:</span>
                  <span className="font-bold text-paper-900 dark:text-white">${Number(unit.rent).toLocaleString()}/mo</span>
                </div>

                {/* Tenant Details */}
                {unit.status === 'occupied' && unit.tenantName ? (
                  <div className="p-3 bg-paper-50 dark:bg-ink-950 rounded-lg space-y-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-paper-600 dark:text-ink-300 font-semibold">
                      <User className="w-3.5 h-3.5 text-coral-500" />
                      <span>{unit.tenantName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-paper-500 dark:text-ink-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{unit.tenantEmail || 'No email saved'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-paper-50 dark:bg-ink-950 rounded-lg text-center text-[10px] text-paper-400 dark:text-ink-500">
                    Unit is currently vacant.
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="pt-2.5 border-t border-paper-150 dark:border-ink-800 flex items-center justify-end gap-2">
                  {unit.status === 'occupied' && unit.tenantId && (
                    <button
                      onClick={() => setMovingTenant({ id: unit.tenantId!, name: unit.tenantName!, unitLabel: unit.label })}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-300 hover:bg-paper-50 dark:hover:bg-ink-800 rounded transition-all"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-coral-500" /> Move Tenant
                    </button>
                  )}
                  <button
                    onClick={() => setEditingUnit(unit)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-ink-300 hover:bg-paper-50 dark:hover:bg-ink-800 rounded transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5 text-coral-500" /> Configure Unit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditPropOpen && (
        <EditPropertyModal
          property={property}
          onClose={() => setIsEditPropOpen(false)}
          onSuccess={() => {
            setIsEditPropOpen(false);
            loadProperty();
          }}
        />
      )}

      {editingUnit && (
        <EditUnitModal
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onSuccess={() => {
            setEditingUnit(null);
            loadProperty();
          }}
        />
      )}

      {movingTenant && (
        <MoveTenantModal
          tenantId={movingTenant.id}
          tenantName={movingTenant.name}
          currentUnitLabel={movingTenant.unitLabel}
          currentPropertyName={property.name}
          onClose={() => setMovingTenant(null)}
          onSuccess={() => {
            setMovingTenant(null);
            loadProperty();
          }}
        />
      )}

    </div>
  );
}
