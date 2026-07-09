import React from 'react';
import { Loader, AlertCircle, Sliders, Plus, Trash2, Camera, Upload, Star } from 'lucide-react';
import { Property, formatCurrency } from './types';

interface PropertyVacancyStepProps {
  wizardPropId: string;
  properties: Property[];
  handleWizardPropertyChange: (id: string) => void;
  loadingPropertyUnits: boolean;
  vacantUnits: any[];
  groupedUnitTypes: Record<string, any[]>;
  selectedUnitType: string;
  handleUnitTypeChange: (type: string) => void;
  selectedUnitIds: string[];
  setSelectedUnitIds: (ids: string[]) => void;
  wizardProperty: Property | null;
  rentInput: number;
  setRentInput: (v: number) => void;
  depositInput: number;
  setDepositInput: (v: number) => void;
  
  // Move-in fees
  moveInFeesList: { name: string; amount: number }[];
  handleAddFeeItem: () => void;
  handleRemoveFeeItem: (idx: number) => void;
  handleUpdateFeeItem: (idx: number, field: 'name' | 'amount', value: any) => void;
  totalMoveInFees: number;

  // Recurring fees
  recurringFeesList: { name: string; amount: number }[];
  handleAddRecurringFeeItem: () => void;
  handleRemoveRecurringFeeItem: (idx: number) => void;
  handleUpdateRecurringFeeItem: (idx: number, field: 'name' | 'amount', value: any) => void;
  totalRecurringFees: number;

  // Unit images
  imagesList: string[];
  setImagesList: (images: string[]) => void;
  uploadingImages: boolean;
  setUploadingImages: (v: boolean) => void;
}

