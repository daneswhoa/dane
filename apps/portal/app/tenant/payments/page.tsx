'use client';

import React from 'react';
import { useTenant } from '../TenantContext';
import PaymentsTab from '../components/PaymentsTab';

export default function PaymentsPage() {
  const { profile, setInvoiceModalId } = useTenant();
  return (
    <PaymentsTab 
      profile={profile} 
      onPayNow={() => {}} 
      onViewInvoice={(id) => setInvoiceModalId(id)} 
    />
  );
}
