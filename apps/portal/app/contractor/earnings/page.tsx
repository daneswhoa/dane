'use client';
import React from 'react';
import { useContractor } from '../ContractorContext';
import WalletTab from '../components/WalletTab';

export default function ContractorEarningsPage() {
  const { jobs } = useContractor();
  
  return (
    <WalletTab jobs={jobs} />
  );
}
