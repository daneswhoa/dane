'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Loader } from 'lucide-react';
import { Property } from './types';
import KENYAN_COUNTIES from './kenyan_counties.json';
import { PropertyVacancyStep } from './PropertyVacancyStep';
import { LocationMappingStep } from './LocationMappingStep';
import { AmenitiesRulesStep } from './AmenitiesRulesStep';
import { useSyndicationWizard } from './useSyndicationWizard';

interface SyndicationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSuccess: () => void;
}

export const SyndicationWizardModal: React.FC<SyndicationWizardModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSuccess,
}) => {
  const {
    currentStep,
    setCurrentStep,
    submitting,
    wizardPropId,
    wizardProperty,
    vacantUnits,
    groupedUnitTypes,
    selectedUnitType,
    selectedUnitIds,
    setSelectedUnitIds,
    rentInput,
    setRentInput,
    depositInput,
    setDepositInput,
    moveInFeesList,
    totalMoveInFees,
    recurringFeesList,
    totalRecurringFees,
    imagesList,
    setImagesList,
    uploadingImages,
    setUploadingImages,
    county,
    setCounty,
    subcounty,
    setSubcounty,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    loadingPropertyUnits,
    countySearchInput,
    setCountySearchInput,
    showCountySuggestions,
    setShowCountySuggestions,
    selectedAmenities,
    setSelectedAmenities,
    rules,
    ruleInput,
    setRuleInput,
    handleWizardPropertyChange,
    handleUnitTypeChange,
    handleAddFeeItem,
    handleRemoveFeeItem,
    handleUpdateFeeItem,
    handleAddRecurringFeeItem,
    handleRemoveRecurringFeeItem,
    handleUpdateRecurringFeeItem,
    handleSelectCounty,
    handleAddRule,
    handleRemoveRule,
    handleListUnitsSubmit,
  } = useSyndicationWizard(isOpen, properties, onSuccess, onClose);

  // Leaflet map refs & states
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const countySuggestionsRef = useRef<HTMLDivElement | null>(null);

  const filteredCountySuggestions = KENYAN_COUNTIES.filter(c =>
    c.name.toLowerCase().includes(countySearchInput.toLowerCase())
  );

  // County suggestion click outside clicker
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countySuggestionsRef.current && !countySuggestionsRef.current.contains(e.target as Node)) {
        setShowCountySuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowCountySuggestions]);

  // Dynamic Leaflet Loading
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

  // Leaflet Map Initialization and Destroy
  useEffect(() => {
    if (currentStep !== 2) {
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
  }, [mapLoaded, currentStep]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[var(--bg-panel)] border border-subtle rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-subtle bg-[var(--bg-panel)] flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Syndicate Rental Vacancies</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Configure listing criteria and push to search networks.</p>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper progress */}
        <div className="bg-[var(--bg-raised)] px-6 py-3 border-b border-subtle flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-coral-500 text-white' : 'bg-[var(--bg-panel)] border border-subtle'}`}>1</span>
            <span className={currentStep === 1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>Property & Vacancy</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-coral-500 text-white' : 'bg-[var(--bg-panel)] border border-subtle'}`}>2</span>
            <span className={currentStep === 2 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>Location & Mapping</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-coral-500 text-white' : 'bg-[var(--bg-panel)] border border-subtle'}`}>3</span>
            <span className={currentStep === 3 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>Amenities & Rules</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {currentStep === 1 && (
            <PropertyVacancyStep
              wizardPropId={wizardPropId}
              properties={properties}
              handleWizardPropertyChange={handleWizardPropertyChange}
              loadingPropertyUnits={loadingPropertyUnits}
              vacantUnits={vacantUnits}
              groupedUnitTypes={groupedUnitTypes}
              selectedUnitType={selectedUnitType}
              handleUnitTypeChange={handleUnitTypeChange}
              selectedUnitIds={selectedUnitIds}
              setSelectedUnitIds={setSelectedUnitIds}
              wizardProperty={wizardProperty}
              rentInput={rentInput}
              setRentInput={setRentInput}
              depositInput={depositInput}
              setDepositInput={setDepositInput}
              moveInFeesList={moveInFeesList}
              handleAddFeeItem={handleAddFeeItem}
              handleRemoveFeeItem={handleRemoveFeeItem}
              handleUpdateFeeItem={handleUpdateFeeItem}
              totalMoveInFees={totalMoveInFees}
              
              recurringFeesList={recurringFeesList}
              handleAddRecurringFeeItem={handleAddRecurringFeeItem}
              handleRemoveRecurringFeeItem={handleRemoveRecurringFeeItem}
              handleUpdateRecurringFeeItem={handleUpdateRecurringFeeItem}
              totalRecurringFees={totalRecurringFees}
              imagesList={imagesList}
              setImagesList={setImagesList}
              uploadingImages={uploadingImages}
              setUploadingImages={setUploadingImages}
            />
          )}

          {currentStep === 2 && (
            <LocationMappingStep
              countySearchInput={countySearchInput}
              setCountySearchInput={setCountySearchInput}
              showCountySuggestions={showCountySuggestions}
              setShowCountySuggestions={setShowCountySuggestions}
              countySuggestionsRef={countySuggestionsRef}
              county={county}
              setCounty={setCounty}
              subcounty={subcounty}
              setSubcounty={setSubcounty}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              mapContainerRef={mapContainerRef}
              mapLoaded={mapLoaded}
              filteredCountySuggestions={filteredCountySuggestions}
              handleSelectCounty={handleSelectCounty}
            />
          )}

          {currentStep === 3 && (
            <AmenitiesRulesStep
              selectedAmenities={selectedAmenities}
              setSelectedAmenities={setSelectedAmenities}
              rules={rules}
              ruleInput={ruleInput}
              setRuleInput={setRuleInput}
              handleAddRule={handleAddRule}
              handleRemoveRule={handleRemoveRule}
            />
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-subtle bg-[var(--bg-panel)] flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-raised)] border border-subtle text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/80 text-xs font-bold rounded-lg transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] text-xs font-bold rounded-lg transition-all">
              Cancel
            </button>
            {currentStep < 3 ? (
              <button type="button" disabled={currentStep === 1 && (!wizardPropId || selectedUnitIds.length === 0)} onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-1 px-4 py-2 bg-coral-500 text-white hover:bg-coral-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-xs font-bold rounded-lg transition-all shadow-sm shadow-coral-500/20">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button type="button" disabled={submitting} onClick={handleListUnitsSubmit} className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/10">
                {submitting ? (
                  <><Loader className="w-3.5 h-3.5 animate-spin" /> Publishing...</>
                ) : (
                  <><Check className="w-3.5 h-3.5" /> Publish Listing</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
