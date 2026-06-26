'use client';
import React, { useState } from 'react';
import { Home, Check, DollarSign, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Step1Units({ property, units, setUnits, setupMode, setSetupMode, setError }: any) {
  const [floorsInput, setFloorsInput] = useState('1');
  const [unitsPerFloorInput, setUnitsPerFloorInput] = useState('4');
  const [conventionInput, setConventionInput] = useState('alphanumeric');

  const handleUnitChange = (index: number, field: string, value: any) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'tenantName') {
      updated[index].status = value.trim() ? 'occupied' : 'vacant';
    }
    setUnits(updated);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        if (json.length === 0) { setError('Uploaded file is empty.'); return; }
        
        const parsedUnits: any[] = [];
        json.forEach((row: any) => {
          const getVal = (keys: string[]) => keys.reduce<any>((acc, k) => acc || row[k], undefined);
          const label = getVal(['Unit Name', 'Unit']);
          if (!label) return;
          const rentRaw = getVal(['Rent', 'price']);
          const rent = Math.round(Number(String(rentRaw || '0').replace(/[^\d.-]/g, ''))) || 1200;
          const tenantName = getVal(['Tenant Name'])?.toString() || '';
          
          parsedUnits.push({
            label: label.toString(), rent,
            status: tenantName ? 'occupied' : 'vacant',
            tenantName,
            tenantEmail: getVal(['Tenant Email'])?.toString() || '',
            tenantPhone: getVal(['Tenant Phone'])?.toString() || '',
            unitType: getVal(['Unit Type', 'Type'])?.toString() || 'Standard',
            arrears: Math.round(Number(String(getVal(['Arrears']) || '0').replace(/[^\d.-]/g, ''))) || 0,
            kinDetails: []
          });
        });
        if (parsedUnits.length === 0) return setError('No valid units parsed.');
        setUnits(parsedUnits);
        setSetupMode('manual');
        setError('');
      } catch (err: any) { setError('Excel parse error.'); }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex bg-paper-200 dark:bg-ink-900/60 p-1 rounded-lg max-w-sm">
        <button type="button" onClick={() => setSetupMode('excel')} className={`flex-1 py-1.5 text-[10px] font-bold rounded uppercase ${setupMode === 'excel' ? 'bg-white text-coral-500 shadow-sm' : 'text-paper-500'}`}>Excel Import</button>
        <button type="button" onClick={() => setSetupMode('manual')} className={`flex-1 py-1.5 text-[10px] font-bold rounded uppercase ${setupMode === 'manual' ? 'bg-white text-coral-500 shadow-sm' : 'text-paper-500'}`}>Manual ({units.length})</button>
      </div>

      {setupMode === 'excel' ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-5 rounded-lg space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-tight text-paper-900 dark:text-white">Excel Import Template</h3>
              <p className="text-[10px] text-paper-500">Generate a layout template and upload it back here after filling.</p>
              <div 
                onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('excelUpload')?.click()}
                className="border-2 border-dashed border-paper-250 dark:border-ink-800 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-paper-50"
              >
                <input type="file" id="excelUpload" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
                <FileSpreadsheet className="w-8 h-8 mb-2 text-paper-400" />
                <p className="text-xs font-bold uppercase">Drag & Drop Excel Here</p>
              </div>
            </div>
         </div>
      ) : (
         <div className="space-y-4">
           {units.map((unit: any, idx: number) => (
             <div key={idx} className={`bg-white dark:bg-ink-900 border ${unit.status === 'occupied' ? 'border-coral-500/30 shadow-md' : 'border-paper-200'} rounded-lg p-5 space-y-4`}>
               <div className="flex flex-col sm:flex-row justify-between gap-3 pb-3 border-b border-paper-150 dark:border-ink-800">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-paper-400" />
                    <input type="text" value={unit.label} onChange={(e) => handleUnitChange(idx, 'label', e.target.value)} placeholder="Unit A" className="font-bold text-xs bg-transparent border-b border-dashed outline-none w-32" />
                    <span className="text-[10px] font-semibold text-paper-500 mx-2">Type:</span>
                    <input type="text" value={unit.unitType} onChange={(e) => handleUnitChange(idx, 'unitType', e.target.value)} className="font-bold text-xs bg-transparent border-b border-dashed outline-none w-32 uppercase" />
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-paper-100 text-paper-500">{unit.status}</span>
               </div>
               <div className="flex flex-col md:flex-row gap-6">
                 <div className="w-full md:w-1/3">
                   <label className="text-[9px] uppercase tracking-wider font-bold text-paper-400">Base Monthly Rent</label>
                   <div className="relative mt-1">
                     <DollarSign className="w-3.5 h-3.5 text-paper-400 absolute left-2 top-1/2 -translate-y-1/2" />
                     <input type="number" value={unit.rent} onChange={(e) => handleUnitChange(idx, 'rent', Number(e.target.value))} className="w-full pl-7 pr-2 py-1.5 text-xs bg-paper-50 dark:bg-ink-950 border border-paper-250 rounded outline-none" />
                   </div>
                 </div>
                 <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-paper-400">Tenant Name</label>
                      <input type="text" value={unit.tenantName} onChange={(e) => handleUnitChange(idx, 'tenantName', e.target.value)} placeholder="Leave blank if vacant" className="w-full px-2 py-1.5 text-xs bg-white border border-paper-250 rounded mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-paper-400">Tenant Email</label>
                      <input type="email" value={unit.tenantEmail} onChange={(e) => handleUnitChange(idx, 'tenantEmail', e.target.value)} placeholder="For invites" className="w-full px-2 py-1.5 text-xs bg-white border border-paper-250 rounded mt-1 outline-none" />
                    </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}
