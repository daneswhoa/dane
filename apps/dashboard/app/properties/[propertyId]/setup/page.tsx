'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, ArrowRight, ArrowLeft, Loader2, AlertTriangle, Check } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';

import Step1Units from './components/Step1Units';
import Step2Fees from './components/Step2Fees';
import Step3Settings from './components/Step3Settings';
import SuccessScreen from './components/SuccessScreen';

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`;

export default function PropertySetupPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [step, setStep] = useState(1);
  const [property, setProperty] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  const [units, setUnits] = useState<any[]>([]);
  const [feeSettings, setFeeSettings] = useState<Record<string, any>>({});
  const [propertySettings, setPropertySettings] = useState({ rentDueDate: 1, lateFeePenalty: 0 });
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  
  const [setupMode, setSetupMode] = useState<'excel' | 'manual'>('manual');

  useEffect(() => {
    async function loadData() {
      try {
        const propRes = await fetch(`${API_URL}/api/dashboard/properties/${propertyId}`, { credentials: 'include' });
        if (!propRes.ok) throw new Error('Failed to load property details.');
        const propData = await propRes.json();
        setProperty(propData.property);

        const count = propData.property.unitsCount || 1;
        const initialUnits = Array.from({ length: count }, (_, idx) => ({
          label: count === 1 ? 'Main Unit' : `Unit ${idx + 101}`,
          rent: 1200, status: 'vacant', tenantName: '', tenantEmail: '', tenantPhone: '',
          leaseStart: '', leaseEnd: '', floor: count === 1 ? '1' : String(Math.floor(idx / 4) + 1),
          unitType: 'Standard', arrears: 0, kinDetails: []
        }));
        setUnits(initialUnits);
        setFeeSettings({ 'Standard': { deposit: 1200, moveInFees: [], recurringFees: [] } });

        if (count > 1) {
          setSetupMode('excel');
        }

        const teamRes = await fetch(`${API_URL}/api/dashboard/team`, { credentials: 'include' });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(teamData.members || []);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading data.');
      } finally {
        setIsLoading(false);
      }
    }
    if (propertyId) loadData();
  }, [propertyId]);

  useEffect(() => {
    const uniqueTypes = Array.from(new Set(units.map(u => u.unitType?.trim() || 'Standard')));
    const newFeeSettings = { ...feeSettings };
    let changed = false;
    uniqueTypes.forEach(ut => {
      if (!newFeeSettings[ut]) {
        newFeeSettings[ut] = { deposit: 1200, moveInFees: [], recurringFees: [] };
        changed = true;
      }
    });
    if (changed) setFeeSettings(newFeeSettings);
  }, [units]);

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/properties/${propertyId}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units, feeSettings, propertySettings, teamAccess: selectedTeam }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed setup.');
      setSetupComplete(true);
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) return <DashboardLayout><div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-coral-500 w-8 h-8" /></div></DashboardLayout>;
  if (error && !property) return <DashboardLayout><div className="p-8 text-center text-red-500">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 p-4 md:p-6 animate-fade-in">
        
        {/* Wizard Header (Inside Layout) */}
        {!setupComplete && (
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-coral-500 text-white rounded-md">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-paper-900 dark:text-white">
                  {property?.name} Setup
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 mr-4">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${step === 1 ? 'bg-coral-500 text-white' : 'bg-paper-100 dark:bg-ink-800 text-paper-500'}`}>1. Units</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${step === 2 ? 'bg-coral-500 text-white' : 'bg-paper-100 dark:bg-ink-800 text-paper-500'}`}>2. Fees</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${step === 3 ? 'bg-coral-500 text-white' : 'bg-paper-100 dark:bg-ink-800 text-paper-500'}`}>3. Settings</span>
              </div>
              
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} disabled={isSaving} className="px-3 py-1.5 text-xs font-semibold border border-paper-250 dark:border-ink-700 text-paper-700 dark:text-ink-200 rounded hover:bg-paper-100 transition-all flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-coral-500 text-white rounded hover:bg-coral-600 transition-all shadow-sm">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button disabled={isSaving} onClick={handleCompleteSetup} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-sm">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Complete
                </button>
              )}
            </div>
          </div>
        )}

        {error && <div className="p-3 bg-red-500/10 text-red-500 text-xs font-semibold rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

        {setupComplete ? (
          <SuccessScreen propertyId={propertyId} />
        ) : (
          <>
            {step === 1 && <Step1Units property={property} units={units} setUnits={setUnits} setupMode={setupMode} setSetupMode={setSetupMode} setError={setError} />}
            {step === 2 && <Step2Fees units={units} feeSettings={feeSettings} setFeeSettings={setFeeSettings} />}
            {step === 3 && <Step3Settings propertySettings={propertySettings} setPropertySettings={setPropertySettings} teamMembers={teamMembers} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
