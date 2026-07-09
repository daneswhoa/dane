'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { EditPropertyModal } from '../../components/properties/EditPropertyModal';
import { EditUnitModal } from '../../components/properties/EditUnitModal';
import { MoveTenantModal } from '../../components/tenants/MoveTenantModal';
import { usePermissionsStore } from '../../store/usePermissionsStore';
import { AccessDeniedOverlay } from '../../components/team/AccessDeniedOverlay';

// Import split components
import PropertyHeroCard from './components/PropertyHeroCard';
import UnitsFilterBar from './components/UnitsFilterBar';
import FloorVisualization from './components/FloorVisualization';
import UnitInspectorDrawer from './components/UnitInspectorDrawer';
import MoveClientHereModal from './components/MoveClientHereModal';

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
  moveInFees?: number | null;
  recurringFees?: number | null;
  moveInFeeDetails?: string | null;
  recurringFeeDetails?: string | null;
}

interface Property {
  id: string;
  name: string;
  address: string;
  unitsCount: number;
  status: string;
  photoUrl: string | null;
  currency?: string;
}

export default function PropertyDetailPage() {
  const { checkPermission } = usePermissionsStore();
  const canView = checkPermission('Properties', 'View Properties');
  const canEdit = checkPermission('Properties', 'Edit');
  const canManageLeases = checkPermission('Tenants', 'Manage Leases');

  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouseType, setSelectedHouseType] = useState('all');
  const [selectedOccupancy, setSelectedOccupancy] = useState('all');
  const [selectedArrears, setSelectedArrears] = useState('all');

  // Modals & Panels state
  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [movingTenant, setMovingTenant] = useState<{ id: string; name: string; unitLabel: string } | null>(null);
  const [deniedAction, setDeniedAction] = useState<string | null>(null);

  // Inspector Drawer State
  const [selectedUnitForInspect, setSelectedUnitForInspect] = useState<Unit | null>(null);

  // Move Client Here Modal State
  const [isMoveClientHereOpen, setIsMoveClientHereOpen] = useState(false);
  const [targetVacantUnit, setTargetVacantUnit] = useState<Unit | null>(null);

  async function loadProperty() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties/${propertyId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Property asset not found or access denied.');
      const data = await res.json();
      
      setProperty(data.property);
      setUnits(data.units || []);
      
      // Update selected unit for inspect to sync details if open
      if (selectedUnitForInspect) {
        const updatedUnit = (data.units || []).find((u: Unit) => u.id === selectedUnitForInspect.id);
        if (updatedUnit) setSelectedUnitForInspect(updatedUnit);
      }
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

  if (!canView) {
    return <AccessDeniedOverlay moduleName="Properties" actionName="View Properties" />;
  }

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

  // Derived metrics
  const activeUnits = units.length;
  const occupiedCount = units.filter(u => u.status === 'occupied').length;
  const totalRentRoll = units.reduce((sum, u) => sum + (Number(u.rent) || 0), 0);
  const avgRent = activeUnits > 0 ? Math.round(totalRentRoll / activeUnits) : 0;
  const occupancyRate = activeUnits > 0 ? Math.round((occupiedCount / activeUnits) * 100) : 100;
  const totalArrears = units.reduce((sum, u) => sum + (Number(u.arrears || 0) || 0), 0);

  // Dynamic filter values
  const houseTypesList = Array.from(new Set(units.map(u => u.unitType || 'Standard')));

  // Filtering logic
  const filteredUnits = units.filter(unit => {
    const matchesSearch = 
      unit.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.tenantName && unit.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (unit.tenantEmail && unit.tenantEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedHouseType === 'all' || (unit.unitType || 'Standard') === selectedHouseType;
    
    const matchesOccupancy = 
      selectedOccupancy === 'all' || 
      (selectedOccupancy === 'occupied' && unit.status === 'occupied') ||
      (selectedOccupancy === 'vacant' && unit.status === 'vacant');

    const matchesArrears = 
      selectedArrears === 'all' ||
      (selectedArrears === 'arrears' && Number(unit.arrears || 0) > 0) ||
      (selectedArrears === 'no-arrears' && Number(unit.arrears || 0) === 0);

    return matchesSearch && matchesType && matchesOccupancy && matchesArrears;
  });

  // Group units by floor
  const unitsByFloor: Record<string, Unit[]> = {};
  filteredUnits.forEach(unit => {
    const floorLabel = unit.floor && unit.floor.trim() !== '' ? `Floor ${unit.floor}` : 'Ground Floor';
    if (!unitsByFloor[floorLabel]) {
      unitsByFloor[floorLabel] = [];
    }
    unitsByFloor[floorLabel].push(unit);
  });

  // Sort floors descending
  const sortedFloors = Object.keys(unitsByFloor).sort((a, b) => {
    if (a === 'Ground Floor') return 1;
    if (b === 'Ground Floor') return -1;
    
    const numA = parseInt(a.replace(/^\D+/g, '')) || 0;
    const numB = parseInt(b.replace(/^\D+/g, '')) || 0;
    return numB - numA;
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in relative text-paper-900 dark:text-white transition-colors duration-200">
        {deniedAction && (
          <AccessDeniedOverlay 
            moduleName="Properties" 
            actionName={deniedAction} 
            onClose={() => setDeniedAction(null)} 
          />
        )}
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => router.push('/properties')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 rounded hover:bg-paper-100 dark:hover:bg-ink-750 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-coral-500" /> Back to Portfolio
          </button>

          {property.status === 'pending' && (
            <button
              onClick={() => {
                if (!canEdit) {
                  setDeniedAction('Edit');
                } else {
                  router.push(`/properties/${property.id}/setup`);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded hover:bg-amber-600 transition-all shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Complete Setup Configuration
            </button>
          )}
        </div>

        {/* Hero Card Component */}
        <PropertyHeroCard 
          property={property}
          occupancyRate={occupancyRate}
          totalRentRoll={totalRentRoll}
          avgRent={avgRent}
          totalArrears={totalArrears}
          canEdit={canEdit}
          onSettingsClick={() => {
            if (!canEdit) setDeniedAction('Edit');
            else setIsEditPropOpen(true);
          }}
          onSetupClick={() => router.push(`/properties/${property.id}/setup`)}
        />

        {/* Filter Bar Component */}
        <UnitsFilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedHouseType={selectedHouseType}
          onHouseTypeChange={setSelectedHouseType}
          selectedOccupancy={selectedOccupancy}
          onOccupancyChange={setSelectedOccupancy}
          selectedArrears={selectedArrears}
          onArrearsChange={setSelectedArrears}
          houseTypesList={houseTypesList}
        />

        {/* Floor Visualization Map */}
        <FloorVisualization 
          sortedFloors={sortedFloors}
          unitsByFloor={unitsByFloor}
          onInspect={setSelectedUnitForInspect}
          onMoveClient={(unit) => {
            setTargetVacantUnit(unit);
            setIsMoveClientHereOpen(true);
          }}
          onMoveTenant={(unit) => {
            if (!canManageLeases) setDeniedAction('Manage Leases');
            else setMovingTenant({ id: unit.tenantId!, name: unit.tenantName!, unitLabel: unit.label });
          }}
          onConfigure={(unit) => {
            if (!canEdit) setDeniedAction('Edit');
            else setEditingUnit(unit);
          }}
          canEdit={canEdit}
          canManageLeases={canManageLeases}
          propertyCurrency={property.currency}
        />

        {/* Detail Inspection Drawer Overlay */}
        {selectedUnitForInspect && (
          <UnitInspectorDrawer 
            unit={selectedUnitForInspect}
            propertyId={propertyId}
            onClose={() => setSelectedUnitForInspect(null)}
            onRefresh={loadProperty}
            onMoveClientClick={() => {
              setTargetVacantUnit(selectedUnitForInspect);
              setIsMoveClientHereOpen(true);
            }}
            propertyCurrency={property.currency}
          />
        )}

        {/* Move Client Here Modal Overlay */}
        {isMoveClientHereOpen && targetVacantUnit && (
          <MoveClientHereModal 
            targetVacantUnit={targetVacantUnit}
            onClose={() => {
              setIsMoveClientHereOpen(false);
              setTargetVacantUnit(null);
            }}
            onSuccess={() => {
              setIsMoveClientHereOpen(false);
              setTargetVacantUnit(null);
              loadProperty();
            }}
          />
        )}

        {/* Edit Property Settings Modal */}
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

        {/* Configure Unit Modal */}
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

        {/* Move Existing Tenant Modal */}
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
    </DashboardLayout>
  );
}
