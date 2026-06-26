'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import InvoicesTab from '../../components/InvoicesTab';

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoicesTab />
    </DashboardLayout>
  );
}
