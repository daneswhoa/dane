import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Trash2, AlertTriangle, Building2, 
  UserCheck, UserMinus, DollarSign, Wallet, Pencil, X, 
  Calendar, ShieldAlert, Layers
} from 'lucide-react';

interface KinDetail {
  name: string;
  phone: string;
  relation: string;
}

interface UnitRow {
  unitId: string;
  unitName: string;
  floor: string;
  unitType: string;
  rent: string;
  deposit: string;
  moveInFees: string;
  recurringFees: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  arrears: string;
  kins?: KinDetail[];
  tenantIdNumber?: string;
}

interface StepGridEditorProps {
  units: UnitRow[];
  setupMode: 'single' | 'multi';
  onAddManualUnit: () => void;
  onRemoveUnit: (index: number) => void;
  onUpdateUnitRow: (index: number, key: keyof UnitRow, value: any) => void;
  currency?: string;
}

function getCurrencySymbol(currency?: string) {
  switch (currency?.toUpperCase()) {
    case 'KES': return 'KES ';
    case 'EUR': return '€';
    case 'USD': return '$';
    default: return '$';
  }
}

export function StepGridEditor({
  units,
  setupMode,
  onAddManualUnit,
  onRemoveUnit,
  onUpdateUnitRow,
  currency,
}: StepGridEditorProps) {
  const symbol = getCurrencySymbol(currency);
  const hasHighArrears = units.some((u) => Number(u.arrears) > 1000);

  // Financial aggregates
  const totalUnits = units.length;
  const totalOccupied = units.filter((u) => u.tenantName.trim().length > 0).length;
  const totalVacant = totalUnits - totalOccupied;
  const totalMonthlyRent = units.reduce((sum, u) => sum + (Number(u.rent) || 0), 0);
  const totalArrears = units.reduce((sum, u) => sum + (Number(u.arrears) || 0), 0);

  // Modal Editing State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localUnit, setLocalUnit] = useState<UnitRow | null>(null);

  // Fee lists state for the modal
  const [moveInList, setMoveInList] = useState<{name: string, amount: string}[]>([]);
  const [recurringList, setRecurringList] = useState<{name: string, amount: string}[]>([]);

  // Deposit Multiplier State inside Modal
  const [depMult, setDepMult] = useState<'1x' | '2x' | '3x' | 'custom'>('1x');
  const [customDepVal, setCustomDepVal] = useState('0');

  const openEditModal = (idx: number) => {
    const unit = units[idx];
    setEditingIndex(idx);
    setLocalUnit({
      ...unit,
      kins: unit.kins || [{ name: '', phone: '', relation: '' }],
      tenantIdNumber: unit.tenantIdNumber || '',
    });

    // Simple parse of other move-in fees and recurring fees if they exist or defaults
    // Since moveInFees/recurringFees represents total sum, we can let user add specific breakdown.
    // We'll initialize with basic breakdown:
    setMoveInList([
      { name: 'Admin Fee', amount: '0' },
      { name: 'Key Deposit', amount: '0' }
    ]);
    setRecurringList([
      { name: 'Garbage collection', amount: '10' },
      { name: 'Parking space', amount: '0' }
    ]);
    setDepMult('1x');
    setCustomDepVal(unit.deposit || '0');
  };

  const addMoveInFee = () => {
    setMoveInList([...moveInList, { name: '', amount: '0' }]);
  };

  const removeMoveInFee = (i: number) => {
    setMoveInList(moveInList.filter((_, idx) => idx !== i));
  };

  const updateMoveInFee = (i: number, key: 'name' | 'amount', val: string) => {
    const updated = [...moveInList];
    updated[i] = { ...updated[i], [key]: val };
    setMoveInList(updated);
  };

  const addRecurringFee = () => {
    setRecurringList([...recurringList, { name: '', amount: '0' }]);
  };

  const removeRecurringFee = (i: number) => {
    setRecurringList(recurringList.filter((_, idx) => idx !== i));
  };

  const updateRecurringFee = (i: number, key: 'name' | 'amount', val: string) => {
    const updated = [...recurringList];
    updated[i] = { ...updated[i], [key]: val };
    setRecurringList(updated);
  };

  const handleSaveModal = () => {
    if (editingIndex === null || !localUnit) return;

    // Calculate deposits and move-in/recurring totals
    const rentNum = parseFloat(localUnit.rent) || 0;
    let finalDeposit = rentNum;
    if (depMult === '2x') finalDeposit = rentNum * 2;
    else if (depMult === '3x') finalDeposit = rentNum * 3;
    else if (depMult === 'custom') finalDeposit = parseFloat(customDepVal) || 0;

    const extraMoveIn = moveInList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const finalMoveIn = finalDeposit + extraMoveIn;

    const extraRecurring = recurringList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const finalRecurring = rentNum + extraRecurring;

    // Update parent state fields
    onUpdateUnitRow(editingIndex, 'unitId', localUnit.unitId);
    onUpdateUnitRow(editingIndex, 'unitName', localUnit.unitName);
    onUpdateUnitRow(editingIndex, 'floor', localUnit.floor);
    onUpdateUnitRow(editingIndex, 'unitType', localUnit.unitType);
    onUpdateUnitRow(editingIndex, 'rent', localUnit.rent);
    onUpdateUnitRow(editingIndex, 'deposit', finalDeposit.toString());
    onUpdateUnitRow(editingIndex, 'moveInFees', finalMoveIn.toString());
    onUpdateUnitRow(editingIndex, 'recurringFees', finalRecurring.toString());
    onUpdateUnitRow(editingIndex, 'tenantName', localUnit.tenantName);
    onUpdateUnitRow(editingIndex, 'tenantEmail', localUnit.tenantEmail);
    onUpdateUnitRow(editingIndex, 'tenantPhone', localUnit.tenantPhone);
    onUpdateUnitRow(editingIndex, 'moveInDate', localUnit.moveInDate);
    onUpdateUnitRow(editingIndex, 'arrears', localUnit.arrears);
    onUpdateUnitRow(editingIndex, 'kins', localUnit.kins);
    onUpdateUnitRow(editingIndex, 'tenantIdNumber', localUnit.tenantIdNumber);

    setEditingIndex(null);
    setLocalUnit(null);
  };

  return (
    <div className="space-y-6 animate-slide-in w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
            <CheckSquare className="w-4.5 h-4.5 text-coral-500" /> Interactive Layout Editor
          </h2>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            Review, add, delete, or fine-tune individual units, rents, recurring costs, and active tenant details.
          </p>
        </div>
        {setupMode === 'multi' && (
          <button
            onClick={onAddManualUnit}
            className="flex items-center gap-1.5 px-4 py-2 bg-coral-500 text-white text-xs font-bold rounded-lg hover:bg-coral-600 transition-all shadow-md shadow-coral-500/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Unit
          </button>
        )}
      </div>

      {/* Roster Live Aggregates Header Card */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-paper-50 dark:bg-ink-900/40 p-4 rounded-2xl border border-paper-200 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 flex items-center justify-center text-coral-500">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-paper-400 font-bold block">Total Units</span>
            <span className="text-sm font-bold text-paper-900 dark:text-white">{totalUnits}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-250 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-paper-400 font-bold block">Occupied</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalOccupied}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-paper-100 dark:bg-ink-950 border border-paper-250 dark:border-ink-800 flex items-center justify-center text-paper-500 dark:text-ink-300">
            <UserMinus className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-paper-400 font-bold block">Vacant</span>
            <span className="text-sm font-bold text-paper-600 dark:text-ink-300">{totalVacant}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-paper-400 font-bold block">Monthly Rent</span>
            <span className="text-sm font-bold text-paper-900 dark:text-white">{symbol}{totalMonthlyRent.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 col-span-2 md:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-500">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-paper-400 font-bold block">Total Arrears</span>
            <span className={`text-sm font-bold ${totalArrears > 0 ? 'text-coral-500' : 'text-paper-900 dark:text-white'}`}>
              {symbol}{totalArrears.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden bg-white dark:bg-ink-850 shadow-sm">
        <div className="overflow-x-auto w-full scrollbar-none">
          <table className="w-full text-left border-collapse text-[10px] min-w-[1000px]">
            <thead className="bg-paper-50 dark:bg-ink-950 text-paper-400 uppercase tracking-wider font-bold border-b border-paper-200 dark:border-ink-800">
              <tr>
                <th className="px-3 py-2.5 w-24">Unit ID (Req)</th>
                <th className="px-3 py-2.5 w-32">Unit Name</th>
                <th className="px-3 py-2.5 w-16">Floor</th>
                <th className="px-3 py-2.5 w-20">Rent ({symbol.trim()})</th>
                <th className="px-3 py-2.5 w-20">Deposit ({symbol.trim()})</th>
                <th className="px-3 py-2.5 w-24">Move-in Fees ({symbol.trim()})</th>
                <th className="px-3 py-2.5 w-24">Recurring ({symbol.trim()})</th>
                <th className="px-3 py-2.5 w-36">Tenant Name</th>
                <th className="px-3 py-2.5 w-40">Tenant Email</th>
                <th className="px-3 py-2.5 w-28">Move-in Date</th>
                <th className="px-3 py-2.5 w-20">Arrears ({symbol.trim()})</th>
                <th className="px-3 py-2.5 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-200 dark:divide-ink-800 bg-white dark:bg-ink-800 text-paper-900 dark:text-white">
              {units.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-paper-400 text-xs font-semibold">
                    No units defined. Click "Add Unit" to start entering units manually.
                  </td>
                </tr>
              ) : (
                units.map((unit, idx) => (
                  <tr key={idx} className="hover:bg-paper-50/50 dark:hover:bg-ink-900/20 transition-all">
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="e.g. A101"
                        value={unit.unitId}
                        onChange={(e) => onUpdateUnitRow(idx, 'unitId', e.target.value)}
                        className="w-full bg-paper-50 dark:bg-ink-900 px-2 py-1 border border-paper-200 dark:border-ink-700 focus:border-coral-500 rounded font-mono font-bold text-paper-800 dark:text-white uppercase focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="Apartment 101"
                        value={unit.unitName}
                        onChange={(e) => onUpdateUnitRow(idx, 'unitName', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-semibold text-paper-800 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={unit.floor}
                        onChange={(e) => onUpdateUnitRow(idx, 'floor', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 text-center focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={unit.rent}
                        onChange={(e) => onUpdateUnitRow(idx, 'rent', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-mono text-paper-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={unit.deposit}
                        onChange={(e) => onUpdateUnitRow(idx, 'deposit', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-mono text-paper-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={unit.moveInFees}
                        onChange={(e) => onUpdateUnitRow(idx, 'moveInFees', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-mono text-paper-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={unit.recurringFees}
                        onChange={(e) => onUpdateUnitRow(idx, 'recurringFees', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-mono text-paper-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="Vacant"
                        value={unit.tenantName}
                        onChange={(e) => onUpdateUnitRow(idx, 'tenantName', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 text-paper-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="email"
                        placeholder="optional@email.nl"
                        value={unit.tenantEmail}
                        onChange={(e) => onUpdateUnitRow(idx, 'tenantEmail', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 text-paper-600 dark:text-ink-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={unit.moveInDate}
                        onChange={(e) => onUpdateUnitRow(idx, 'moveInDate', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-mono focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={unit.arrears}
                        onChange={(e) => onUpdateUnitRow(idx, 'arrears', e.target.value)}
                        className={`w-full bg-transparent border-0 focus:ring-1 focus:ring-coral-500 rounded px-2 py-1 font-mono focus:outline-none ${
                          Number(unit.arrears) > 0 ? 'text-coral-500 font-bold' : 'text-paper-900 dark:text-white'
                        }`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(idx)}
                        className="p-1 hover:bg-paper-100 dark:hover:bg-ink-950 text-paper-400 hover:text-coral-500 rounded transition-all"
                        title="Edit Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveUnit(idx)}
                        disabled={setupMode === 'single'}
                        className={`p-1.5 hover:bg-paper-100 dark:hover:bg-ink-950 text-paper-400 hover:text-coral-500 rounded transition-all ${setupMode === 'single' ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arrears warning checklist */}
      {hasHighArrears && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-250 dark:border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
          <div className="text-[10px] leading-relaxed">
            <span className="font-semibold block mb-0.5">High Arrears Warning:</span> Some imported tenants have balances exceeding
            {symbol}1,000. These values will sync directly into the ledger immediately upon confirmation.
          </div>
        </div>
      )}

      {/* Unit Details Edit Modal */}
      {editingIndex !== null && localUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-white dark:bg-ink-900 border border-paper-250 dark:border-ink-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center bg-paper-50 dark:bg-ink-950">
              <div>
                <h3 className="text-sm font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-coral-500" /> Edit Unit Details: Unit {localUnit.unitId}
                </h3>
                <p className="text-[10px] text-paper-400 dark:text-ink-500">Configure comprehensive unit layout, occupant credentials and financial pricing rules.</p>
              </div>
              <button 
                onClick={() => { setEditingIndex(null); setLocalUnit(null); }}
                className="p-1 hover:bg-paper-200 dark:hover:bg-ink-800 rounded text-paper-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 scrollbar-none">
              
              {/* Left Column: Layout & Occupant Profile */}
              <div className="space-y-5">
                <div className="space-y-3 bg-paper-50/50 dark:bg-ink-950/20 p-4 rounded-xl border border-paper-200 dark:border-ink-800/80">
                  <h4 className="text-[10px] uppercase font-bold text-coral-500 tracking-wider">Unit Profile</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-paper-400 block mb-1">Unit ID (Max 5 chars)</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        value={localUnit.unitId}
                        onChange={(e) => setLocalUnit({...localUnit, unitId: e.target.value.toUpperCase()})}
                        className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white uppercase font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-paper-400 block mb-1">Unit Name</label>
                      <input 
                        type="text" 
                        value={localUnit.unitName}
                        onChange={(e) => setLocalUnit({...localUnit, unitName: e.target.value})}
                        className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-paper-400 block mb-1">Floor Level</label>
                      <input 
                        type="text" 
                        value={localUnit.floor}
                        onChange={(e) => setLocalUnit({...localUnit, floor: e.target.value})}
                        className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-paper-400 block mb-1">Unit Type</label>
                      <select 
                        value={localUnit.unitType}
                        onChange={(e) => setLocalUnit({...localUnit, unitType: e.target.value})}
                        className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                      >
                        <option value="Studio">Studio</option>
                        <option value="1 Bedroom">1 Bedroom</option>
                        <option value="2 Bedroom">2 Bedroom</option>
                        <option value="3 Bedroom">3 Bedroom</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-paper-50/50 dark:bg-ink-950/20 p-4 rounded-xl border border-paper-200 dark:border-ink-800/80">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] uppercase font-bold text-coral-500 tracking-wider">Tenant Profile</h4>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="checkbox"
                        id="occupiedCheck"
                        checked={localUnit.tenantName.trim().length > 0}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            setLocalUnit({...localUnit, tenantName: '', tenantEmail: '', tenantPhone: '', tenantIdNumber: '', moveInDate: ''});
                          } else {
                            setLocalUnit({...localUnit, tenantName: 'New Tenant'});
                          }
                        }}
                        className="rounded text-coral-500 focus:ring-coral-500"
                      />
                      <label htmlFor="occupiedCheck" className="text-[10px] text-paper-600 dark:text-ink-300 font-semibold cursor-pointer">Occupied</label>
                    </div>
                  </div>

                  {localUnit.tenantName.trim().length > 0 && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <label className="text-[10px] font-bold text-paper-400 block mb-1">Tenant Full Name</label>
                        <input 
                          type="text" 
                          value={localUnit.tenantName}
                          onChange={(e) => setLocalUnit({...localUnit, tenantName: e.target.value})}
                          className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-paper-400 block mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={localUnit.tenantEmail}
                            onChange={(e) => setLocalUnit({...localUnit, tenantEmail: e.target.value})}
                            className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-paper-400 block mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={localUnit.tenantPhone}
                            onChange={(e) => setLocalUnit({...localUnit, tenantPhone: e.target.value})}
                            className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-paper-400 block mb-1">Govt ID / BSN Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 123456789"
                            value={localUnit.tenantIdNumber}
                            onChange={(e) => setLocalUnit({...localUnit, tenantIdNumber: e.target.value})}
                            className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-paper-400 block mb-1">Lease Start / Move-in</label>
                          <input 
                            type="text" 
                            placeholder="YYYY-MM-DD"
                            value={localUnit.moveInDate}
                            onChange={(e) => setLocalUnit({...localUnit, moveInDate: e.target.value})}
                            className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Kin details */}
                      <div className="pt-2 border-t border-paper-200 dark:border-ink-800 space-y-2">
                        <label className="text-[10px] font-bold text-paper-500 block">Next of Kin (Emergency Contact)</label>
                        {localUnit.kins && localUnit.kins.map((kin, kidx) => (
                          <div key={kidx} className="grid grid-cols-2 gap-2 bg-white dark:bg-ink-950 p-2.5 rounded border border-paper-200 dark:border-ink-800 space-y-1.5">
                            <div className="col-span-2">
                              <label className="text-[8px] font-bold text-paper-400 block">Kin Full Name</label>
                              <input 
                                type="text"
                                value={kin.name}
                                onChange={(e) => {
                                  const updatedKins = [...(localUnit.kins || [])];
                                  updatedKins[kidx] = { ...updatedKins[kidx], name: e.target.value };
                                  setLocalUnit({...localUnit, kins: updatedKins});
                                }}
                                className="w-full bg-paper-50 dark:bg-ink-900 px-2 py-1 text-[10px] border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-paper-400 block">Relation</label>
                              <input 
                                type="text"
                                placeholder="Spouse, Parent..."
                                value={kin.relation}
                                onChange={(e) => {
                                  const updatedKins = [...(localUnit.kins || [])];
                                  updatedKins[kidx] = { ...updatedKins[kidx], relation: e.target.value };
                                  setLocalUnit({...localUnit, kins: updatedKins});
                                }}
                                className="w-full bg-paper-50 dark:bg-ink-900 px-2 py-1 text-[10px] border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-paper-400 block">Phone</label>
                              <input 
                                type="text"
                                value={kin.phone}
                                onChange={(e) => {
                                  const updatedKins = [...(localUnit.kins || [])];
                                  updatedKins[kidx] = { ...updatedKins[kidx], phone: e.target.value };
                                  setLocalUnit({...localUnit, kins: updatedKins});
                                }}
                                className="w-full bg-paper-50 dark:bg-ink-900 px-2 py-1 text-[10px] border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing Rules & Templates */}
              <div className="space-y-5">
                <div className="space-y-4 bg-paper-50/50 dark:bg-ink-950/20 p-4 rounded-xl border border-paper-200 dark:border-ink-800/80">
                  <h4 className="text-[10px] uppercase font-bold text-coral-500 tracking-wider">Financial Pricing & Fees</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-paper-400 block mb-1">Monthly Target Rent ({symbol.trim()})</label>
                      <input 
                        type="text" 
                        value={localUnit.rent}
                        onChange={(e) => setLocalUnit({...localUnit, rent: e.target.value})}
                        className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-paper-400 block mb-1">Active Arrears Balance ({symbol.trim()})</label>
                      <input 
                        type="text" 
                        value={localUnit.arrears}
                        onChange={(e) => setLocalUnit({...localUnit, arrears: e.target.value})}
                        className="w-full bg-white dark:bg-ink-950 px-2.5 py-1.5 border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white font-mono text-coral-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-paper-200 dark:border-ink-800/50 space-y-3">
                    <label className="text-[10px] font-bold text-paper-500 block">Security Deposit Rule</label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={depMult}
                        onChange={(e) => setDepMult(e.target.value as any)}
                        className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white focus:outline-none"
                      >
                        <option value="1x">1x Month Rent</option>
                        <option value="2x">2x Month Rent</option>
                        <option value="3x">3x Month Rent</option>
                        <option value="custom">Custom Fixed Amount</option>
                      </select>
                      {depMult === 'custom' && (
                        <input
                          type="text"
                          placeholder={`Amount (${symbol.trim()})`}
                          value={customDepVal}
                          onChange={(e) => setCustomDepVal(e.target.value)}
                          className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1.5 text-xs text-paper-900 dark:text-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Move In Fees Breakdown */}
                  <div className="pt-2 border-t border-paper-200 dark:border-ink-800/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-paper-500">Other Move-in Fees Breakdown</label>
                      <button 
                        type="button" 
                        onClick={addMoveInFee}
                        className="text-[9px] font-bold text-coral-500 hover:underline"
                      >
                        + Add Fee Item
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {moveInList.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            placeholder="e.g. Cleaning"
                            value={item.name}
                            onChange={(e) => updateMoveInFee(idx, 'name', e.target.value)}
                            className="flex-1 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white"
                          />
                          <input 
                            type="text" 
                            placeholder={`Amount (${symbol.trim()})`}
                            value={item.amount}
                            onChange={(e) => updateMoveInFee(idx, 'amount', e.target.value)}
                            className="w-20 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white text-right"
                          />
                          <button 
                            type="button" 
                            onClick={() => removeMoveInFee(idx)}
                            className="p-1 text-paper-400 hover:text-coral-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recurring Fees Breakdown */}
                  <div className="pt-2 border-t border-paper-200 dark:border-ink-800/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-paper-500">Other Recurring Monthly Costs</label>
                      <button 
                        type="button" 
                        onClick={addRecurringFee}
                        className="text-[9px] font-bold text-coral-500 hover:underline"
                      >
                        + Add Recurring Item
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {recurringList.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            placeholder="e.g. Garbage Fee"
                            value={item.name}
                            onChange={(e) => updateRecurringFee(idx, 'name', e.target.value)}
                            className="flex-1 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white"
                          />
                          <input 
                            type="text" 
                            placeholder={`Amount (${symbol.trim()})`}
                            value={item.amount}
                            onChange={(e) => updateRecurringFee(idx, 'amount', e.target.value)}
                            className="w-20 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white text-right"
                          />
                          <button 
                            type="button" 
                            onClick={() => removeRecurringFee(idx)}
                            className="p-1 text-paper-400 hover:text-coral-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-3 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => { setEditingIndex(null); setLocalUnit(null); }}
                className="px-4 py-2 border border-paper-250 dark:border-ink-700 text-paper-800 dark:text-white rounded-lg hover:bg-paper-100 dark:hover:bg-ink-800 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-semibold shadow-sm"
              >
                Apply Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
