'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Building2, Key, Wrench, Loader2 } from 'lucide-react';

interface Step4Props {
  selectedRole: 'manager' | 'tenant' | 'contractor' | null;
  setSelectedRole: (val: 'manager' | 'tenant' | 'contractor') => void;
  onBack: () => void;
  onContinue: () => void;
  isLoading: boolean;
  activeClass: string;
}

export default function Step4RoleSelection({ selectedRole, setSelectedRole, onBack, onContinue, isLoading, activeClass }: Step4Props) {
  return (
    <div className={activeClass}>
      <div className="step-back-btn">
        <button onClick={onBack}><ArrowLeft size={14} /> Back</button>
      </div>

      <h1>Tailor your experience.</h1>
      <p className="step-subtitle" style={{ marginBottom: '32px' }}>How do you plan to use landlord.hu?</p>

      <div className="step-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className={`role-card ${selectedRole === 'manager' ? 'selected' : ''}`} onClick={() => setSelectedRole('manager')}>
          <div className="role-card-icon-container"><Building2 size={24} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>Landlord / Manager</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 500 }}>Manage properties, collect rent, and oversee your portfolio.</p>
          </div>
          <div className="radio-indicator" style={{ marginLeft: '12px' }}></div>
        </div>

        <div className={`role-card ${selectedRole === 'tenant' ? 'selected' : ''}`} onClick={() => setSelectedRole('tenant')}>
          <div className="role-card-icon-container"><Key size={24} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>Tenant / Resident</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 500 }}>Pay rent, submit requests, and communicate with management.</p>
          </div>
          <div className="radio-indicator" style={{ marginLeft: '12px' }}></div>
        </div>

        <div className={`role-card ${selectedRole === 'contractor' ? 'selected' : ''}`} onClick={() => setSelectedRole('contractor')}>
          <div className="role-card-icon-container"><Wrench size={24} /></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>Contractor / Vendor</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 500 }}>Receive work orders, submit invoices, and manage jobs.</p>
          </div>
          <div className="radio-indicator" style={{ marginLeft: '12px' }}></div>
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onContinue} disabled={!selectedRole || isLoading} className="step-btn-primary">
          {isLoading ? (<>Saving... <Loader2 size={18} className="spin-animation" /></>) : (<>Continue <ArrowRight size={18} /></>)}
        </button>
      </div>
    </div>
  );
}
