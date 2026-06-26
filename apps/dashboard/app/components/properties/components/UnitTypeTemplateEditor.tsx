import React from 'react';
import { Plus, Trash2, ShieldCheck, DollarSign, Activity, FileSpreadsheet } from 'lucide-react';
import { UnitTypeConfig, FeeItem } from '../types';

interface UnitTypeTemplateEditorProps {
  unitTypes: string[];
  configs: Record<string, UnitTypeConfig>;
  onChangeConfig: (unitType: string, updated: UnitTypeConfig) => void;
  onAddCustomUnitType: (newType: string) => void;
}

export function UnitTypeTemplateEditor({
  unitTypes,
  configs,
  onChangeConfig,
  onAddCustomUnitType,
}: UnitTypeTemplateEditorProps) {
  const [customTypeName, setCustomTypeName] = React.useState('');

  const initConfig = (type: string): UnitTypeConfig => {
    return configs[type] || {
      unitType: type,
      depositMultiplier: '1x',
      customDeposit: '0',
      otherMoveInFees: [],
      garbageFee: '10',
      otherRecurringFees: [],
      utilities: ['Water', 'Electricity'],
    };
  };

  const handleAddField = (type: string, key: 'otherMoveInFees' | 'otherRecurringFees') => {
    const config = initConfig(type);
    const updated = {
      ...config,
      [key]: [
        ...config[key],
        { id: `fee-${Date.now()}-${Math.random()}`, name: '', amount: '0' },
      ],
    };
    onChangeConfig(type, updated);
  };

  const handleRemoveField = (type: string, key: 'otherMoveInFees' | 'otherRecurringFees', id: string) => {
    const config = initConfig(type);
    const updated = {
      ...config,
      [key]: config[key].filter((item) => item.id !== id),
    };
    onChangeConfig(type, updated);
  };

  const handleUpdateField = (
    type: string,
    key: 'otherMoveInFees' | 'otherRecurringFees',
    id: string,
    field: 'name' | 'amount',
    val: string
  ) => {
    const config = initConfig(type);
    const updated = {
      ...config,
      [key]: config[key].map((item) => (item.id === id ? { ...item, [field]: val } : item)),
    };
    onChangeConfig(type, updated);
  };

  const handleUtilityToggle = (type: string, utility: string) => {
    const config = initConfig(type);
    const hasUtil = config.utilities.includes(utility);
    const updated = {
      ...config,
      utilities: hasUtil
        ? config.utilities.filter((u) => u !== utility)
        : [...config.utilities, utility],
    };
    onChangeConfig(type, updated);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex justify-between items-center border-b border-paper-200 dark:border-ink-800 pb-3">
        <h3 className="text-xs font-bold text-coral-500 uppercase tracking-wider">Unit Type Financial Templates</h3>
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            placeholder="New Unit Type (e.g. Penthouse)"
            value={customTypeName}
            onChange={(e) => setCustomTypeName(e.target.value)}
            className="px-2 py-1 text-[10px] border border-paper-200 dark:border-ink-750 bg-white dark:bg-ink-950 text-paper-900 dark:text-white rounded"
          />
          <button
            onClick={() => {
              if (customTypeName.trim()) {
                onAddCustomUnitType(customTypeName.trim());
                setCustomTypeName('');
              }
            }}
            className="px-2 py-1 bg-coral-500 hover:bg-coral-600 text-white rounded text-[10px] font-bold"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
        {unitTypes.map((type) => {
          const cfg = initConfig(type);
          return (
            <div
              key={type}
              className="bg-paper-50 dark:bg-ink-900/30 border border-paper-200 dark:border-ink-800 rounded-xl p-4 space-y-4 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-800 pb-2">
                <span className="text-xs font-bold text-paper-800 dark:text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-coral-500" /> {type} Template Rules
                </span>
              </div>

              {/* Move In Fees Row */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-paper-500 dark:text-ink-400 block">Move-in Fees Rules</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold text-paper-400">Security Deposit Multiple</label>
                    <select
                      value={cfg.depositMultiplier}
                      onChange={(e) => onChangeConfig(type, { ...cfg, depositMultiplier: e.target.value as any })}
                      className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1 text-xs text-paper-900 dark:text-white focus:outline-none"
                    >
                      <option value="1x">1x Month Rent</option>
                      <option value="2x">2x Month Rent</option>
                      <option value="3x">3x Month Rent</option>
                      <option value="custom">Custom Fixed Amount</option>
                    </select>
                  </div>
                  {cfg.depositMultiplier === 'custom' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-paper-400">Custom Deposit Amount ($)</label>
                      <input
                        type="text"
                        value={cfg.customDeposit}
                        onChange={(e) => onChangeConfig(type, { ...cfg, customDeposit: e.target.value })}
                        className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2.5 py-1 text-xs text-paper-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Move-In Fees List */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-semibold text-paper-400">Other Move-in Fees (Key, Admin, Cleaning)</label>
                    <button
                      onClick={() => handleAddField(type, 'otherMoveInFees')}
                      className="text-[9px] text-coral-500 font-bold hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>
                  {cfg.otherMoveInFees.map((fee) => (
                    <div key={fee.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Fee Name (e.g. Cleaning)"
                        value={fee.name}
                        onChange={(e) => handleUpdateField(type, 'otherMoveInFees', fee.id, 'name', e.target.value)}
                        className="flex-1 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={fee.amount}
                        onChange={(e) => handleUpdateField(type, 'otherMoveInFees', fee.id, 'amount', e.target.value)}
                        className="w-20 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white text-right"
                      />
                      <button
                        onClick={() => handleRemoveField(type, 'otherMoveInFees', fee.id)}
                        className="p-1 hover:text-coral-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring Monthly Cost rules */}
              <div className="space-y-2.5 pt-2 border-t border-paper-200 dark:border-ink-800">
                <span className="text-[10px] uppercase tracking-wider font-bold text-paper-500 dark:text-ink-400 block">Recurring Monthly Bills</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-ink-950 p-2 border border-paper-200 dark:border-ink-700 rounded">
                    <input
                      type="checkbox"
                      checked={Number(cfg.garbageFee) > 0}
                      onChange={(e) => onChangeConfig(type, { ...cfg, garbageFee: e.target.checked ? '10' : '0' })}
                      className="rounded text-coral-500 focus:ring-coral-500"
                    />
                    <label className="text-[10px] text-paper-700 dark:text-ink-200">Garbage Collection</label>
                  </div>
                  {Number(cfg.garbageFee) > 0 && (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="Fee ($)"
                        value={cfg.garbageFee}
                        onChange={(e) => onChangeConfig(type, { ...cfg, garbageFee: e.target.value })}
                        className="bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Recurring fees list */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-semibold text-paper-400">Other Recurring Charges (Internet, Parking)</label>
                    <button
                      onClick={() => handleAddField(type, 'otherRecurringFees')}
                      className="text-[9px] text-coral-500 font-bold hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>
                  {cfg.otherRecurringFees.map((fee) => (
                    <div key={fee.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Fee Name (e.g. Parking)"
                        value={fee.name}
                        onChange={(e) => handleUpdateField(type, 'otherRecurringFees', fee.id, 'name', e.target.value)}
                        className="flex-1 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={fee.amount}
                        onChange={(e) => handleUpdateField(type, 'otherRecurringFees', fee.id, 'amount', e.target.value)}
                        className="w-20 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-paper-900 dark:text-white text-right"
                      />
                      <button
                        onClick={() => handleRemoveField(type, 'otherRecurringFees', fee.id)}
                        className="p-1 hover:text-coral-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utility management checklist */}
              <div className="space-y-2 pt-2 border-t border-paper-200 dark:border-ink-800">
                <label className="text-[9px] font-semibold text-paper-400 uppercase tracking-wider">Managed Utility Services</label>
                <div className="flex gap-3 flex-wrap">
                  {['Water', 'Electricity', 'Gas', 'Trash', 'Heating'].map((u) => {
                    const active = cfg.utilities.includes(u);
                    return (
                      <button
                        key={u}
                        onClick={() => handleUtilityToggle(type, u)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          active
                            ? 'bg-coral-500/10 border-coral-500 text-coral-500 shadow-sm'
                            : 'bg-white dark:bg-ink-950 border-paper-200 dark:border-ink-750 text-paper-500 dark:text-ink-400'
                        }`}
                      >
                        {u}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
