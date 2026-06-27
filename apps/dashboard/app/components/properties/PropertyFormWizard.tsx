'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

import { WizardState, initialWizardState, UnitRow, UnitTypeConfig } from './types';
import { parseExcelRoster, downloadXlsxRosterTemplate } from './utils/excelHelper';
import { RestoreModal } from './components/RestoreModal';
import { ConfettiSplash } from './components/ConfettiSplash';
import { StepClassification } from './components/StepClassification';
import { StepIdentity } from './components/StepIdentity';
import { StepLocation } from './components/StepLocation';
import { StepUnitConfig } from './components/StepUnitConfig';
import { StepGridEditor } from './components/StepGridEditor';
import { StepMediaConfirm } from './components/StepMediaConfirm';

const LIMITS = { propertyName: 60, propertyAddress: 120, taxId: 20 };

export default function PropertyFormWizard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<WizardState>(initialWizardState);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [successConfetti, setSuccessConfetti] = useState(false);
  const [excelParsedSuccess, setExcelParsedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('landlordnl_property_wizard_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.propertyName || parsed.propertyAddress) setShowRestoreModal(true);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (formState.propertyName || formState.propertyAddress) {
      localStorage.setItem('landlordnl_property_wizard_v3', JSON.stringify(formState));
    }
  }, [formState]);

  const updateField = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key as string];
        return updated;
      });
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelRoster(
      file,
      formState.propertyType,
      (parsedUnits, uniqueTypes) => {
        const updatedUnits = parsedUnits.map((unit) => {
          const cfg = formState.unitTypeConfigs[unit.unitType] || {
            unitType: unit.unitType,
            depositMultiplier: '1x',
            customDeposit: '0',
            otherMoveInFees: [],
            garbageFee: '0',
            otherRecurringFees: [],
            utilities: [],
          };

          const rentNum = parseFloat(unit.rent) || 0;
          let depositVal = rentNum;
          if (cfg.depositMultiplier === '2x') depositVal = rentNum * 2;
          else if (cfg.depositMultiplier === '3x') depositVal = rentNum * 3;
          else if (cfg.depositMultiplier === 'custom') depositVal = parseFloat(cfg.customDeposit) || 0;

          const otherMoveInSum = cfg.otherMoveInFees.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
          const totalMoveIn = depositVal + otherMoveInSum;

          const garbageVal = parseFloat(cfg.garbageFee) || 0;
          const otherRecurringSum = cfg.otherRecurringFees.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
          const totalRecurring = rentNum + garbageVal + otherRecurringSum;

          return {
            ...unit,
            deposit: unit.deposit || depositVal.toString(),
            moveInFees: unit.moveInFees || totalMoveIn.toString(),
            recurringFees: unit.recurringFees || totalRecurring.toString(),
          };
        });

        setFormState((prev) => ({
          ...prev,
          units: updatedUnits,
          unitTypes: uniqueTypes.length > 0 ? uniqueTypes : prev.unitTypes,
          step: 5,
        }));
        setExcelParsedSuccess(true);
        setErrors({});
      },
      (errorMsg) => {
        setErrors((prev) => ({ ...prev, excel: errorMsg }));
      }
    );
  };

  const applyTemplateConfigs = () => {
    const updatedUnits = formState.units.map((unit) => {
      const cfg = formState.unitTypeConfigs[unit.unitType] || {
        unitType: unit.unitType,
        depositMultiplier: '1x',
        customDeposit: '0',
        otherMoveInFees: [],
        garbageFee: '0',
        otherRecurringFees: [],
        utilities: [],
      };

      const rentNum = parseFloat(unit.rent) || 0;
      let depositVal = rentNum;
      if (cfg.depositMultiplier === '2x') depositVal = rentNum * 2;
      else if (cfg.depositMultiplier === '3x') depositVal = rentNum * 3;
      else if (cfg.depositMultiplier === 'custom') depositVal = parseFloat(cfg.customDeposit) || 0;

      const otherMoveInSum = cfg.otherMoveInFees.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const totalMoveIn = depositVal + otherMoveInSum;

      const garbageVal = parseFloat(cfg.garbageFee) || 0;
      const otherRecurringSum = cfg.otherRecurringFees.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const totalRecurring = rentNum + garbageVal + otherRecurringSum;

      return {
        ...unit,
        deposit: depositVal.toString(),
        moveInFees: totalMoveIn.toString(),
        recurringFees: totalRecurring.toString(),
      };
    });
    updateField('units', updatedUnits);
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 2) {
      if (!formState.propertyName.trim()) newErrors.propertyName = 'Property display name is required.';
      else if (formState.propertyName.length > LIMITS.propertyName) {
        newErrors.propertyName = `Property name must not exceed ${LIMITS.propertyName} characters.`;
      }
    }
    if (currentStep === 3) {
      if (!formState.propertyAddress.trim()) newErrors.propertyAddress = 'Full physical address is required.';
      else if (formState.propertyAddress.length > LIMITS.propertyAddress) {
        newErrors.propertyAddress = `Address must not exceed ${LIMITS.propertyAddress} characters.`;
      }
    }
    if (currentStep === 4) {
      if (formState.setupMode === 'multi' && formState.setupType === 'excel' && formState.units.length === 0) {
        newErrors.excel = 'Please upload and parse an Excel sheet roster.';
      }
    }
    if (currentStep === 5) {
      const missingId = formState.units.some((u) => !u.unitId.trim());
      if (missingId) newErrors.units = 'All units must have a Unit ID.';
      else {
        const ids = formState.units.map((u) => u.unitId.trim().toUpperCase());
        if (ids.some((val, i) => ids.indexOf(val) !== i)) newErrors.units = 'All Unit IDs must be unique.';
      }
    }
    if (currentStep === 6 && !formState.uploadedImageUrl) {
      newErrors.image = 'You must upload a property cover photo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(formState.step)) {
      if (formState.step === 4) {
        if (formState.setupMode === 'multi' && formState.setupType === 'ui') {
          // Generate manual placeholder units if list is empty
          const generated = Array.from({ length: formState.identicalCount }).map((_, idx) => {
            const num = idx + 101;
            const uType = formState.unitTypes[idx % formState.unitTypes.length] || 'Studio';
            return {
              unitId: `U${num}`.slice(0, 5),
              unitName: `Unit ${num}`,
              floor: Math.floor(idx / 10 + 1).toString(),
              unitType: uType,
              rent: formState.identicalRent || '1500',
              deposit: '0',
              moveInFees: '0',
              recurringFees: '0',
              tenantName: '',
              tenantEmail: '',
              tenantPhone: '',
              moveInDate: '',
              arrears: '0',
            };
          });
          setFormState(prev => ({ ...prev, units: generated }));
        }
        setTimeout(() => applyTemplateConfigs(), 50);
      }
      updateField('step', formState.step + 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(10);
    try {
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const data = await signRes.json();
      if (!signRes.ok) {
        throw new Error(data.error || 'Failed to generate upload URL');
      }

      const { uploadUrl, publicUrl } = data;

      // Actually upload the file to GCS using the signed URL
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed with status ${uploadRes.status}`);
      }

      updateField('uploadedImageUrl', publicUrl);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, image: err.message || 'Upload to storage bucket failed.' }));
      setUploadProgress(null);
    }
  };

  const handleSave = async () => {
    if (!validateStep(formState.step)) return;
    if (isSaving) return;
    
    setIsSaving(true);

    const existingPropsStr = localStorage.getItem('landlordnl_properties_list');
    let propertiesList = existingPropsStr ? JSON.parse(existingPropsStr) : [];
    const totalRentSum = formState.units.reduce((sum, u) => sum + (Number(u.rent) || 0), 0);
    const avgRentVal = formState.units.length > 0 ? Math.round(totalRentSum / formState.units.length) : 0;
    const occupiedCount = formState.units.filter((u) => u.tenantName.trim()).length;
    const occupancyRate = formState.units.length > 0 ? Math.round((occupiedCount / formState.units.length) * 100) : 100;

    const newProperty = {
      id: `prop-${Date.now()}`,
      name: formState.propertyName,
      address: formState.propertyAddress,
      type: formState.propertyType,
      avgRent: `$${avgRentVal.toLocaleString()}/mo Avg`,
      image: formState.uploadedImageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=250',
      badge: 'Active Asset',
      badgeType: 'success',
      units: formState.units.length,
      occupancy: `${occupancyRate}%`,
      tickets: 0,
      isVacant: occupiedCount === 0,
    };
    localStorage.setItem('landlordnl_properties_list', JSON.stringify([newProperty, ...propertiesList]));

    // Extract Tenants and Invoices to localStorage
    const existingTenantsStr = localStorage.getItem('landlordnl_tenants_list');
    const tenantsList = existingTenantsStr ? JSON.parse(existingTenantsStr) : [];
    const existingInvoicesStr = localStorage.getItem('landlordnl_invoices_list');
    const invoicesList = existingInvoicesStr ? JSON.parse(existingInvoicesStr) : [];

    const newTenants: any[] = [];
    const newInvoices: any[] = [];

    formState.units.forEach((unit, uidx) => {
      if (unit.tenantName.trim()) {
        const tenantId = `tenant-${Date.now()}-${uidx}-${Math.random().toString(36).substr(2, 4)}`;
        
        // Lease dates
        const leaseStart = unit.moveInDate || new Date().toISOString().split('T')[0];
        // Lease expires next month on 5th if missing
        let leaseEnd = '';
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);
        leaseEnd = nextMonth.toISOString().split('T')[0];

        const tObj = {
          id: tenantId,
          name: unit.tenantName,
          email: unit.tenantEmail || `${unit.tenantName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: unit.tenantPhone || '555-010-0000',
          idNumber: unit.tenantIdNumber || '',
          propertyName: formState.propertyName,
          propertyAddress: formState.propertyAddress,
          unitId: unit.unitId,
          unitName: unit.unitName,
          floor: unit.floor,
          unitType: unit.unitType,
          rent: parseFloat(unit.rent) || 0,
          deposit: parseFloat(unit.deposit) || 0,
          moveInFees: parseFloat(unit.moveInFees) || 0,
          recurringFees: parseFloat(unit.recurringFees) || 0,
          arrears: parseFloat(unit.arrears) || 0,
          status: parseFloat(unit.arrears) > 0 ? 'LATE' : 'ACTIVE',
          leaseStart,
          leaseEnd,
          kins: unit.kins || [],
        };
        newTenants.push(tObj);

        // Generate arrears invoice if arrears > 0
        const arrearsVal = parseFloat(unit.arrears) || 0;
        if (arrearsVal > 0) {
          const invId = `inv-${Date.now()}-${uidx}-arr`;
          const createdDateStr = new Date().toISOString().split('T')[0];
          // due date is 30 days from when it was created
          const dueDateTime = new Date();
          dueDateTime.setDate(dueDateTime.getDate() + 30);
          const dueDateStr = dueDateTime.toISOString().split('T')[0];

          newInvoices.push({
            id: invId,
            invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
            tenantId,
            tenantName: unit.tenantName,
            propertyName: formState.propertyName,
            unitId: unit.unitId,
            amount: arrearsVal,
            type: 'Arrears',
            status: 'OVERDUE',
            issueDate: createdDateStr,
            dueDate: dueDateStr,
            description: 'Outstanding arrears imported during onboarding',
          });
        }
      }
    });

    localStorage.setItem('landlordnl_tenants_list', JSON.stringify([...newTenants, ...tenantsList]));
    localStorage.setItem('landlordnl_invoices_list', JSON.stringify([...newInvoices, ...invoicesList]));

    // Construct the backend payload
    const onboardPayload = {
      ownerId: 'user-default-owner', // dummy owner id
      propertyName: formState.propertyName,
      propertyAddress: formState.propertyAddress,
      photoUrl: formState.uploadedImageUrl,
      units: formState.units.map((unit) => {
        const leaseStart = unit.moveInDate || new Date().toISOString().split('T')[0];
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);
        const leaseEnd = nextMonth.toISOString().split('T')[0];

        return {
          unitId: unit.unitId,
          floor: unit.floor || '1',
          unitType: unit.unitType || 'Residential',
          rent: parseFloat(unit.rent) || 0,
          deposit: parseFloat(unit.deposit) || 0,
          moveInFees: parseFloat(unit.moveInFees) || 0,
          recurringFees: parseFloat(unit.recurringFees) || 0,
          arrears: parseFloat(unit.arrears) || 0,
          occupied: unit.tenantName.trim() !== '',

          tenantName: unit.tenantName || undefined,
          tenantEmail: unit.tenantEmail || undefined,
          tenantPhone: unit.tenantPhone || undefined,
          tenantIdNumber: unit.tenantIdNumber || undefined,

          leaseStart: unit.tenantName.trim() ? leaseStart : undefined,
          leaseEnd: unit.tenantName.trim() ? leaseEnd : undefined,
          kins: unit.kins || [],
        };
      }),
    };

    // Send the onboarding POST request to the NestJS PostgreSQL server
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardPayload),
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch (parseErr) {
          errData = { message: `Status ${res.status} - ${res.statusText}` };
        }
        console.error('Failed to save property in PostgreSQL database:', errData);
        setErrors((prev) => ({ ...prev, submit: typeof errData.message === 'string' ? errData.message : JSON.stringify(errData) }));
        setIsSaving(false);
        return;
      }
      
      console.log('Successfully saved onboarding property data in PostgreSQL!');
      setSuccessConfetti(true);
      localStorage.removeItem('landlordnl_property_wizard_v3');
      setTimeout(() => router.push('/properties'), 1800);
    } catch (e: any) {
      console.error('Error posting onboarding payload to API:', e);
      setErrors((prev) => ({ ...prev, submit: e.message || 'Network error. Backend might be offline.' }));
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-white pb-24 relative overflow-hidden transition-colors duration-200">
      {showRestoreModal && (
        <RestoreModal
          propertyName={formState.propertyName}
          onRestore={() => {
            const saved = localStorage.getItem('landlordnl_property_wizard_v3');
            if (saved) setFormState(JSON.parse(saved));
            setShowRestoreModal(false);
          }}
          onDiscard={() => {
            localStorage.removeItem('landlordnl_property_wizard_v3');
            setFormState(initialWizardState);
            setShowRestoreModal(false);
          }}
        />
      )}
      {successConfetti && <ConfettiSplash propertyName={formState.propertyName} unitCount={formState.units.length} />}

      <div className="border-b border-paper-200 dark:border-ink-900 bg-white/70 dark:bg-ink-955/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xs font-semibold text-paper-500 dark:text-ink-400">Add Property Wizard</span>
          <button onClick={() => router.push('/properties')} className="px-3 py-1.5 border border-paper-250 dark:border-ink-800 hover:bg-paper-100 dark:hover:bg-ink-900 text-xs font-medium rounded-lg">
            Exit Builder
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`${formState.step === 5 ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[460px]`}>
            <div>
              {formState.step === 5 && excelParsedSuccess && (
                <div className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-250 dark:border-emerald-500/20 rounded-xl p-3 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  Spreadsheet parsed successfully! Check and edit unit parameters below.
                </div>
              )}

              {formState.step === 1 && <StepClassification setupMode={formState.setupMode} onChangeMode={(m) => updateField('setupMode', m)} />}
              {formState.step === 2 && <StepIdentity propertyName={formState.propertyName} propertyType={formState.propertyType} propertyRegion={formState.propertyRegion} onChangeField={updateField} errors={errors} limit={LIMITS.propertyName} />}
              {formState.step === 3 && <StepLocation propertyAddress={formState.propertyAddress} taxId={formState.taxId} constructionYear={formState.constructionYear} mapLatitude={formState.mapLatitude} mapLongitude={formState.mapLongitude} onChangeField={updateField} errors={errors} limit={LIMITS.propertyAddress} />}
              {formState.step === 4 && (
                <StepUnitConfig
                  setupMode={formState.setupMode} setupType={formState.setupType} uiType={formState.uiType}
                  identicalCount={formState.identicalCount} identicalRent={formState.identicalRent} identicalDeposit={formState.identicalDeposit}
                  identicalRecurring={formState.identicalRecurring} identicalMoveIn={formState.identicalMoveIn}
                  unitTypes={formState.unitTypes} unitTypeConfigs={formState.unitTypeConfigs} errors={errors} fileInputRef={fileInputRef}
                  onChangeField={updateField} onExcelParse={handleExcelUpload} onDownloadTemplate={downloadXlsxRosterTemplate}
                  onAddCustomUnitType={(newT) => updateField('unitTypes', [...formState.unitTypes, newT])}
                  onChangeConfig={(ut, cfg) => updateField('unitTypeConfigs', { ...formState.unitTypeConfigs, [ut]: cfg })}
                />
              )}
              {formState.step === 5 && (
                <div>
                  <StepGridEditor
                    units={formState.units} setupMode={formState.setupMode}
                    onAddManualUnit={() => {
                      const num = formState.units.length + 101;
                      updateField('units', [...formState.units, {
                        unitId: `U${num}`.slice(0, 5), unitName: `Unit ${num}`, floor: '1', unitType: 'Studio',
                        rent: '1500', deposit: '1500', moveInFees: '0', recurringFees: '0',
                        tenantName: '', tenantEmail: '', tenantPhone: '', moveInDate: '', arrears: '0'
                      }]);
                    }}
                    onRemoveUnit={(idx) => updateField('units', formState.units.filter((_, i) => i !== idx))}
                    onUpdateUnitRow={(idx, key, val) => {
                      const u = [...formState.units];
                      u[idx] = { ...u[idx], [key]: val };
                      updateField('units', u);
                    }}
                  />
                  {errors.units && <div className="mt-3 bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/25 rounded-lg p-2.5 flex items-center gap-2 text-coral-500 text-[10px] font-semibold"><AlertCircle className="w-4 h-4" />{errors.units}</div>}
                </div>
              )}
              {formState.step === 6 && (
                <div>
                  <StepMediaConfirm uploadedImageUrl={formState.uploadedImageUrl} uploadProgress={uploadProgress} uploadSpeed={uploadSpeed} errors={errors} propertyName={formState.propertyName} propertyAddress={formState.propertyAddress} units={formState.units} onFileUpload={handleFileUpload} onRemovePhoto={() => updateField('uploadedImageUrl', '')} />
                  {errors.submit && <div className="mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" />Database Save Error: {errors.submit}</div>}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-paper-100 dark:border-ink-800 flex justify-between gap-3">
              {formState.step > 1 ? (
                <button onClick={() => updateField('step', formState.step - 1)} className="px-4 py-1.5 text-xs font-semibold border border-paper-250 dark:border-ink-700 hover:bg-paper-50 dark:hover:bg-ink-700 text-paper-800 dark:text-white rounded-lg flex items-center gap-1">Back</button>
              ) : <div />}

              {formState.step < 6 ? (
                <button onClick={handleNext} className="px-5 py-1.5 text-xs font-semibold bg-coral-500 text-white rounded-lg hover:bg-coral-600 active:scale-95 transition-all shadow-sm flex items-center gap-1">Next Step</button>
              ) : (
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? 'Launching Asset...' : 'Confirm & Launch Asset'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
