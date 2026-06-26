'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TenantsTab from '../components/TenantsTab';

export default function TenantsPage() {
  return (
    <DashboardLayout>
      <TenantsTab />
    </DashboardLayout>
  );
}
