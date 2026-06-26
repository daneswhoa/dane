'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LedgerTab from '../../components/LedgerTab';

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <LedgerTab />
    </DashboardLayout>
  );
}
