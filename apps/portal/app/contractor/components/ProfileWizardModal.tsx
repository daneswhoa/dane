import React, { useState } from 'react';
import { X, Loader2, User, Wrench, CheckCircle2, Eye, BadgeCheck, Siren, ArrowRight, Check, Camera } from 'lucide-react';
import { ContractorProfile } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`;

interface ProfileWizardModalProps {
  userId: string;
  profile: ContractorProfile | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function ProfileWizardModal({
  userId,
  profile,
  onClose,
  onSaveSuccess
}: ProfileWizardModalProps) {
  // Wizard steps: 1 = Basic Info, 2 = Services, 3 = Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Profile Form States
  const [formName, setFormName] = useState(profile?.name || '');
  const [formPhone, setFormPhone] = useState(profile?.phone || '');
  const [formSpecialty, setFormSpecialty] = useState(profile?.specialty || 'General Maintenance');
  const [formBio, setFormBio] = useState(profile?.bio || '');
  const [formHourlyRate, setFormHourlyRate] = useState(Number(profile?.hourlyRate || 50));
  const [formEmergencyRate, setFormEmergencyRate] = useState(Number((profile as any)?.emergencyRate || Math.round(Number(profile?.hourlyRate || 50) * 1.5)));
  const [formLocation, setFormLocation] = useState(profile?.locationName || 'New York, NY');
  const [formPhotoUrl, setFormPhotoUrl] = useState(profile?.photoUrl || '');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formName.trim()) errors.name = 'Please provide a name.';
      if (formName.length > 80) errors.name = 'Name must be 80 characters or less.';
      if (formPhone && formPhone.length > 25) errors.phone = 'Phone number is too long.';
      if (!formLocation.trim()) errors.location = 'Location base is required.';
    }
    if (currentStep === 2) {
      if (formBio && formBio.length > 500) errors.bio = 'Bio must be 500 characters or less.';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      const data = await signRes.json();
      if (!signRes.ok) throw new Error(data.error || 'Failed to generate upload URL');

      const { uploadUrl, publicUrl } = data;

      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`);
      }

      setFormPhotoUrl(publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep((prev) => (prev + 1) as 1 | 2 | 3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateStep(3)) return;

    setProfileErrors({});
    setIsSavingProfile(true);

    try {
      const res = await fetch(`${API_URL}/api/dashboard/contractor/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          name: formName.trim(),
          phone: formPhone.trim(),
          specialty: formSpecialty,
          bio: formBio.trim(),
          hourlyRate: formHourlyRate,
          emergencyRate: formEmergencyRate,
          locationName: formLocation.trim(),
          photoUrl: formPhotoUrl.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update contractor profile.');
      }

      onSaveSuccess();
    } catch (err: any) {
      setProfileErrors({ global: err.message || 'Could not save profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full trans-theme transform scale-100 transition-transform duration-300 ease-out">
        
        {/* Wizard Header & Progress */}
        <div className="px-6 py-5 border-b border-paper-200 dark:border-ink-800 bg-white/50 dark:bg-ink-950/50 backdrop-blur-md flex flex-col gap-5 trans-theme relative z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-paper-900 dark:text-white tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-coral-500" /> Profile Configuration
            </h2>
            <button onClick={onClose} className="text-paper-400 hover:text-paper-900 dark:text-ink-500 dark:hover:text-white trans-subtle">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-paper-200 dark:bg-ink-800 z-0 trans-theme"></div>
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-coral-500 z-0 trans-subtle transition-all duration-500 ease-in-out" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {/* Step 1 Dot */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-ink-900 trans-subtle transition-all duration-300 ${
                step >= 1 ? 'bg-coral-500 text-white shadow-[0_0_12px_rgba(255,107,107,0.4)]' : 'bg-paper-200 dark:bg-ink-800 text-paper-500'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${
                step >= 1 ? 'text-coral-600 dark:text-coral-400' : 'text-paper-400 dark:text-ink-500'
              }`}>Basic Info</span>
            </div>

            {/* Step 2 Dot */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-ink-900 trans-subtle transition-all duration-300 ${
                step >= 2 ? 'bg-coral-500 text-white shadow-[0_0_12px_rgba(255,107,107,0.4)]' : 'bg-paper-200 dark:bg-ink-800 text-paper-500'
              }`}>
                <Wrench className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${
                step >= 2 ? 'text-coral-600 dark:text-coral-400' : 'text-paper-400 dark:text-ink-500'
              }`}>Services</span>
            </div>

            {/* Step 3 Dot */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-ink-900 trans-subtle transition-all duration-300 ${
                step >= 3 ? 'bg-coral-500 text-white shadow-[0_0_12px_rgba(255,107,107,0.4)]' : 'bg-paper-200 dark:bg-ink-800 text-paper-500'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 whitespace-nowrap ${
                step >= 3 ? 'text-coral-600 dark:text-coral-400' : 'text-paper-400 dark:text-ink-500'
              }`}>Review</span>
            </div>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] relative z-10 text-left">
          
          {profileErrors.global && (
            <div className="mb-4 color-coral-text bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/20 p-3 rounded-lg text-xs">
              {profileErrors.global}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-paper-900 dark:text-white mb-1">Identity & Location</h3>
                <p className="text-xs text-paper-500 dark:text-ink-400 mb-4">This information is visible to property managers.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Business / Personal Name</label>
                    <input 
                      type="text" 
                      value={formName} 
                      onChange={(e) => setFormName(e.target.value)}
                      className={`w-full px-3 py-2 bg-white dark:bg-ink-950 border rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme ${
                        profileErrors.name ? 'border-coral-500' : 'border-paper-200 dark:border-ink-700'
                      }`}
                      placeholder="e.g. QuickFix Carpentry"
                    />
                    {profileErrors.name && <span className="text-[10px] text-coral-600">{profileErrors.name}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Location Base</label>
                    <input 
                      type="text" 
                      value={formLocation} 
                      onChange={(e) => setFormLocation(e.target.value)}
                      className={`w-full px-3 py-2 bg-white dark:bg-ink-950 border rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme ${
                        profileErrors.location ? 'border-coral-500' : 'border-paper-200 dark:border-ink-700'
                      }`}
                      placeholder="New York, NY"
                    />
                    {profileErrors.location && <span className="text-[10px] text-coral-600">{profileErrors.location}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Phone Number</label>
                    <input 
                      type="text" 
                      value={formPhone} 
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Logo / Photo</label>
                    <div className="flex items-center gap-3">
                      <div className="relative group cursor-pointer">
                        <img 
                          src={formPhotoUrl || `https://placehold.co/100x100/1e2129/ffffff?text=${formName.charAt(0) || 'C'}`} 
                          className="w-12 h-12 rounded-lg border-2 border-paper-200 dark:border-ink-700 shadow-sm object-cover" 
                          alt="Logo Preview"
                        />
                        {isUploading ? (
                          <div className="absolute inset-0 bg-ink-950/60 rounded-lg flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        ) : (
                          <label className="absolute inset-0 bg-ink-950/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                            <Camera className="w-4 h-4 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                          </label>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center justify-center px-3 py-1.5 border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-950 text-xs font-semibold text-paper-800 dark:text-ink-250 cursor-pointer hover:bg-paper-50 dark:hover:bg-ink-800 transition-all">
                          <span>Upload Image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        <p className="text-[9px] text-paper-500 dark:text-ink-400 mt-1">PNG, JPG or WEBP. Max 5MB.</p>
                      </div>
                    </div>
                    {uploadError && <span className="text-[10px] text-coral-600 block mt-0.5">{uploadError}</span>}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-paper-100 dark:border-ink-800 trans-theme">
                <h3 className="text-sm font-semibold text-paper-900 dark:text-white mb-4">Billing Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Standard Rate ($/hr)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-400 dark:text-ink-500 font-medium">$</span>
                      <input 
                        type="number" 
                        value={formHourlyRate} 
                        onChange={(e) => setFormHourlyRate(Math.max(1, Number(e.target.value)))}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-coral-600 dark:text-coral-400 flex items-center gap-1">
                      <Siren className="w-3 h-3" /> Emergency Rate ($/hr)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-400 dark:text-ink-500 font-medium">$</span>
                      <input 
                        type="number" 
                        value={formEmergencyRate} 
                        onChange={(e) => setFormEmergencyRate(Math.max(1, Number(e.target.value)))}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services & Skills */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-paper-900 dark:text-white mb-1">Service Categories</h3>
                <p className="text-xs text-paper-500 dark:text-ink-400 mb-4">Select the exact specialty you offer to appear in PM search results.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Trade Specialty</label>
                    <select 
                      value={formSpecialty} 
                      onChange={(e) => setFormSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1"
                    >
                      <option value="General Maintenance">General Maintenance</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Landscaping">Landscaping</option>
                      <option value="Roofing">Roofing</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-paper-100 dark:border-ink-800 trans-theme space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">Professional Bio & Credentials</label>
                <textarea 
                  rows={4} 
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Licensed Master Plumber with over 15 years of experience..."
                  className="w-full px-3 py-2 bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-theme resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-paper-900 dark:text-white">Review Your Profile</h3>
                <p className="text-xs text-paper-500 dark:text-ink-400">Here is how managers will see your core information.</p>
              </div>

              {/* Mini Review Card */}
              <div className="bg-gradient-to-br from-ink-800 to-ink-900 rounded-xl p-5 border border-ink-700/50 shadow-inner relative overflow-hidden text-left">
                {/* BG Glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-coral-500/10 blur-[30px]"></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <img 
                      src={formPhotoUrl || `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=150&h=150`} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-lg object-cover shadow-sm border border-ink-600/50" 
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {formName || 'New Contractor'} <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                      </h4>
                      <p className="text-[10px] text-ink-300">{formLocation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-mono">${formHourlyRate}<span className="text-[10px] text-ink-400 font-sans font-normal">/hr</span></div>
                    <div className="text-[10px] text-coral-400 font-mono flex items-center justify-end gap-1">
                      <Siren className="w-2.5 h-2.5" /> ${formEmergencyRate}<span className="font-sans font-normal text-ink-400">/hr</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 relative z-10">
                  <span className="px-2 py-0.5 bg-ink-950/50 border border-ink-700/50 rounded text-[9px] text-ink-200">
                    {formSpecialty}
                  </span>
                  {formPhone && (
                    <span className="px-2 py-0.5 bg-ink-950/50 border border-ink-700/50 rounded text-[9px] text-ink-200">
                      {formPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer */}
        <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950/80 flex items-center justify-between trans-theme relative z-10">
          <button 
            type="button"
            onClick={handleBack} 
            className="px-4 py-2 text-xs font-medium text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed trans-subtle" 
            disabled={step === 1 || isSavingProfile}
          >
            Back
          </button>
          
          {step === 3 ? (
            <button 
              onClick={handleSaveProfile} 
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-500/20 active:scale-95 trans-subtle"
            >
              {isSavingProfile ? (
                <>Saving Profile... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Save Profile</>
              )}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-coral-500/20 active:scale-95 trans-subtle"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
