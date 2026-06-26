'use client';

import React from 'react';
import { useTenant } from '../TenantContext';
import CommunicationsTab from '../components/CommunicationsTab';

export default function CommunicationsPage() {
  const { profile } = useTenant();
  return <CommunicationsTab profile={profile} />;
}
