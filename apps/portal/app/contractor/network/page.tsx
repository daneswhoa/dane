'use client';
import React from 'react';
import { useContractor } from '../ContractorContext';
import ProfileTab from '../components/ProfileTab';

export default function ContractorNetworkPage() {
  const { profile, jobs, setShowProfileWizard } = useContractor();
  
  return (
    <ProfileTab 
      profile={profile}
      jobs={jobs}
      onEditProfile={() => setShowProfileWizard(true)}
    />
  );
}