export const PropertyVacancyStep: React.FC<PropertyVacancyStepProps> = ({
  wizardPropId,
  properties,
  handleWizardPropertyChange,
  loadingPropertyUnits,
  vacantUnits,
  groupedUnitTypes,
  selectedUnitType,
  handleUnitTypeChange,
  selectedUnitIds,
  setSelectedUnitIds,
  wizardProperty,
  rentInput,
  setRentInput,
  depositInput,
  setDepositInput,
  
  moveInFeesList,
  handleAddFeeItem,
  handleRemoveFeeItem,
  handleUpdateFeeItem,
  totalMoveInFees,

  recurringFeesList,
  handleAddRecurringFeeItem,
  handleRemoveRecurringFeeItem,
  handleUpdateRecurringFeeItem,
  totalRecurringFees,

  imagesList,
  setImagesList,
  uploadingImages,
  setUploadingImages,
}) => {

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const filesToUpload = Array.from(e.target.files);
    
    // Check limit
    if (imagesList.length + filesToUpload.length > 5) {
      alert('You can only upload a maximum of 5 images.');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [...imagesList];
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${host}/api/dashboard/properties/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.photoUrl) {
            uploadedUrls.push(data.photoUrl);
          }
        } else {
          console.error('Failed to upload file to backend');
        }
      }
      setImagesList(uploadedUrls);
    } catch (err) {
      console.error(err);
      alert('Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {/* Select Property */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Asset Property</label>
        <select
          value={wizardPropId}
          onChange={(e) => handleWizardPropertyChange(e.target.value)}
          className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
        >
          <option value="">-- Choose a property --</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.address})</option>
          ))}
        </select>
      </div>

      {wizardPropId && (
        <>
          {loadingPropertyUnits ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
              <Loader className="w-6 h-6 text-coral-500 animate-spin" />
              <p className="text-xs text-[var(--text-muted)]">Loading vacant units...</p>
            </div>
          ) : vacantUnits.length === 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center space-y-1.5">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-amber-500">No Vacant Units Available</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                All units in this property are occupied or already syndicated. Mark a unit vacant to syndicate it.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {/* Unit type selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Unit Classification (List One Type at a Go)</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(groupedUnitTypes).map((type) => {
                    const total = groupedUnitTypes[type].length;
                    const unlisted = groupedUnitTypes[type].filter((u: any) => !u.isListed).length;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => handleUnitTypeChange(type)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          selectedUnitType === type
                            ? 'bg-coral-500/10 border-coral-500 text-coral-500'
                            : 'bg-[var(--bg-raised)] border border-subtle hover:bg-[var(--bg-raised)]/80 text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="text-xs font-bold">{type}</span>
                        <span className="text-[10px] text-[var(--text-muted)] mt-1">
                          {unlisted === 0 ? 'All Syndicated' : `${unlisted} of ${total} Vacant`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Vacant units checkboxes */}
              {selectedUnitType && (
                <div className="space-y-2.5 animate-slide-up">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Units to Include</label>
                    {groupedUnitTypes[selectedUnitType]?.filter((u: any) => !u.isListed).length === 0 && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        All units of this type are already listed
                      </span>
                    )}
                  </div>
                  <div className="max-h-32 overflow-y-auto border border-subtle rounded-lg bg-[var(--bg-raised)] p-2.5 space-y-1.5">
                    {(groupedUnitTypes[selectedUnitType] || []).map((u: any) => {
                      const checked = selectedUnitIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center justify-between p-2 rounded-md border transition-colors ${
                            u.isListed
                              ? 'bg-[var(--bg-panel)]/50 border-subtle/40 text-[var(--text-muted)] cursor-not-allowed opacity-65'
                              : checked 
                                ? 'bg-[var(--bg-panel)] border-coral-500/40 text-[var(--text-primary)] cursor-pointer' 
                                : 'bg-[var(--bg-panel)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-panel)]/80 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={checked || u.isListed}
                              disabled={u.isListed}
                              onChange={(e) => {
                                if (u.isListed) return;
                                if (e.target.checked) {
                                  setSelectedUnitIds([...selectedUnitIds, u.id]);
                                } else {
                                  setSelectedUnitIds(selectedUnitIds.filter(id => id !== u.id));
                                }
                              }}
                              className="rounded border-subtle text-coral-500 focus:ring-coral-500 w-3.5 h-3.5 bg-[var(--bg-raised)] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="flex items-center gap-1.5">
                              Unit {u.label}
                              {u.isListed && (
                                <span className="text-[9px] font-extrabold text-coral-500/80 px-1.5 py-0.5 bg-coral-500/10 rounded">
                                  Syndicated
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)]">Floor: {u.floor || 'G'}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing & Image details inputs */}
              {selectedUnitIds.length > 0 && (
                <div className="bg-[var(--bg-raised)] p-4 border border-subtle rounded-xl space-y-4 animate-slide-up">
                  <h4 className="text-xs font-bold border-b border-subtle pb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-coral-500" /> Listing Financials ({wizardProperty?.currency || 'USD'})
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[var(--text-muted)]">Monthly Rent</label>
                      <input
                        type="number"
                        value={rentInput}
                        onChange={(e) => setRentInput(Number(e.target.value))}
                        className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[var(--text-muted)]">Security Deposit</label>
                      <input
                        type="number"
                        value={depositInput}
                        onChange={(e) => setDepositInput(Number(e.target.value))}
                        className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  {/* Itemized Move-In Fees */}
                  <div className="space-y-2 border-t border-subtle pt-3 text-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Itemized Move-In Fees</label>
                      <button
                        type="button"
                        onClick={handleAddFeeItem}
                        className="flex items-center gap-1 text-[10px] font-bold text-coral-500 hover:text-coral-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Move-In Fee
                      </button>
                    </div>

                    {moveInFeesList.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {moveInFeesList.map((fee, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={fee.name}
                              placeholder="e.g. Water Deposit"
                              onChange={(e) => handleUpdateFeeItem(idx, 'name', e.target.value)}
                              className="flex-1 bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                            />
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] font-medium">
                                {wizardProperty?.currency || 'USD'}
                              </span>
                              <input
                                type="number"
                                value={fee.amount}
                                placeholder="0"
                                onChange={(e) => handleUpdateFeeItem(idx, 'amount', e.target.value)}
                                className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 pl-9 pr-2 text-xs text-right focus:outline-none text-[var(--text-primary)]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeeItem(idx)}
                              className="p-1.5 bg-[var(--bg-panel)] border border-subtle text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-[var(--bg-panel)] p-2 rounded-lg border border-subtle text-[11px] font-bold">
                      <span className="text-[var(--text-muted)]">Total Move-In Fees:</span>
                      <span className="text-coral-500">
                        {formatCurrency(totalMoveInFees, wizardProperty?.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Recurring Fees Section */}
                  <div className="space-y-2 border-t border-subtle pt-3 text-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Recurring Monthly Fees</label>
                      <button
                        type="button"
                        onClick={handleAddRecurringFeeItem}
                        className="flex items-center gap-1 text-[10px] font-bold text-coral-500 hover:text-coral-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Recurring Fee
                      </button>
                    </div>

                    {recurringFeesList.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {recurringFeesList.map((fee, idx) => (
                          <div key={idx} className="flex gap-2 items-center animate-fade-in">
                            <input
                              type="text"
                              value={fee.name}
                              placeholder="e.g. Service Charge, Garbage Fee"
                              onChange={(e) => handleUpdateRecurringFeeItem(idx, 'name', e.target.value)}
                              className="flex-1 bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                            />
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] font-medium">
                                {wizardProperty?.currency || 'USD'}
                              </span>
                              <input
                                type="number"
                                value={fee.amount}
                                placeholder="0"
                                onChange={(e) => handleUpdateRecurringFeeItem(idx, 'amount', e.target.value)}
                                className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 pl-9 pr-2 text-xs text-right focus:outline-none text-[var(--text-primary)]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecurringFeeItem(idx)}
                              className="p-1.5 bg-[var(--bg-panel)] border border-subtle text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-2.5 border border-dashed border-subtle rounded-lg text-muted text-[10px] italic">
                        No recurring monthly fees configured. Click 'Add Recurring Fee' to append items (e.g. Service Charge, Security, Garbage).
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-[var(--bg-panel)] p-2 rounded-lg border border-subtle text-[11px] font-bold">
                      <span className="text-[var(--text-muted)]">Total Recurring Fees:</span>
                      <span className="text-coral-500">
                        {formatCurrency(totalRecurringFees, wizardProperty?.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="space-y-2 border-t border-subtle pt-3 text-xs">
                    <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                      Unit Type Photos (Up to 5 images)
                    </label>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      {imagesList.map((url, idx) => {
                        const isMain = idx === 0;
                        return (
                          <div 
                            key={idx} 
                            className={`relative w-16 h-16 rounded-lg overflow-hidden border bg-zinc-900 group transition-all ${
                              isMain ? 'border-coral-500 ring-2 ring-coral-500/20' : 'border-subtle'
                            }`}
                          >
                            <img src={url} alt={`unit-preview-${idx}`} className="w-full h-full object-cover" />
                            
                            {/* Main badge or selection */}
                            <div className="absolute top-0.5 left-0.5 z-10">
                              {isMain ? (
                                <span className="px-1 py-0.5 bg-coral-500 text-white rounded text-[7px] font-bold flex items-center gap-0.5 shadow-sm">
                                  <Star className="w-2 h-2 fill-current" /> Main
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newList = [...imagesList];
                                    const [selected] = newList.splice(idx, 1);
                                    newList.unshift(selected);
                                    setImagesList(newList);
                                  }}
                                  className="p-0.5 bg-black/60 hover:bg-black text-amber-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Set as Main Image"
                                >
                                  <Star className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}

                      {imagesList.length < 5 && (
                        <label className={`w-16 h-16 rounded-lg border border-dashed border-subtle flex flex-col items-center justify-center cursor-pointer hover:border-coral-500 transition-all ${uploadingImages ? 'opacity-50 cursor-wait' : ''}`}>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImages}
                            className="hidden"
                          />
                          {uploadingImages ? (
                            <Loader className="w-4 h-4 text-coral-500 animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-[var(--text-muted)]" />
                              <span className="text-[8px] text-[var(--text-muted)] mt-1 font-bold">Upload</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
