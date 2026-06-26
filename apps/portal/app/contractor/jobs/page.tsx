'use client';
import React, { useState } from 'react';
import { useContractor } from '../ContractorContext';
import JobBoardTab from '../components/JobBoardTab';
import InvoiceModal from '../components/InvoiceModal';
import JobDetailsModal from '../components/JobDetailsModal';
import { MaintenanceJob } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ContractorJobsPage() {
  const { jobs, loading, setErrorMsg, fetchData } = useContractor();
  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'in_progress' | 'history'>('assigned');
  
  const [showInvoiceModal, setShowInvoiceModal] = useState<MaintenanceJob | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<MaintenanceJob | null>(null);
  const { profile } = useContractor();

  const handleJobStatusChange = async (jobId: string, status: 'in_progress' | 'open') => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/maintenance/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Could not update job status.');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not perform status update.');
    }
  };

  const handleDeclineJob = async (jobId: string, reason?: string, negotiatedQuote?: string) => {
    try {
      const body: any = {
        status: negotiatedQuote ? 'quote_negotiating' : 'open',
        contractorMessage: reason,
      };
      if (negotiatedQuote) {
        body.quoteAmount = negotiatedQuote;
        body.quoteStatus = 'pending';
      } else {
        body.contractorId = null;
      }
      const res = await fetch(`${API_URL}/api/dashboard/maintenance/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Could not process job decline.');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not process job decline.');
    }
  };

  const handleJobQuoteSubmit = async (jobId: string, quoteAmount: string, scheduledAt: string) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/maintenance/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'quote_submitted', quoteAmount, quoteStatus: 'pending', scheduledAt }),
      });
      if (!res.ok) throw new Error('Could not submit quote.');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not submit quote.');
    }
  };

  const handleAcceptCounterOffer = async (jobId: string, finalAmount: string) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/maintenance/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress', quoteStatus: 'accepted', amount: Number(finalAmount) || undefined }),
      });
      if (!res.ok) throw new Error('Could not accept counter offer.');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not accept counter offer.');
    }
  };

  return (
    <>
      <JobBoardTab 
        jobs={jobs}
        loading={loading}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        onViewDetails={setShowDetailsModal}
        onAcceptJob={(id) => handleJobStatusChange(id, 'in_progress')}
        onDeclineJob={handleDeclineJob}
        onCompleteJob={setShowInvoiceModal}
        onQuoteSubmit={handleJobQuoteSubmit}
        onAcceptCounterOffer={handleAcceptCounterOffer}
      />
      
      {showInvoiceModal && (
        <InvoiceModal 
          job={showInvoiceModal}
          hourlyRate={Number(profile?.hourlyRate || 50)}
          onClose={() => setShowInvoiceModal(null)}
          onInvoiceSuccess={async () => {
            setShowInvoiceModal(null);
            await fetchData();
          }}
        />
      )}

      {showDetailsModal && (
        <JobDetailsModal 
          job={showDetailsModal}
          onClose={() => setShowDetailsModal(null)}
        />
      )}
    </>
  );
}
