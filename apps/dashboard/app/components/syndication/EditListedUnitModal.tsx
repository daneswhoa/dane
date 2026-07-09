'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Loader, Sliders, Plus, Trash2, Camera, Map, Globe, Check, Star 
} from 'lucide-react';
import { ListedUnitData, PRESET_AMENITIES, COUNTY_COORDINATES, formatCurrency } from './types';
import KENYAN_COUNTIES from './kenyan_counties.json';

interface EditListedUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: ListedUnitData | null;
  onSuccess: () => void;
}

export const EditListedUnitModal: React.FC<EditListedUnitModalProps> = ({
  isOpen,
  onClose,
  unit,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'financials' | 'location' | 'amenities'>('financials');
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [rentInput, setRentInput] = useState<number>(0);
  const [depositInput, setDepositInput] = useState<number>(0);
  const [moveInFeesList, setMoveInFeesList] = useState<{ name: string; amount: number }[]>([]);
  const [recurringFeesList, setRecurringFeesList] = useState<{ name: string; amount: number }[]>([]);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Location
  const [county, setCounty] = useState('Nairobi');
  const [countySearchInput, setCountySearchInput] = useState('Nairobi');
  const [showCountySuggestions, setShowCountySuggestions] = useState(false);
  const [subcounty, setSubcounty] = useState('');
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8219);

  // Amenities & Rules
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState('');

  // Map refs
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const countySuggestionsRef = useRef<HTMLDivElement | null>(null);

  // Initialize form state when unit is passed
  useEffect(() => {
    if (isOpen && unit) {
      setRentInput(unit.rent);
      setDepositInput(unit.deposit);
      
      let initialMoveIn: { name: string; amount: number }[] = [];
      if (unit.moveInFeeDetails) {
        try {
          initialMoveIn = JSON.parse(unit.moveInFeeDetails);
        } catch (e) {
          console.error(e);
        }
      }
      if (initialMoveIn.length === 0 && unit.moveInFees > 0) {
        initialMoveIn = [{ name: 'Setup Fee', amount: unit.moveInFees }];
      }
      setMoveInFeesList(initialMoveIn);

      let initialRecur: { name: string; amount: number }[] = [];
      if (unit.recurringFeeDetails) {
        try {
          initialRecur = JSON.parse(unit.recurringFeeDetails);
        } catch (e) {
          console.error(e);
        }
      }
      if (initialRecur.length === 0 && unit.recurringFees > 0) {
        initialRecur = [{ name: 'Service Charge', amount: unit.recurringFees }];
      }
      setRecurringFeesList(initialRecur);

      let initialImages: string[] = [];
      if (unit.images) {
        try {
          initialImages = JSON.parse(unit.images);
        } catch (e) {
          console.error(e);
        }
      }
      setImagesList(initialImages);

      setCounty(unit.county || 'Nairobi');
      setCountySearchInput(unit.county || 'Nairobi');
      setSubcounty(unit.subcounty || '');
      setLatitude(unit.latitude || -1.2921);
      setLongitude(unit.longitude || 36.8219);

      let initialAmenities: string[] = [];
      if (unit.amenities) {
        try {
          initialAmenities = JSON.parse(unit.amenities);
        } catch (e) {
          console.error(e);
        }
      }
      setSelectedAmenities(initialAmenities);

      let initialRules: string[] = [];
      if (unit.rules) {
        try {
          initialRules = JSON.parse(unit.rules);
        } catch (e) {
          console.error(e);
        }
      }
      setRules(initialRules);

      setActiveTab('financials');
    }
  }, [isOpen, unit]);

  // Click outside for county suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countySuggestionsRef.current && !countySuggestionsRef.current.contains(e.target as Node)) {
        setShowCountySuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Leaflet css/js load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Map initialize/destroy
  useEffect(() => {
    if (activeTab !== 'location') {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        leafletMarkerRef.current = null;
      }
      return;
    }
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L || leafletMapRef.current) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 12);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
    leafletMarkerRef.current = marker;

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLatitude(Number(position.lat.toFixed(5)));
      setLongitude(Number(position.lng.toFixed(5)));
    });

    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLatitude(Number(lat.toFixed(5)));
      setLongitude(Number(lng.toFixed(5)));
    });

    setTimeout(() => map.invalidateSize(), 250);
  }, [mapLoaded, activeTab]);

  // Sync inputs with marker
  useEffect(() => {
    if (leafletMapRef.current && leafletMarkerRef.current) {
      const markerLatLng = leafletMarkerRef.current.getLatLng();
      if (markerLatLng.lat !== latitude || markerLatLng.lng !== longitude) {
        leafletMarkerRef.current.setLatLng([latitude, longitude]);
        leafletMapRef.current.setView([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  if (!isOpen || !unit) return null;

  const totalMoveInFees = moveInFeesList.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalRecurringFees = recurringFeesList.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const filteredCountySuggestions = KENYAN_COUNTIES.filter(c =>
    c.name.toLowerCase().includes(countySearchInput.toLowerCase())
  );

  const handleSelectCounty = (countyName: string) => {
    setCounty(countyName);
    setCountySearchInput(countyName);
    setShowCountySuggestions(false);
    const matched = KENYAN_COUNTIES.find(c => c.name === countyName);
    setSubcounty(matched?.subcounties[0] || '');
    const coords = COUNTY_COORDINATES[countyName];
    if (coords) {
      setLatitude(coords.lat);
      setLongitude(coords.lng);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const filesToUpload = Array.from(e.target.files);

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

  const handleSetMainImage = (index: number) => {
    const newList = [...imagesList];
    const [selected] = newList.splice(index, 1);
    newList.unshift(selected);
    setImagesList(newList);
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, idx) => idx !== index));
  };

  const handleAddFeeItem = () => setMoveInFeesList([...moveInFeesList, { name: '', amount: 0 }]);
  const handleRemoveFeeItem = (index: number) => setMoveInFeesList(moveInFeesList.filter((_, idx) => idx !== index));
  const handleUpdateFeeItem = (index: number, field: 'name' | 'amount', value: any) => {
    const updated = [...moveInFeesList];
    if (field === 'name') updated[index].name = value;
    else updated[index].amount = Number(value) || 0;
    setMoveInFeesList(updated);
  };

  const handleAddRecurringFeeItem = () => setRecurringFeesList([...recurringFeesList, { name: '', amount: 0 }]);
  const handleRemoveRecurringFeeItem = (index: number) => setRecurringFeesList(recurringFeesList.filter((_, idx) => idx !== index));
  const handleUpdateRecurringFeeItem = (index: number, field: 'name' | 'amount', value: any) => {
    const updated = [...recurringFeesList];
    if (field === 'name') updated[index].name = value;
    else updated[index].amount = Number(value) || 0;
    setRecurringFeesList(updated);
  };

  const handleAddRule = () => {
    if (ruleInput.trim() && !rules.includes(ruleInput.trim())) {
      setRules([...rules, ruleInput.trim()]);
      setRuleInput('');
    }
  };
  const handleRemoveRule = (index: number) => setRules(rules.filter((_, idx) => idx !== index));

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const payload = {
        rent: rentInput,
        deposit: depositInput,
        moveInFees: totalMoveInFees,
        moveInFeeDetails: JSON.stringify(moveInFeesList),
        recurringFees: totalRecurringFees,
        recurringFeeDetails: JSON.stringify(recurringFeesList),
        images: imagesList,
        county,
        subcounty,
        latitude,
        longitude,
        amenities: selectedAmenities,
        rules,
      };

      const res = await fetch(`${host}/api/dashboard/syndication/update-unit/${unit.unitId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Could not update listed unit.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating listed unit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-panel)] w-full max-w-2xl rounded-2xl border border-subtle overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-subtle flex justify-between items-center bg-[var(--bg-raised)]/30">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Edit Syndicated Unit Listing
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Unit {unit.label} • {unit.propertyName} ({unit.unitType})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-raised)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-subtle bg-[var(--bg-raised)]/10 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'financials'
                ? 'border-coral-500 text-coral-500'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Financials & Photos
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'location'
                ? 'border-coral-500 text-coral-500'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Location Pinning
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === 'amenities'
                ? 'border-coral-500 text-coral-500'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Amenities & Rules
          </button>
        </div>

        {/* Content Pane */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[60vh] custom-scrollbar">
          
          {/* TAB 1: Financials & Photos */}
          {activeTab === 'financials' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Monthly Rent</label>
                  <input
                    type="number"
                    value={rentInput}
                    onChange={(e) => setRentInput(Number(e.target.value))}
                    className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Security Deposit</label>
                  <input
                    type="number"
                    value={depositInput}
                    onChange={(e) => setDepositInput(Number(e.target.value))}
                    className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Move-In Fees */}
              <div className="space-y-2 pt-2 border-t border-subtle text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Move-In Fee Items</label>
                  <button
                    type="button"
                    onClick={handleAddFeeItem}
                    className="flex items-center gap-1 text-[10px] font-bold text-coral-500 hover:text-coral-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Fee Item
                  </button>
                </div>
                {moveInFeesList.map((fee, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={fee.name}
                      placeholder="e.g. Legal Fee"
                      onChange={(e) => handleUpdateFeeItem(idx, 'name', e.target.value)}
                      className="flex-1 bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                    />
                    <div className="relative w-24">
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={(e) => handleUpdateFeeItem(idx, 'amount', e.target.value)}
                        className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs text-right focus:outline-none text-[var(--text-primary)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeeItem(idx)}
                      className="p-1.5 bg-[var(--bg-raised)] border border-subtle text-[var(--text-muted)] hover:text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="bg-[var(--bg-raised)]/50 p-2 rounded-lg border border-subtle text-[11px] font-bold flex justify-between">
                  <span className="text-[var(--text-muted)]">Total Move-In Fees:</span>
                  <span className="text-coral-500">{formatCurrency(totalMoveInFees)}</span>
                </div>
              </div>

              {/* Recurring Monthly Fees */}
              <div className="space-y-2 pt-2 border-t border-subtle text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Recurring Monthly Fee Items</label>
                  <button
                    type="button"
                    onClick={handleAddRecurringFeeItem}
                    className="flex items-center gap-1 text-[10px] font-bold text-coral-500 hover:text-coral-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Recurring Item
                  </button>
                </div>
                {recurringFeesList.map((fee, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={fee.name}
                      placeholder="e.g. Garbage Fee"
                      onChange={(e) => handleUpdateRecurringFeeItem(idx, 'name', e.target.value)}
                      className="flex-1 bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                    />
                    <div className="relative w-24">
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={(e) => handleUpdateRecurringFeeItem(idx, 'amount', e.target.value)}
                        className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs text-right focus:outline-none text-[var(--text-primary)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecurringFeeItem(idx)}
                      className="p-1.5 bg-[var(--bg-raised)] border border-subtle text-[var(--text-muted)] hover:text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="bg-[var(--bg-raised)]/50 p-2 rounded-lg border border-subtle text-[11px] font-bold flex justify-between">
                  <span className="text-[var(--text-muted)]">Total Recurring Fees:</span>
                  <span className="text-coral-500">{formatCurrency(totalRecurringFees)}</span>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2 pt-2 border-t border-subtle text-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Photos Gallery (Up to 5 images)</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {imagesList.map((url, idx) => {
                    const isMain = idx === 0;
                    return (
                      <div 
                        key={idx} 
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border bg-zinc-900 group transition-all ${
                          isMain ? 'border-coral-500 ring-2 ring-coral-500/20' : 'border-subtle'
                        }`}
                      >
                        <img src={url} alt={`unit-preview-${idx}`} className="w-full h-full object-cover" />
                        
                        {/* Main Star indicator */}
                        <div className="absolute top-1 left-1 z-10">
                          {isMain ? (
                            <span className="p-0.5 bg-coral-500 text-white rounded shadow-sm text-[8px] font-bold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> Main
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="p-1 bg-black/60 hover:bg-black text-amber-400 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Set as Main Image"
                            >
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Delete photo overlay */}
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
                    <label className={`w-20 h-20 rounded-xl border border-dashed border-subtle flex flex-col items-center justify-center cursor-pointer hover:border-coral-500 transition-all ${uploadingImages ? 'opacity-50 cursor-wait' : ''}`}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                        className="hidden"
                      />
                      {uploadingImages ? (
                        <Loader className="w-5 h-5 text-coral-500 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-5 h-5 text-[var(--text-muted)]" />
                          <span className="text-[9px] text-[var(--text-muted)] mt-1 font-bold">Upload</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Location Pinning */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 relative" ref={countySuggestionsRef}>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Kenyan County</label>
                  <input
                    type="text"
                    value={countySearchInput}
                    onChange={(e) => {
                      setCountySearchInput(e.target.value);
                      setShowCountySuggestions(true);
                      const found = KENYAN_COUNTIES.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                      if (found) {
                        setCounty(found.name);
                        setSubcounty(found.subcounties[0] || '');
                        const coords = COUNTY_COORDINATES[found.name];
                        if (coords) {
                          setLatitude(coords.lat);
                          setLongitude(coords.lng);
                        }
                      }
                    }}
                    onFocus={() => setShowCountySuggestions(true)}
                    placeholder="Search County (e.g. Mombasa)"
                    className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 text-[var(--text-primary)]"
                  />
                  {showCountySuggestions && filteredCountySuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-[var(--bg-panel)] border border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCountySuggestions.map((c) => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => handleSelectCounty(c.name)}
                          className="w-full text-left px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-raised)] hover:text-coral-500 transition-colors border-b border-subtle/50 last:border-b-0"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Sub-County</label>
                  <select
                    value={subcounty}
                    onChange={(e) => setSubcounty(e.target.value)}
                    className="w-full bg-[var(--bg-raised)] border border-subtle rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 text-[var(--text-primary)]"
                  >
                    {(KENYAN_COUNTIES.find(c => c.name === county)?.subcounties || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Map Container */}
              <div className="space-y-2 bg-[var(--bg-raised)] p-4 border border-subtle rounded-xl">
                <div className="flex justify-between items-center border-b border-subtle pb-2 mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                    <Map className="w-3.5 h-3.5 text-coral-500" /> OpenStreetMap Interactive Pinner
                  </label>
                </div>

                <div 
                  ref={mapContainerRef} 
                  className="w-full h-[240px] bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden relative z-10"
                >
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 z-20 text-xs text-[var(--text-muted)] space-y-1">
                      <Loader className="w-6 h-6 animate-spin text-coral-500" />
                      <span>Loading interactive OSM map...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-muted)] font-semibold">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(Number(e.target.value).toFixed(5)))}
                      className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-muted)] font-semibold">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(Number(e.target.value).toFixed(5)))}
                      className="w-full bg-[var(--bg-panel)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Amenities & Rules */}
          {activeTab === 'amenities' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Available Amenities</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PRESET_AMENITIES.map((amenity) => {
                    const checked = selectedAmenities.includes(amenity.slug);
                    return (
                      <button
                        type="button"
                        key={amenity.slug}
                        onClick={() => {
                          if (checked) {
                            setSelectedAmenities(selectedAmenities.filter(s => s !== amenity.slug));
                          } else {
                            setSelectedAmenities([...selectedAmenities, amenity.slug]);
                          }
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          checked
                            ? 'bg-coral-500/10 border-coral-500 text-coral-500'
                            : 'bg-[var(--bg-raised)] border-subtle hover:bg-[var(--bg-raised)]/70 text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="font-medium">{amenity.label}</span>
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          checked ? 'bg-coral-500 border-coral-500 text-white' : 'border-subtle'
                        }`}>
                          {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-2.5 border-t border-subtle pt-4 text-xs">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tenant / Building Rules</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Quiet hours after 10 PM"
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRule();
                      }
                    }}
                    className="flex-1 bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-3.5 py-1.5 bg-[var(--bg-raised)] border border-subtle text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/80 text-xs font-semibold rounded-lg"
                  >
                    Add Rule
                  </button>
                </div>

                {rules.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2.5 border border-subtle rounded-lg bg-[var(--bg-raised)]/50">
                    {rules.map((rule, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-panel)] text-[var(--text-primary)] text-[10px] rounded-md border border-subtle"
                      >
                        <span>{rule}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(idx)}
                          className="text-[var(--text-muted)] hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-[var(--text-muted)] italic">No rules specified.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-subtle flex justify-end gap-2.5 bg-[var(--bg-raised)]/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-subtle text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-lg text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
