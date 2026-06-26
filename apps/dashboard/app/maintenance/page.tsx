'use client';

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MaintenanceTab from '../components/MaintenanceTab';

export default function MaintenancePage() {
  return (
    <DashboardLayout>
      <MaintenanceTab />
    </DashboardLayout>
  );
}
