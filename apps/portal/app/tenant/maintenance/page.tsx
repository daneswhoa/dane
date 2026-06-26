'use client';

import React from 'react';
import { useTenant } from '../TenantContext';
import MaintenanceTab from '../components/MaintenanceTab';

export default function MaintenancePage() {
  const { profile, handleActionClick } = useTenant();
  return <MaintenanceTab profile={profile} onNewRequest={() => handleActionClick('new_request')} />;
}
