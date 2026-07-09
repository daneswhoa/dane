import { useState, useEffect } from 'react';
import { Property, COUNTY_COORDINATES } from './types';
import KENYAN_COUNTIES from './kenyan_counties.json';

export const useSyndicationWizard = (
  isOpen: boolean,
  properties: Property[],
  onSuccess: () => void,
  onClose: () => void
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [wizardPropId, setWizardPropId] = useState('');
  const [wizardProperty, setWizardProperty] = useState<Property | null>(null);
  const [vacantUnits, setVacantUnits] = useState<any[]>([]);
  const [groupedUnitTypes, setGroupedUnitTypes] = useState<Record<string, any[]>>({});
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [rentInput, setRentInput] = useState<number>(0);
  const [depositInput, setDepositInput] = useState<number>(0);
  
  // Move-in fees
  const [moveInFeesList, setMoveInFeesList] = useState<{ name: string; amount: number }[]>([]);
  const totalMoveInFees = moveInFeesList.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // Recurring monthly fees
  const [recurringFeesList, setRecurringFeesList] = useState<{ name: string; amount: number }[]>([]);
  const totalRecurringFees = recurringFeesList.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  // Images
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Location
  const [county, setCounty] = useState('Nairobi');
  const [subcounty, setSubcounty] = useState('');
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8219);

  const [loadingPropertyUnits, setLoadingPropertyUnits] = useState(false);
  const [countySearchInput, setCountySearchInput] = useState('Nairobi');
  const [showCountySuggestions, setShowCountySuggestions] = useState(false);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState('');

  // Reset fields on modal open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setWizardPropId('');
      setWizardProperty(null);
      setVacantUnits([]);
      setGroupedUnitTypes({});
      setSelectedUnitType('');
      setSelectedUnitIds([]);
      setRentInput(0);
      setDepositInput(0);
      setMoveInFeesList([]);
      setRecurringFeesList([]);
      setImagesList([]);
      setUploadingImages(false);
      setCounty('Nairobi');
      setCountySearchInput('Nairobi');
      const defaultSub = KENYAN_COUNTIES.find(c => c.name === 'Nairobi')?.subcounties[0] || '';
      setSubcounty(defaultSub);
      setLatitude(-1.2921);
      setLongitude(36.8219);
      setSelectedAmenities([]);
      setRules([]);
      setRuleInput('');
    }
  }, [isOpen]);

  // Fetch unit details when property changes
  const handleWizardPropertyChange = async (propertyId: string) => {
    setWizardPropId(propertyId);
    setSelectedUnitType('');
    setSelectedUnitIds([]);
    
    const propObj = properties.find(p => p.id === propertyId) || null;
    setWizardProperty(propObj);

    if (!propertyId) {
      setVacantUnits([]);
      setGroupedUnitTypes({});
      return;
    }

    try {
      setLoadingPropertyUnits(true);
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${host}/api/dashboard/properties/${propertyId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const vacantAll = (data.units || []).filter(
          (u: any) => u.status === 'vacant'
        );
        setVacantUnits(vacantAll);

        const grouped = vacantAll.reduce((acc: any, u: any) => {
          const type = u.unitType || 'Standard';
          if (!acc[type]) acc[type] = [];
          acc[type].push(u);
          return acc;
        }, {});
        setGroupedUnitTypes(grouped);

        if (data.property?.latitude && data.property?.longitude) {
          setLatitude(Number(data.property.latitude));
          setLongitude(Number(data.property.longitude));
        }
        if (data.property?.county) {
          setCounty(data.property.county);
          setCountySearchInput(data.property.county);
          setSubcounty(data.property.subcounty || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPropertyUnits(false);
    }
  };

  const handleUnitTypeChange = (type: string) => {
    setSelectedUnitType(type);
    const unitsOfType = groupedUnitTypes[type] || [];
    setSelectedUnitIds([]);
    
    if (unitsOfType.length > 0) {
      const totalRent = unitsOfType.reduce((sum, u) => sum + Number(u.rent || 0), 0);
      const totalDeposit = unitsOfType.reduce((sum, u) => sum + Number(u.deposit || 0), 0);
      const totalFees = unitsOfType.reduce((sum, u) => sum + Number(u.moveInFees || 0), 0);
      const totalRecur = unitsOfType.reduce((sum, u) => sum + Number(u.recurringFees || 0), 0);

      setRentInput(Math.round(totalRent / unitsOfType.length));
      setDepositInput(Math.round(totalDeposit / unitsOfType.length));

      let initialFees: { name: string; amount: number }[] = [];
      let initialRecur: { name: string; amount: number }[] = [];
      let initialImages: string[] = [];
      const firstUnit = unitsOfType[0];

      if (firstUnit) {
        if (firstUnit.moveInFeeDetails) {
          try {
            initialFees = JSON.parse(firstUnit.moveInFeeDetails);
          } catch (e) {
            console.error(e);
          }
        }
        if (firstUnit.recurringFeeDetails) {
          try {
            initialRecur = JSON.parse(firstUnit.recurringFeeDetails);
          } catch (e) {
            console.error(e);
          }
        }
        if (firstUnit.images) {
          try {
            initialImages = JSON.parse(firstUnit.images);
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (initialFees.length === 0 && totalFees > 0) {
        initialFees = [{ name: 'Setup Fee', amount: Math.round(totalFees / unitsOfType.length) }];
      }
      if (initialRecur.length === 0 && totalRecur > 0) {
        initialRecur = [{ name: 'Service Charge', amount: Math.round(totalRecur / unitsOfType.length) }];
      }

      setMoveInFeesList(initialFees);
      setRecurringFeesList(initialRecur);
      setImagesList(initialImages);
    } else {
      setRentInput(0);
      setDepositInput(0);
      setMoveInFeesList([]);
      setRecurringFeesList([]);
      setImagesList([]);
    }
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

  const handleSelectCounty = (countyName: string) => {
    setCounty(countyName);
    setCountySearchInput(countyName);
    setShowCountySuggestions(false);
    const matchedCounty = KENYAN_COUNTIES.find(c => c.name === countyName);
    setSubcounty(matchedCounty?.subcounties[0] || '');
    const coords = COUNTY_COORDINATES[countyName];
    if (coords) {
      setLatitude(coords.lat);
      setLongitude(coords.lng);
    }
  };

  const handleAddRule = () => {
    if (ruleInput.trim() && !rules.includes(ruleInput.trim())) {
      setRules([...rules, ruleInput.trim()]);
      setRuleInput('');
    }
  };
  const handleRemoveRule = (index: number) => setRules(rules.filter((_, idx) => idx !== index));

  const handleListUnitsSubmit = async () => {
    if (!wizardPropId || selectedUnitIds.length === 0) return;
    setSubmitting(true);
    try {
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const payload = {
        propertyId: wizardPropId,
        unitIds: selectedUnitIds,
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
      const res = await fetch(`${host}/api/dashboard/syndication/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to list units. Please verify entries.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
};
