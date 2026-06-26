'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LedgerTab from '../../components/LedgerTab';

export default function LedgerPage() {
  return (
    <DashboardLayout>
      <LedgerTab />
    </DashboardLayout>
  );
}
