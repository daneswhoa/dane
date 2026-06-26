'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ContractorsTab from '../components/ContractorsTab';

export default function ContractorsPage() {
  return (
    <DashboardLayout>
      <ContractorsTab />
    </DashboardLayout>
  );
}
