'use client';

import React from 'react';
import { useTenant } from './TenantContext';
import HomeTab from './components/HomeTab';
import { useRouter } from 'next/navigation';

export default function TenantDashboard() {
  const router = useRouter();
  const { profile, setInvoiceModalId } = useTenant();

  return (
    <HomeTab 
      profile={profile} 
      onPayRent={() => router.push('/tenant/payments')} 
      onViewDetails={() => setInvoiceModalId('INV-10-2023')} 
    />
  );
}
