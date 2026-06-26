'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PropertyFormWizard from '../../components/properties/PropertyFormWizard';

export default function AddPropertyPage() {
  return (
    <DashboardLayout>
      <PropertyFormWizard />
    </DashboardLayout>
  );
}
