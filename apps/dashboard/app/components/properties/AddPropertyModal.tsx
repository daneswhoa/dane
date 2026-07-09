'use client';

import React, { useState, useRef } from 'react';
import { X, ChevronRight, Home, Building2, Upload, ImageIcon, Loader2, ArrowLeft, Trash2, Check } from 'lucide-react';

interface AddPropertyModalProps {
  onClose: () => void;
  onSuccess: (propertyId: string) => void;
}

export function AddPropertyModal({ onClose, onSuccess }: AddPropertyModalProps) {
  const [step, setStep] = useState(1);
  const [isMultiUnit, setIsMultiUnit] = useState(false);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [unitsCount, setUnitsCount] = useState(4);
  const [currency, setCurrency] = useState('USD');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNextStep = () => {
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload image to cloud storage.');
      }

      const data = await response.json();
      setPhotoUrl(data.photoUrl);
    } catch (err: any) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      setError('Please fill in both the property name and location.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          photoUrl: photoUrl || null,
          unitsCount: isMultiUnit ? Number(unitsCount) : 1,
          currency,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to initialize property setup.');
      }

      const data = await response.json();
      onSuccess(data.propertyId);
    } catch (err: any) {
      setError(err.message || 'An unexpected database error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fade-in">
      <div className="bg-white dark:bg-ink-800 border border-paper-250 dark:border-ink-700 rounded-lg max-w-lg w-full shadow-2xl text-left overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-paper-150 dark:border-ink-700/60 flex items-center justify-between bg-paper-50/50 dark:bg-ink-900/20">
          <div>
            <h3 className="text-xs font-bold text-paper-900 dark:text-white tracking-tight uppercase">
              Add Property Asset
            </h3>
            <p className="text-[10px] text-paper-500 dark:text-ink-400 font-semibold mt-0.5">
              Step {step} of 2 — {step === 1 ? 'Configure Asset Type' : 'Basic Specifications'}
            </p>
          </div>
          <button 
            type="button"
            disabled={isLoading}
            onClick={onClose} 
            className="text-paper-400 hover:text-paper-750 dark:hover:text-white hover:bg-paper-100 dark:hover:bg-ink-700 p-1.5 rounded transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/25 text-red-500 rounded text-[11px] font-semibold">
            {error}
          </div>
        )}

        {/* Slidable Form Carousel container */}
        <div className="overflow-hidden w-full relative">
          <div 
            className="flex transition-transform duration-500 ease-in-out w-[200%]"
            style={{ transform: step === 1 ? 'translateX(0%)' : 'translateX(-50%)' }}
          >
            
            {/* STEP 1: Property Type Selection */}
            <div className="w-1/2 p-5 flex flex-col space-y-4">
              <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">
                Select Asset Category
              </span>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Single Unit Option */}
                <button
                  type="button"
                  onClick={() => setIsMultiUnit(false)}
                  className={`p-4 border rounded-lg text-left flex flex-col gap-3 group transition-all ${
                    !isMultiUnit 
                      ? 'border-coral-500 bg-coral-500/[0.03] ring-1 ring-coral-500 dark:bg-coral-500/5' 
                      : 'border-paper-250 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-paper-400 dark:hover:border-ink-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                    !isMultiUnit ? 'bg-coral-500 text-white' : 'bg-paper-100 dark:bg-ink-700 text-paper-500 dark:text-ink-300'
                  }`}>
                    <Home className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-xs text-paper-900 dark:text-white leading-normal group-hover:text-coral-500 transition-colors">
                      Single Unit Asset
                    </h4>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 leading-relaxed">
                      Single-family house, condo, duplex with one shared rent roll ledger.
                    </p>
                  </div>

                  {/* SVG Drawing */}
                  <div className="mt-2 h-14 w-full opacity-35 dark:opacity-20 bg-paper-100 dark:bg-ink-900 rounded flex items-center justify-center p-2">
                    <svg className="w-full h-full text-paper-700 dark:text-white" fill="none" viewBox="0 0 100 40" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 35h80M25 35V20l15-10 15 10v15M33 35V26h8v9" />
                      <circle cx="70" cy="15" r="4" />
                      <line x1="65" y1="25" x2="80" y2="25" />
                    </svg>
                  </div>
                </button>

                {/* Multi-Unit Option */}
                <button
                  type="button"
                  onClick={() => setIsMultiUnit(true)}
                  className={`p-4 border rounded-lg text-left flex flex-col gap-3 group transition-all ${
                    isMultiUnit 
                      ? 'border-coral-500 bg-coral-500/[0.03] ring-1 ring-coral-500 dark:bg-coral-500/5' 
                      : 'border-paper-250 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-paper-400 dark:hover:border-ink-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                    isMultiUnit ? 'bg-coral-500 text-white' : 'bg-paper-100 dark:bg-ink-700 text-paper-500 dark:text-ink-300'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-xs text-paper-900 dark:text-white leading-normal group-hover:text-coral-500 transition-colors">
                      Multi-Unit Building
                    </h4>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 leading-relaxed">
                      Apartment complex, high-rise, mixed-use units under one property catalog.
                    </p>
                  </div>

                  {/* SVG Drawing */}
                  <div className="mt-2 h-14 w-full opacity-35 dark:opacity-20 bg-paper-100 dark:bg-ink-900 rounded flex items-center justify-center p-2">
                    <svg className="w-full h-full text-paper-700 dark:text-white" fill="none" viewBox="0 0 100 40" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 35h80M20 35V10h30v25M50 35V18h25v17" />
                      <line x1="28" y1="16" x2="34" y2="16" />
                      <line x1="28" y1="24" x2="34" y2="24" />
                      <line x1="58" y1="24" x2="64" y2="24" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-paper-150 dark:border-ink-700/60 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-coral-500 text-white rounded hover:bg-coral-600 transition-all shadow-sm shadow-coral-500/10"
                >
                  Configure Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* STEP 2: Basic Metadata Specifications */}
            <form onSubmit={handleSubmit} className="w-1/2 p-5 flex flex-col space-y-4">
              
              {/* Asset Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">
                  Property Asset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shibuya Heights"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-paper-250 dark:border-ink-700 rounded bg-white dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-all"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">
                  Location Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tokyo, Japan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-paper-250 dark:border-ink-700 rounded bg-white dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-all"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-paper-250 dark:border-ink-700 rounded bg-white dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="KES">Kenyan Shilling (KES)</option>
                </select>
              </div>

              {/* GCS Photo Upload zone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">
                  Property Image Upload <span className="text-[9px] text-paper-400 font-semibold">(GCS Cloud Storage)</span>
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoUrl ? (
                  /* Upload Success State */
                  <div className="flex items-center gap-3 p-2.5 border border-paper-200 dark:border-ink-700 rounded bg-paper-50/50 dark:bg-ink-900/40 relative">
                    <img 
                      src={photoUrl} 
                      alt="Uploaded Property Preview" 
                      className="w-12 h-12 object-cover rounded border border-paper-200 dark:border-ink-800"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Upload Completed
                      </span>
                      <p className="text-[9px] text-paper-400 dark:text-ink-500 truncate mt-0.5">
                        Saved in cloud repository
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-paper-400 hover:text-red-500 hover:bg-paper-100 dark:hover:bg-ink-700 p-1.5 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-paper-200 dark:border-ink-700 rounded-lg p-4 text-center cursor-pointer hover:border-coral-500 hover:bg-coral-500/[0.01] transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 text-coral-500 animate-spin" />
                        <span className="text-[10px] font-bold text-paper-700 dark:text-ink-300">
                          Uploading image to Google Cloud...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-paper-400" />
                        <div>
                          <span className="text-[10px] font-bold text-paper-900 dark:text-white">
                            Upload Property Photo
                          </span>
                          <p className="text-[9px] text-paper-450 dark:text-ink-500 mt-0.5">
                            Click to select photo asset
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Units count (Multi Unit only) */}
              {isMultiUnit && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider block">
                    Number of Units
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    required
                    value={unitsCount}
                    onChange={(e) => setUnitsCount(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-full px-3 py-2 text-xs border border-paper-250 dark:border-ink-700 rounded bg-white dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-all"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-paper-150 dark:border-ink-700/60 flex justify-between">
                <button
                  type="button"
                  onClick={handleBackStep}
                  disabled={isLoading || isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-paper-250 dark:border-ink-700 text-paper-700 dark:text-ink-200 rounded hover:bg-paper-100 dark:hover:bg-ink-700 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploading || !name || !address}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-coral-500 text-white rounded hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-coral-500/10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Initialize Setup'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
