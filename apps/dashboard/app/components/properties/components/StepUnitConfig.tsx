import React, { RefObject } from 'react';
import { DollarSign, FileSpreadsheet, Plus, Info, Square, CheckSquare } from 'lucide-react';
import { UnitTypeTemplateEditor } from './UnitTypeTemplateEditor';
import { UnitTypeConfig } from '../types';

interface StepUnitConfigProps {
  setupMode: 'single' | 'multi';
  setupType: 'excel' | 'ui';
  uiType: 'identical' | 'scattered';
  identicalCount: number;
  identicalRent: string;
  identicalDeposit: string;
  identicalRecurring: string;
  identicalMoveIn: string;
  unitTypes: string[];
  unitTypeConfigs: Record<string, UnitTypeConfig>;
  errors: Record<string, string>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onChangeField: (key: any, value: any) => void;
  onExcelParse: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  onAddCustomUnitType: (newType: string) => void;
  onChangeConfig: (unitType: string, updated: UnitTypeConfig) => void;
}

export function StepUnitConfig({
  setupMode,
  setupType,
  uiType,
  identicalCount,
  identicalRent,
  identicalDeposit,
  identicalRecurring,
  identicalMoveIn,
  unitTypes,
  unitTypeConfigs,
  errors,
  fileInputRef,
  onChangeField,
  onExcelParse,
  onDownloadTemplate,
  onAddCustomUnitType,
  onChangeConfig,
}: StepUnitConfigProps) {
  if (setupMode === 'single') {
    return (
      <div className="space-y-5 animate-slide-in">
        <div>
          <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
            <DollarSign className="w-4.5 h-4.5 text-coral-500" /> Financial Pricing Terms
          </h2>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
            Configure pricing terms for your single-family rental asset.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-paper-50 dark:bg-ink-900/40 p-4 rounded-xl border border-paper-200 dark:border-ink-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-paper-750 dark:text-ink-200">Monthly Target Rent ($)</label>
            <input
              type="text"
              value={identicalRent}
              onChange={(e) => onChangeField('identicalRent', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-755 rounded-lg bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-paper-750 dark:text-ink-200">Security Deposit ($)</label>
            <input
              type="text"
              value={identicalDeposit}
              onChange={(e) => onChangeField('identicalDeposit', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-755 rounded-lg bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
            />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs font-semibold text-paper-755 dark:text-ink-200">Other Move-in Fees ($)</label>
            <input
              type="text"
              value={identicalMoveIn}
              onChange={(e) => onChangeField('identicalMoveIn', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-755 rounded-lg bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
            />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs font-semibold text-paper-755 dark:text-ink-200">Other Recurring Fees ($)</label>
            <input
              type="text"
              value={identicalRecurring}
              onChange={(e) => onChangeField('identicalRecurring', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-paper-200 dark:border-ink-755 rounded-lg bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-in">
      <div>
        <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
          <FileSpreadsheet className="w-4.5 h-4.5 text-coral-500" /> Unit Layout & Roster Import
        </h2>
        <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
          Upload an Excel roster to parse tenants, rents, and active arrears automatically, or build manually.
        </p>
      </div>

      {/* Method Switcher */}
      <div className="flex border-b border-paper-200 dark:border-ink-800 pb-3 gap-6 text-xs font-bold">
        <button
          onClick={() => onChangeField('setupType', 'excel')}
          className={`pb-1 border-b-2 transition-colors ${
            setupType === 'excel' ? 'border-coral-500 text-coral-500' : 'border-transparent text-paper-400'
          }`}
        >
          Spreadsheet Import (XLSX)
        </button>
        <button
          onClick={() => onChangeField('setupType', 'ui')}
          className={`pb-1 border-b-2 transition-colors ${
            setupType === 'ui' ? 'border-coral-500 text-coral-500' : 'border-transparent text-paper-400'
          }`}
        >
          Interactive UI Builder
        </button>
      </div>

      {setupType === 'excel' ? (
        /* Excel File Upload Flow */
        <div className="space-y-4">
          <div className="border-2 border-dashed border-paper-200 dark:border-ink-700 hover:border-coral-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative bg-paper-50/20 dark:bg-ink-900/10">
            <input
              type="file"
              ref={fileInputRef as any}
              accept=".xlsx, .xls"
              onChange={onExcelParse}
              onClick={(e) => { (e.target as any).value = null }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-8 h-8 text-paper-400 mb-2" />
            <p className="text-xs font-semibold text-paper-800 dark:text-ink-200">Drag & drop your Excel sheet here or browse</p>
            <p className="text-[10px] text-paper-400 dark:text-ink-500 mt-0.5 font-mono">Requires columns for Floor, Unit Name, Unit Type & Rent</p>
          </div>

          {errors.excel && <p className="text-[10px] text-coral-500 font-semibold">{errors.excel}</p>}

          <div className="bg-paper-50 dark:bg-ink-900/40 border border-paper-200 dark:border-ink-800 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-paper-400" />
              <p className="text-[10px] text-paper-500 dark:text-ink-400 font-medium">Download our standardized tenant roster layout for swift processing.</p>
            </div>
            <button
              onClick={onDownloadTemplate}
              className="px-3 py-1 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-[10px] font-bold text-coral-500 rounded hover:bg-paper-50 dark:hover:bg-ink-700 transition-all"
            >
              Get Template
            </button>
          </div>
        </div>
      ) : (
        /* Manual Setup Method Option Switcher */
        <div className="space-y-4">
          <div className="flex gap-4">
            <div
              onClick={() => onChangeField('uiType', 'identical')}
              className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2.5 bg-paper-50/30 dark:bg-ink-900/10 ${
                uiType === 'identical' ? 'border-coral-500 text-coral-500' : 'border-paper-200 dark:border-ink-800 text-paper-500'
              }`}
            >
              {uiType === 'identical' ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <div className="text-left">
                <span className="text-xs font-bold block text-paper-900 dark:text-white">Bulk Identical Units</span>
                <span className="text-[9px] text-paper-400">Specify count and templates</span>
              </div>
            </div>

            <div
              onClick={() => onChangeField('uiType', 'scattered')}
              className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-2.5 bg-paper-50/30 dark:bg-ink-900/10 ${
                uiType === 'scattered' ? 'border-coral-500 text-coral-500' : 'border-paper-200 dark:border-ink-800 text-paper-500'
              }`}
            >
              {uiType === 'scattered' ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <div className="text-left">
                <span className="text-xs font-bold block text-paper-900 dark:text-white">Scattered Unique Houses</span>
                <span className="text-[9px] text-paper-400">Build layout using empty grid</span>
              </div>
            </div>
          </div>

          {uiType === 'identical' && (
            <div className="bg-paper-50 dark:bg-ink-900/50 border border-paper-200 dark:border-ink-800 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-paper-400">Total Units Count</label>
                <input
                  type="number"
                  value={identicalCount}
                  onChange={(e) => onChangeField('identicalCount', Number(e.target.value))}
                  className="w-full bg-white dark:bg-ink-950 px-2 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-paper-400">Monthly Rent Target ($)</label>
                <input
                  type="text"
                  value={identicalRent}
                  onChange={(e) => onChangeField('identicalRent', e.target.value)}
                  className="w-full bg-white dark:bg-ink-950 px-2 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded text-paper-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial rules editor for multi-unit mode */}
      {unitTypes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-paper-200 dark:border-ink-800">
          <UnitTypeTemplateEditor
            unitTypes={unitTypes}
            configs={unitTypeConfigs}
            onChangeConfig={onChangeConfig}
            onAddCustomUnitType={onAddCustomUnitType}
          />
        </div>
      )}
    </div>
  );
}
