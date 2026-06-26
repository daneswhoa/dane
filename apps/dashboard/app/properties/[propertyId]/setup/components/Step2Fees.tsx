'use client';
import React from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

export default function Step2Fees({ units, feeSettings, setFeeSettings }: any) {
  const uniqueUnitTypes = Array.from(new Set(units.map((u: any) => u.unitType?.trim() || 'Standard')));

  const handleFeeSettingChange = (ut: string, field: string, val: any) => {
    setFeeSettings((prev: any) => ({ ...prev, [ut]: { ...prev[ut], [field]: val } }));
  };

  const handleArrItemChange = (ut: string, list: 'moveInFees' | 'recurringFees', idx: number, key: 'name' | 'amount', val: any) => {
    setFeeSettings((prev: any) => {
      const arr = [...prev[ut][list]];
      arr[idx] = { ...arr[idx], [key]: val };
      return { ...prev, [ut]: { ...prev[ut], [list]: arr } };
    });
  };

  const addItem = (ut: string, list: 'moveInFees' | 'recurringFees') => {
    setFeeSettings((prev: any) => ({
      ...prev, [ut]: { ...prev[ut], [list]: [...prev[ut][list], { name: '', amount: 0 }] }
    }));
  };

  const rmItem = (ut: string, list: 'moveInFees' | 'recurringFees', idx: number) => {
    setFeeSettings((prev: any) => ({
      ...prev, [ut]: { ...prev[ut], [list]: prev[ut][list].filter((_: any, i: number) => i !== idx) }
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {uniqueUnitTypes.map((ut: any) => {
        const settings = feeSettings[ut] || { deposit: 0, moveInFees: [], recurringFees: [] };
        return (
          <div key={ut} className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg">
             <div className="bg-paper-50 dark:bg-ink-950 border-b border-paper-200 px-5 py-3 flex justify-between items-center">
                <span className="text-xs font-bold uppercase">{ut} Units</span>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-paper-400 uppercase">Deposit:</span>
                   <input type="number" value={settings.deposit} onChange={e => handleFeeSettingChange(ut, 'deposit', Number(e.target.value))} className="w-24 px-2 py-1 text-xs border border-paper-300 rounded" />
                </div>
             </div>
             <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs font-bold flex justify-between mb-3">Recurring Fees <button onClick={() => addItem(ut, 'recurringFees')} className="text-[9px] text-coral-500 uppercase flex gap-1"><Plus className="w-3 h-3"/> Add</button></h4>
                   {settings.recurringFees.map((fee: any, idx: number) => (
                     <div key={idx} className="flex gap-2 mb-2">
                       <input type="text" value={fee.name} onChange={e => handleArrItemChange(ut, 'recurringFees', idx, 'name', e.target.value)} placeholder="Name" className="flex-1 px-2 py-1 text-xs border rounded" />
                       <input type="number" value={fee.amount} onChange={e => handleArrItemChange(ut, 'recurringFees', idx, 'amount', Number(e.target.value))} className="w-20 px-2 py-1 text-xs border rounded" />
                       <button onClick={() => rmItem(ut, 'recurringFees', idx)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                   ))}
                </div>
                <div>
                   <h4 className="text-xs font-bold flex justify-between mb-3">Move-In Fees <button onClick={() => addItem(ut, 'moveInFees')} className="text-[9px] text-coral-500 uppercase flex gap-1"><Plus className="w-3 h-3"/> Add</button></h4>
                   {settings.moveInFees.map((fee: any, idx: number) => (
                     <div key={idx} className="flex gap-2 mb-2">
                       <input type="text" value={fee.name} onChange={e => handleArrItemChange(ut, 'moveInFees', idx, 'name', e.target.value)} placeholder="Name" className="flex-1 px-2 py-1 text-xs border rounded" />
                       <input type="number" value={fee.amount} onChange={e => handleArrItemChange(ut, 'moveInFees', idx, 'amount', Number(e.target.value))} className="w-20 px-2 py-1 text-xs border rounded" />
                       <button onClick={() => rmItem(ut, 'moveInFees', idx)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );
      })}
    </div>
  );
}
