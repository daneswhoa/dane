import React from 'react';
import { FileImage, Upload, RefreshCw, X, MapPin } from 'lucide-react';

interface UnitRow {
  unitName: string;
  floor: string;
  unitType: string;
  rent: string;
  deposit: string;
  recurringFees: string;
  moveInFees: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  arrears: string;
}

interface StepMediaConfirmProps {
  uploadedImageUrl: string;
  uploadProgress: number | null;
  uploadSpeed: string;
  errors: Record<string, string>;
  propertyName: string;
  propertyAddress: string;
  units: UnitRow[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

export function StepMediaConfirm({
  uploadedImageUrl,
  uploadProgress,
  uploadSpeed,
  errors,
  propertyName,
  propertyAddress,
  units,
  onFileUpload,
  onRemovePhoto,
}: StepMediaConfirmProps) {
  const totalRentSum = units.reduce((sum, u) => sum + (Number(u.rent) || 0), 0);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h2 className="text-base font-bold text-paper-900 dark:text-white flex items-center gap-1.5">
          <FileImage className="w-4.5 h-4.5 text-coral-500" /> Cover Photo & Finalize
        </h2>
        <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">
          Upload a property cover image and confirm parameters to launch the asset.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo Upload Zone */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-paper-700 dark:text-ink-200">Property Photo</label>

          {!uploadedImageUrl && uploadProgress === null ? (
            <div className="border-2 border-dashed border-paper-200 dark:border-ink-700 hover:border-coral-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative bg-paper-50/20 dark:bg-ink-900/10 aspect-[4/3]">
              <input
                type="file"
                accept="image/*"
                onChange={onFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-7 h-7 text-paper-400 mb-2" />
              <p className="text-xs font-semibold text-paper-800 dark:text-ink-200">Upload cover image</p>
              <p className="text-[9px] text-paper-400 mt-0.5">Supports PNG, JPG, or WEBP up to 5MB</p>
            </div>
          ) : uploadProgress !== null ? (
            <div className="border border-paper-200 dark:border-ink-700 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-paper-50/20 dark:bg-ink-900/10 aspect-[4/3]">
              <RefreshCw className="w-7 h-7 text-coral-500 animate-spin mb-2" />
              <p className="text-[11px] font-semibold text-paper-800 dark:text-ink-200">Uploading to GCS...</p>
              <div className="w-full bg-paper-100 dark:bg-ink-950 h-1.5 rounded-full overflow-hidden mt-3 max-w-[120px]">
                <div
                  className="bg-coral-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-[9px] text-paper-400 mt-1">
                {uploadProgress}% ({uploadSpeed})
              </span>
            </div>
          ) : (
            <div className="border border-paper-200 dark:border-ink-700 rounded-xl p-3 flex flex-col items-center bg-paper-50/10 dark:bg-ink-900/10 aspect-[4/3] relative overflow-hidden justify-center">
              <img src={uploadedImageUrl} alt="Cover Preview" className="w-full h-full object-cover rounded-lg" />
              <button
                onClick={onRemovePhoto}
                className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {errors.image && <p className="text-[10px] text-coral-500 font-semibold">{errors.image}</p>}
        </div>

        {/* Summary Card */}
        <div className="bg-paper-50 dark:bg-ink-900/50 border border-paper-200 dark:border-ink-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-coral-500 block">Asset Summary</span>
            <h3 className="text-sm font-bold text-paper-900 dark:text-white mt-1 truncate">{propertyName}</h3>
            <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5 flex items-center gap-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-paper-400" /> {propertyAddress}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-paper-200 dark:border-ink-800 pt-3">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-paper-400 font-bold">Units</span>
                <span className="text-xs font-bold text-paper-900 dark:text-white">{units.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-paper-400 font-bold">Occupied</span>
                <span className="text-xs font-bold text-paper-900 dark:text-white">
                  {units.filter((u) => u.tenantName).length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-paper-400 font-bold">Total Rent</span>
                <span className="text-xs font-bold text-paper-900 dark:text-white">
                  ${totalRentSum.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg p-2.5 text-[9px] leading-relaxed mt-4">
            <span className="font-semibold block mb-0.5">Automated Mappings Ready:</span> Launching will write contracts,
            invoice profiles, and recurring deposit allocations into active ledgers.
          </div>
        </div>
      </div>
    </div>
  );
}
