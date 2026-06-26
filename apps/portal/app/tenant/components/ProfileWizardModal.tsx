import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Camera,
  Plus,
  Trash2 
} from 'lucide-react';
import { TenantProfile } from '../types';

interface ProfileWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TenantProfile | null;
}

export default function ProfileWizardModal({ isOpen, onClose, profile }: ProfileWizardModalProps) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [nextOfKin, setNextOfKin] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync profile data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      const names = profile.name ? profile.name.split(' ') : ['', ''];
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setUploadedPhotoUrl(profile.photoUrl || '');
      setEmergencyContacts(
        profile.emergencyContacts && profile.emergencyContacts.length > 0 
          ? JSON.parse(JSON.stringify(profile.emergencyContacts)) 
          : [{ name: '', relation: 'Spouse', phone: '' }]
      );
      setNextOfKin(
        profile.nextOfKin && profile.nextOfKin.length > 0 
          ? JSON.parse(JSON.stringify(profile.nextOfKin)) 
          : [{ name: '', relation: 'Parent', phone: '' }]
      );
      setStep(1);
      setSaveError('');
      setUploadError('');
    }
  }, [isOpen, profile]);

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

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`);

      setUploadedPhotoUrl(publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', relation: 'Spouse', phone: '' }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const addNextOfKin = () => {
    setNextOfKin([...nextOfKin, { name: '', relation: 'Parent', phone: '' }]);
  };

  const removeNextOfKin = (index: number) => {
    setNextOfKin(nextOfKin.filter((_, i) => i !== index));
  };

  const updateNextOfKin = (index: number, field: string, value: string) => {
    const updated = [...nextOfKin];
    updated[index][field] = value;
    setNextOfKin(updated);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await fetch('http://localhost:4000/api/dashboard/tenant/profile/update', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: profile.id,
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          photoUrl: uploadedPhotoUrl,
          emergencyContacts: emergencyContacts.filter(c => c.name.trim() || c.phone.trim()),
          nextOfKin: nextOfKin.filter(c => c.name.trim() || c.phone.trim()),
        }),
      });
      if (res.ok) {
        onClose();
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.message || 'Failed to save changes');
      }
    } catch (e) {
      setSaveError('Failed to save changes due to server error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-ink-900 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden border border-paper-200 dark:border-ink-700 animate-slide-up trans-theme">
        
        {/* Header with Steps */}
        <div className="px-6 py-5 border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 trans-theme">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-paper-900 dark:text-white leading-tight">Edit Profile</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Keep your contact and emergency information up to date.</p>
            </div>
            <button onClick={onClose} className="p-2 text-paper-400 hover:text-paper-900 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 trans-subtle">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper (Only 2 steps) */}
          <div className="flex items-center justify-around relative max-w-sm mx-auto">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-paper-200 dark:bg-ink-800 z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-coral-500 z-0 transition-all duration-300 ease-in-out" style={{ width: step === 1 ? '0%' : '100%' }}></div>

            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <button onClick={() => setStep(1)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step >= 1 ? 'bg-coral-500 border-coral-500 text-white shadow-sm shadow-coral-500/30' : 'bg-paper-50 dark:bg-ink-950 border-paper-300 dark:border-ink-700 text-paper-400 dark:text-ink-500'}`}>
                1
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-paper-900 dark:text-white' : 'text-paper-400 dark:text-ink-500'}`}>Personal Details</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <button onClick={() => setStep(2)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step >= 2 ? 'bg-coral-500 border-coral-500 text-white shadow-sm shadow-coral-500/30' : 'bg-paper-50 dark:bg-ink-950 border-paper-300 dark:border-ink-700 text-paper-400 dark:text-ink-500'}`}>
                2
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-paper-900 dark:text-white' : 'text-paper-400 dark:text-ink-500'}`}>Contacts & Kin</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 mt-2 space-y-4">
          
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="relative group cursor-pointer">
                    <img 
                      src={uploadedPhotoUrl || `https://placehold.co/100x100/1e2129/ffffff?text=${firstName.charAt(0) || 'U'}`} 
                      className="w-24 h-24 rounded-full border-4 border-paper-50 dark:border-ink-800 shadow-md object-cover" 
                    />
                    
                    {isUploading ? (
                      <div className="absolute inset-0 bg-ink-950/60 rounded-full flex items-center justify-center trans-subtle">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <label className="absolute inset-0 bg-ink-950/40 rounded-full opacity-0 group-hover:opacity-100 trans-subtle flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                  {uploadError && <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-coral-500 font-medium whitespace-nowrap">{uploadError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1.5 ml-1">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1.5 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1.5 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    title="Email address cannot be changed from the general profile wizard. Please use Security Settings."
                    className="w-full px-4 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900 text-sm text-paper-400 dark:text-ink-500 cursor-not-allowed focus:outline-none trans-subtle" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1.5 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in pb-6">
              
              {/* Emergency Contacts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-800 pb-2">
                  <h3 className="text-sm font-bold text-paper-900 dark:text-white">Emergency Contacts</h3>
                  <button 
                    onClick={addEmergencyContact}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-coral-400 hover:text-coral-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Contact
                  </button>
                </div>

                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-paper-50 dark:bg-ink-950/50 p-4 rounded-xl border border-paper-100 dark:border-ink-800 relative group">
                    {emergencyContacts.length > 1 && (
                      <button 
                        onClick={() => removeEmergencyContact(index)}
                        className="absolute right-2 top-2 p-1.5 text-ink-500 hover:text-coral-500 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 ml-0.5">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Contact Name" 
                        value={contact.name}
                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 ml-0.5">Relationship</label>
                      <select 
                        value={contact.relation}
                        onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle appearance-none cursor-pointer"
                      >
                        <option>Spouse</option>
                        <option>Parent</option>
                        <option>Sibling</option>
                        <option>Friend</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 ml-0.5">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="(555) 000-0000" 
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Next of Kin */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-paper-200 dark:border-ink-800 pb-2">
                  <h3 className="text-sm font-bold text-paper-900 dark:text-white">Next of Kin</h3>
                  <button 
                    onClick={addNextOfKin}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-coral-400 hover:text-coral-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Kin
                  </button>
                </div>

                {nextOfKin.map((kin, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-paper-50 dark:bg-ink-950/50 p-4 rounded-xl border border-paper-100 dark:border-ink-800 relative group">
                    {nextOfKin.length > 1 && (
                      <button 
                        onClick={() => removeNextOfKin(index)}
                        className="absolute right-2 top-2 p-1.5 text-ink-500 hover:text-coral-500 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 ml-0.5">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Kin Name" 
                        value={kin.name}
                        onChange={(e) => updateNextOfKin(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 ml-0.5">Relationship</label>
                      <select 
                        value={kin.relation}
                        onChange={(e) => updateNextOfKin(index, 'relation', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle appearance-none cursor-pointer"
                      >
                        <option>Parent</option>
                        <option>Spouse</option>
                        <option>Sibling</option>
                        <option>Child</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400 mb-1 ml-0.5">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="(555) 000-0000" 
                        value={kin.phone}
                        onChange={(e) => updateNextOfKin(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 trans-subtle" 
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 trans-theme">
          <div className="text-xs text-coral-500 font-semibold">
            {saveError && <span>{saveError}</span>}
          </div>
          <div className="flex items-center gap-2 self-end">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : onClose()} 
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-paper-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-800 text-sm font-semibold trans-subtle flex items-center gap-2 disabled:opacity-50"
            >
              {step > 1 ? <><ArrowLeft className="w-4 h-4" /> Back</> : 'Cancel'}
            </button>
            
            <button 
              onClick={() => step < 2 ? setStep(step + 1) : handleSave()} 
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold shadow-sm shadow-coral-500/20 active:scale-95 trans-subtle flex items-center gap-2 disabled:opacity-50 animate-pulse-slow"
            >
              {step < 2 ? (
                <>Next Step <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
