'use client';

import React from 'react';
import { useTenant } from '../TenantContext';
import ProfileTab from '../components/ProfileTab';

export default function ProfilePage() {
  const { profile } = useTenant();
  return <ProfileTab profile={profile} />;
}
