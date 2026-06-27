'use client';

import React, { useEffect, useState } from 'react';
import ErrorModal from './ErrorModal';
import {
  ClipboardList,
  AlertTriangle,
  UserMinus,
  Clock,
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowDown,
  Tag,
  User,
  Plus,
  MessageSquare,
  Edit2,
  MoreHorizontal,
  Loader2,
  Calendar,
  CheckCircle,
  X,
  MapPin,
  Wrench,
  Check,
  CircleDollarSign,
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import { AccessDeniedOverlay } from './team/AccessDeniedOverlay';
import SettleMaintenanceModal from './SettleMaintenanceModal';
import { usePermissionsStore } from '../store/usePermissionsStore';
import { useAuditStore } from '../store/useAuditStore';
import { useSession } from '@repo/auth';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  urgency: string;
  category: string;
  status: string;
  tenantId?: string;
  tenantName?: string;
  tenantEmail?: string;
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitLabel?: string;
  amount?: string;
  hourlyRate?: string;
  maxAuthorization?: string;
  contractorId?: string;
  contractorName?: string;
  photoUrl?: string;
  scheduledAt?: string;
  quoteAmount?: string;
  quoteStatus?: string;
  contractorMessage?: string;
  proofPhotoUrl?: string;
  createdAt: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

interface Unit {
  id: string;
  propertyId: string;
  label: string;
  tenantId?: string;
  tenantName?: string;
  tenantEmail?: string;
}

interface Contractor {
  id: string;
  userId?: string;
  name: string;
  specialty: string;
  hourlyRate?: string;
}

export const getUrgencyDetails = (urgency: string = '') => {
  const clean = urgency.trim().toLowerCase();
  if (clean === 'emergency' || clean === 'critical') {
    return {
      label: 'Emergency',
      value: 'emergency',
      bgClass: 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
      dotColor: 'bg-red-500',
      animatePulse: true,
    };
  }
  if (clean === 'urgent' || clean === 'high') {
    return {
      label: 'Urgent',
      value: 'urgent',
      bgClass: 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      dotColor: 'bg-amber-500',
      animatePulse: false,
    };
  }
  if (clean === 'medium' || clean === 'standard') {
    return {
      label: 'Medium',
      value: 'medium',
      bgClass: 'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      dotColor: 'bg-blue-500',
      animatePulse: false,
    };
  }
  return {
    label: 'Low',
    value: 'low',
    bgClass: 'border-slate-200 dark:border-ink-600 bg-slate-100 dark:bg-ink-800 text-slate-600 dark:text-ink-300',
    dotColor: 'bg-slate-400',
    animatePulse: false,
  };
};

export default function MaintenanceTab() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorStack, setErrorStack] = useState('');
  const [deniedAction, setDeniedAction] = useState<string | null>(null);

  const { checkPermission } = usePermissionsStore();
  const { logAction } = useAuditStore();
  const { data: session } = useSession();
  const user = session?.user;
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'JD';

  const canView = checkPermission('Maintenance', 'View Tickets');
  const canAssign = checkPermission('Maintenance', 'Assign Contractor');
  const canApprove = checkPermission('Maintenance', 'Approve Invoices');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('All');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<MaintenanceTicket | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<MaintenanceTicket | null>(null);
  const [showSettleModal, setShowSettleModal] = useState<MaintenanceTicket | null>(null);

  // New Work Order Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrgency, setFormUrgency] = useState('medium');
  const [formCategory, setFormCategory] = useState('General Maintenance');
  const [formPropertyId, setFormPropertyId] = useState('');
  const [formUnitId, setFormUnitId] = useState('');
  const [formContractorId, setFormContractorId] = useState('');
  const [formHourlyRate, setFormHourlyRate] = useState('');
  const [formMaxAuthorization, setFormMaxAuthorization] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Assign form state
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeHourlyRate, setAssigneeHourlyRate] = useState('');
  const [assigneeMaxAuthorization, setAssigneeMaxAuthorization] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Negotiation state
  const [showNegotiateInput, setShowNegotiateInput] = useState(false);
  const [counterOfferValue, setCounterOfferValue] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    
    // Log the fetch action
    logAction({
      actor: { 
        initials: userInitials, 
        name: user?.name || 'System User', 
        email: user?.email || 'user@landlord.nl' 
      },
      category: { icon: ClipboardList, label: 'Maintenance' },
      description: 'Fetched maintenance tickets and work orders from database.',
      ip: 'Unknown', location: 'Unknown', status: 'success', severity: 'info'
    });

    try {
      // 1. Fetch Maintenance Tickets
      const tRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance`, {
        credentials: 'include',
      });
      if (!tRes.ok) throw new Error('Could not fetch maintenance tickets.');
      const tData = await tRes.json();
      setTickets(tData);

      // 2. Fetch Properties for Form
      const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/properties`, {
        credentials: 'include',
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProperties(pData);
      }

      // 3. Fetch Units for Form
      const uRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/units`, {
        credentials: 'include',
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        setUnits(uData);
      }

      // 4. Fetch Contractors for Assignee choices
      const cRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/contractors`, {
        credentials: 'include',
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        setContractors(cData);
      }
    } catch (err: any) {
      setErrorTitle('Failed to Load Overview Data');
      setErrorMessage(err.message || 'Unable to connect to the backend server. Please make sure the service is running.');
      setErrorStack('fetchData\n./app/components/MaintenanceTab.tsx');
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties' units
  const availableUnitsForSelectedProperty = units.filter(
    u => u.propertyId === formPropertyId
  );

  // Auto-fill tenant details when a unit is selected
  const handleUnitChange = (unitId: string) => {
    setFormUnitId(unitId);
    const selectedUnit = units.find(u => u.id === unitId);
    // If unit has tenant details, we can alert or log it
  };

  // Handle New Ticket Submission
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Title is required.';
    if (formTitle.length > 150) errors.title = 'Title must be 150 characters or less.';
    if (!formDesc.trim()) errors.desc = 'Description is required.';
    if (formDesc.length > 1000) errors.desc = 'Description must be 1000 characters or less.';
    if (!formPropertyId) errors.propertyId = 'Please select a property.';
    if (!formUnitId) errors.unitId = 'Please select a unit.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmittingTicket(true);

    const selectedUnit = units.find(u => u.id === formUnitId);
    const selectedProp = properties.find(p => p.id === formPropertyId);

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      urgency: formUrgency,
      category: formCategory,
      propertyId: formPropertyId,
      unitId: formUnitId,
      tenantId: selectedUnit?.tenantId || null,
      tenantEmail: selectedUnit?.tenantEmail || null,
      contractorId: formContractorId || null,
      hourlyRate: formHourlyRate ? Number(formHourlyRate) : null,
      maxAuthorization: formMaxAuthorization ? Number(formMaxAuthorization) : null,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create maintenance ticket.');

      setShowCreateModal(false);
      // Reset form
      setFormTitle('');
      setFormDesc('');
      setFormUrgency('medium');
      setFormCategory('General Maintenance');
      setFormPropertyId('');
      setFormUnitId('');
      setFormContractorId('');
      setFormHourlyRate('');
      setFormMaxAuthorization('');
      
      await fetchData();
    } catch (err: any) {
      setFormErrors({ global: err.message || 'Could not save work order.' });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Handle Contractor Assignment
  const handleAssignContractorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal) return;

    if (!canAssign) {
      setDeniedAction('Assign Contractor');
      logAction({
        actor: { 
          initials: userInitials, 
          name: user?.name || 'System User', 
          email: user?.email || 'user@landlord.nl' 
        },
        category: { icon: ShieldAlert, label: 'Security & Audit' },
        description: `Blocked attempt to assign contractor to Ticket #${showAssignModal.id}. Missing 'Assign Contractor' permission.`,
        ip: 'Unknown', location: 'Unknown', status: 'blocked', severity: 'critical'
      });
      setShowAssignModal(null);
      return;
    }

    setIsAssigning(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${showAssignModal.id}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId: assigneeId || null,
          hourlyRate: assigneeHourlyRate ? Number(assigneeHourlyRate) : null,
          maxAuthorization: assigneeMaxAuthorization ? Number(assigneeMaxAuthorization) : null,
        }),
      });

      if (!res.ok) {
        let errMsg = 'Could not assign contractor. Please check if your session is active.';
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      setShowAssignModal(null);
      setAssigneeId('');
      setAssigneeHourlyRate('');
      setAssigneeMaxAuthorization('');
      
      const contractorNameObj = contractors.find(c => c.id === assigneeId);
      logAction({
        actor: { 
          initials: userInitials, 
          name: user?.name || 'System User', 
          email: user?.email || 'user@landlord.nl' 
        },
        category: { icon: Wrench, label: 'Maintenance' },
        description: `Assigned Ticket #${showAssignModal.id} to ${contractorNameObj?.name || 'Contractor'}.`,
        ip: 'Unknown', location: 'Unknown', status: 'success', severity: 'info'
      });

      await fetchData();
    } catch (err: any) {
      setErrorTitle('Assignment Failed');
      setErrorMessage(err.message || 'We could not assign the contractor to this ticket.');
      setErrorStack(`handleAssignContractorSubmit\n./app/components/MaintenanceTab.tsx`);
      setErrorModalOpen(true);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle invoice approval (Paid) - Company Expense
  const handleSettleCompanyExpense = async (ticketId: string) => {
    if (!canApprove) {
      setDeniedAction('Approve Invoices');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });

      if (!res.ok) throw new Error('Failed to settle invoice payment.');

      setShowDetailsModal(null);
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Invoice Approval Failed');
      setErrorMessage(err.message || 'We could not settle the payment for this ticket.');
      setErrorModalOpen(true);
    }
  };

  const handleSettleChargeTenant = async (ticketId: string, amount: number) => {
    if (!canApprove) {
      setDeniedAction('Approve Invoices');
      return;
    }
    try {
      // 1. Mark ticket as paid to contractor
      const res1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      if (!res1.ok) throw new Error('Failed to update ticket status.');

      // 2. Create invoice for tenant
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket && ticket.tenantId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/invoices`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: ticket.tenantId,
            unitId: ticket.unitId,
            propertyId: ticket.propertyId,
            amount: amount,
            description: `Maintenance Charge: ${ticket.title}`,
            type: 'Maintenance Charge'
          }),
        });
      }

      setShowDetailsModal(null);
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Tenant Charge Failed');
      setErrorMessage(err.message || 'We could not process the tenant charge.');
      setErrorModalOpen(true);
    }
  };

  const handleSettleWithoutPay = async (ticketId: string) => {
    if (!canApprove) {
      setDeniedAction('Approve Invoices');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });

      if (!res.ok) throw new Error('Failed to settle ticket.');

      setShowDetailsModal(null);
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Settlement Failed');
      setErrorMessage(err.message || 'We could not finalize the ticket.');
      setErrorModalOpen(true);
    }
  };

  // Status transitions
  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update ticket status. Please check your network connection.');
      }

      setShowDetailsModal(null);
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Status Update Failed');
      setErrorMessage(err.message || 'We could not update the status of this ticket.');
      setErrorStack(`updateTicketStatus\n./app/components/MaintenanceTab.tsx`);
      setErrorModalOpen(true);
    }
  };

  const handleAcceptQuote = async (ticketId: string, quoteAmt?: string) => {
    try {
      let parsedAmount: number | undefined;
      if (quoteAmt && !quoteAmt.includes('-')) {
        const clean = quoteAmt.replace(/[^0-9.]/g, '');
        if (clean) parsedAmount = Number(clean);
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress',
          quoteStatus: 'accepted',
          amount: parsedAmount
        }),
      });

      if (!res.ok) throw new Error('Failed to accept quote.');
      setShowDetailsModal(null);
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Failed to Accept Quote');
      setErrorMessage(err.message || 'Error occurred while accepting quote.');
      setErrorModalOpen(true);
    }
  };

  const handleNegotiateQuote = async (ticketId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'quote_negotiating',
          quoteStatus: 'negotiating',
          quoteAmount: counterOfferValue,
          contractorMessage: counterOfferMessage
        }),
      });

      if (!res.ok) throw new Error('Failed to submit negotiation.');
      setShowDetailsModal(null);
      setShowNegotiateInput(false);
      setCounterOfferValue('');
      setCounterOfferMessage('');
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Failed to Submit Counter-Offer');
      setErrorMessage(err.message || 'Error occurred while submitting counter-offer.');
      setErrorModalOpen(true);
    }
  };

  const handleDeclineQuote = async (ticketId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/maintenance/${ticketId}/status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'open',
          quoteStatus: 'rejected'
        }),
      });

      if (!res.ok) throw new Error('Failed to decline quote.');
      setShowDetailsModal(null);
      await fetchData();
    } catch (err: any) {
      setErrorTitle('Failed to Decline Quote');
      setErrorMessage(err.message || 'Error occurred while declining quote.');
      setErrorModalOpen(true);
    }
  };

  // Stats
  const openCount = tickets.filter(t => t.status === 'open').length;
  const emergencyCount = tickets.filter(t => getUrgencyDetails(t.urgency).value === 'emergency' && t.status !== 'paid').length;
  const unassignedCount = tickets.filter(t => !t.contractorId && t.status !== 'paid').length;
  const completedApprovalsCount = tickets.filter(t => t.status === 'completed').length;

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.tenantName && t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || getUrgencyDetails(t.urgency).value === urgencyFilter;
    const matchesProp = propertyFilter === 'All' || t.propertyId === propertyFilter;

    return matchesSearch && matchesStatus && matchesUrgency && matchesProp;
  });

  if (!canView) {
    return <AccessDeniedOverlay moduleName="Maintenance" actionName="View Tickets" />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full flex-1 animate-fade-in text-left relative">
      {deniedAction && (
        <AccessDeniedOverlay 
          moduleName="Maintenance" 
          actionName={deniedAction} 
          onClose={() => setDeniedAction(null)} 
        />
      )}
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-paper-900 dark:text-white tracking-tight">Maintenance Overview</h1>
          <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">Manage work orders, contractor profiles, and billing approvals.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-coral-500 text-white rounded-md hover:bg-coral-600 active:scale-95 transition-all duration-150 shadow-sm shadow-coral-500/20 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Work Order
        </button>
      </div>



      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Requests */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors duration-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Open Tickets</span>
            <div className="p-1.5 bg-paper-100 dark:bg-ink-900 rounded text-paper-600 dark:text-ink-300">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 dark:text-white">{loading ? '...' : openCount}</span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400">Needs assigning</span>
          </div>
        </div>

        {/* Emergencies */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors duration-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-coral-500/10 dark:bg-coral-500/5 rounded-bl-full z-0"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Emergencies</span>
            <div className="p-1.5 bg-coral-50 dark:bg-coral-500/10 rounded text-coral-600 dark:text-coral-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <span className="text-2xl font-bold text-coral-650 dark:text-coral-400">{loading ? '...' : emergencyCount}</span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400">Pulsating alerts</span>
          </div>
        </div>

        {/* Unassigned Work */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors duration-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Unassigned</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded text-amber-600 dark:text-amber-400">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 dark:text-white">{loading ? '...' : unassignedCount}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Assign a contractor</span>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-4 rounded-lg flex flex-col justify-between transition-colors duration-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Completed Invoices</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{loading ? '...' : completedApprovalsCount}</span>
            <span className="text-[10px] text-paper-500 dark:text-ink-400 font-medium">Awaiting payout settlement</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg shadow-sm transition-colors duration-200 flex flex-col">
        
        {/* Filters Panel */}
        <div className="p-3 border-b border-paper-200 dark:border-ink-700 flex flex-wrap items-center gap-3 bg-paper-50/50 dark:bg-ink-900/20 rounded-t-lg">
          
          {/* Search bar */}
          <div className="relative flex-grow max-w-xs">
            <Search className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, Tenant, or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-paper-200 dark:border-ink-700 rounded-md bg-white dark:bg-ink-900 text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors duration-200"
            />
          </div>

          <div className="h-5 w-px bg-paper-200 dark:bg-ink-700 hidden sm:block mx-1"></div>

          {/* Filtering Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Status Select */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs rounded-md pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">Status: All</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid & Settled</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-paper-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Urgency Select */}
            <div className="relative">
              <select 
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs rounded-md pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">Priority: All</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-paper-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Property Select */}
            <div className="relative">
              <select 
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-xs rounded-md pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-coral-500 cursor-pointer"
              >
                <option value="All">Property: All</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-paper-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('All'); setUrgencyFilter('All'); setPropertyFilter('All'); }}
            className="ml-auto text-xs text-paper-600 dark:text-ink-300 hover:text-white bg-paper-100 dark:bg-ink-700 px-2 py-1 rounded transition-all"
          >
            Clear Filters
          </button>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto table-container">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-paper-50 dark:bg-ink-900/80 border-b border-paper-200 dark:border-ink-700 text-[11px] uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium transition-colors">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded border-paper-300 dark:border-ink-600 bg-transparent text-coral-500 focus:ring-coral-500 dark:bg-ink-800" />
                </th>
                <th className="px-4 py-3">Work Order Title</th>
                <th className="px-4 py-3">Property Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Tech</th>
                <th className="px-4 py-3 cursor-pointer text-right">Age</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 transition-colors bg-white dark:bg-ink-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-paper-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-coral-500" />
                      <span>Loading tickets database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-paper-500">
                    No work orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-all duration-150 group">
                    <td className="px-4 py-3.5 align-top">
                      <input type="checkbox" className="rounded border-paper-300 dark:border-ink-600 bg-transparent text-coral-500 focus:ring-coral-500 dark:bg-ink-800 mt-1" />
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-paper-500 dark:text-ink-400">#{ticket.id.toUpperCase()}</span>
                        <span className="font-semibold text-paper-900 dark:text-white group-hover:text-coral-500 transition-colors">{ticket.title}</span>
                        <span className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1 mt-0.5">
                          <Tag className="w-3 h-3" /> {ticket.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-paper-800 dark:text-ink-100">{ticket.propertyName || 'Common Area'}</span>
                        <span className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-paper-400" /> Unit: {ticket.unitLabel || 'N/A'} {ticket.tenantName ? `(${ticket.tenantName})` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      {(() => {
                        const details = getUrgencyDetails(ticket.urgency);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${details.bgClass}`}>
                            {details.animatePulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                            {details.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        ticket.status === 'open' ? 'bg-paper-150 dark:bg-ink-900 border border-paper-250 dark:border-ink-700 text-paper-700 dark:text-ink-300' :
                        ticket.status === 'assigned' ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' :
                        ticket.status === 'quote_submitted' ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400' :
                        ticket.status === 'quote_negotiating' ? 'bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400' :
                        ticket.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400' :
                        ticket.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        'bg-paper-200 dark:bg-ink-750 text-paper-500 dark:text-emerald-300 border border-emerald-500/25'
                      }`}>
                        {ticket.status === 'open' ? 'Open' :
                         ticket.status === 'assigned' ? 'Assigned' :
                         ticket.status === 'quote_submitted' ? 'Quote Review' :
                         ticket.status === 'quote_negotiating' ? 'Negotiating' :
                         ticket.status === 'in_progress' ? 'In Progress' :
                         ticket.status === 'completed' ? 'Completed (Pending Pay)' :
                         ticket.status === 'paid' ? 'Paid & Settled' : ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      {ticket.contractorId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-coral-500/15 text-coral-500 flex items-center justify-center text-[10px] font-bold">
                            {ticket.contractorName ? ticket.contractorName.slice(0, 2).toUpperCase() : 'CO'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-paper-900 dark:text-white">{ticket.contractorName || 'Assigned Tradesman'}</span>
                            {ticket.status === 'completed' && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Inv: ${ticket.amount}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setShowAssignModal(ticket); setAssigneeId(''); }}
                          className="flex items-center gap-1.5 px-2 py-1 border border-dashed border-paper-300 dark:border-ink-600 rounded text-paper-500 dark:text-ink-400 hover:border-coral-500 hover:text-coral-500 dark:hover:border-coral-400 dark:hover:text-coral-400 transition-all text-[10px] font-semibold bg-paper-50 dark:bg-ink-900/50"
                        >
                          <Plus className="w-3 h-3" /> Assign Tech
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-right text-paper-600 dark:text-ink-300 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button 
                          onClick={() => setShowDetailsModal(ticket)}
                          className="px-2 py-1 bg-paper-100 dark:bg-ink-700 text-paper-700 dark:text-white rounded text-[10px] font-medium hover:bg-paper-200 dark:hover:bg-ink-600 transition-all"
                        >
                          Details
                        </button>

                        {ticket.status === 'completed' && (
                          <button 
                            onClick={() => setShowSettleModal(ticket)}
                            className="px-2.5 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 transition-all shadow-sm"
                          >
                            Approve & Pay
                          </button>
                        )}
                        
                        {!['completed', 'paid'].includes(ticket.status) && (
                          <button 
                            onClick={() => { setShowAssignModal(ticket); setAssigneeId(ticket.contractorId || ''); }}
                            className="p-1 border border-paper-250 dark:border-ink-700 hover:border-coral-500 text-paper-500 hover:text-coral-500 rounded"
                            title="Reassign / Change Contractor"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-paper-200 dark:border-ink-700 flex items-center justify-between text-xs bg-paper-50/50 dark:bg-ink-900/20 rounded-b-lg transition-colors">
          <span className="text-paper-500 dark:text-ink-400">Showing {filteredTickets.length} of {tickets.length} tickets</span>
        </div>
      </div>

      {/* MODAL 1: Create New Work Order */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 max-w-lg w-full shadow-lg text-left">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-paper-900 dark:text-white">Create Work Order Request</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-paper-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              {formErrors.global && (
                <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs rounded">
                  {formErrors.global}
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Issue Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full bg-paper-50 dark:bg-ink-900 border ${formErrors.title ? 'border-red-500' : 'border-paper-200 dark:border-ink-700'} rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500`}
                  placeholder="e.g. Clogged drain or HVAC thermostat failure"
                />
                {formErrors.title && <span className="text-[10px] text-red-500">{formErrors.title}</span>}
              </div>

              {/* Property & Unit selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Target Property</label>
                  <select 
                    value={formPropertyId}
                    onChange={(e) => { setFormPropertyId(e.target.value); setFormUnitId(''); }}
                    className={`bg-paper-50 dark:bg-ink-900 border ${formErrors.propertyId ? 'border-red-500' : 'border-paper-200 dark:border-ink-700'} rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none`}
                  >
                    <option value="">-- Choose Property --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {formErrors.propertyId && <span className="text-[10px] text-red-500">{formErrors.propertyId}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Target Unit</label>
                  <select 
                    value={formUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    disabled={!formPropertyId}
                    className={`bg-paper-50 dark:bg-ink-900 border ${formErrors.unitId ? 'border-red-500' : 'border-paper-200 dark:border-ink-700'} rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none disabled:opacity-50`}
                  >
                    <option value="">-- Choose Unit --</option>
                    {availableUnitsForSelectedProperty.map(u => (
                      <option key={u.id} value={u.id}>Unit {u.label} {u.tenantName ? `(Occupied)` : '(Vacant)'}</option>
                    ))}
                  </select>
                  {formErrors.unitId && <span className="text-[10px] text-red-500">{formErrors.unitId}</span>}
                </div>
              </div>

              {/* Urgency & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Urgency Level</label>
                  <select 
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value)}
                    className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="urgent">Urgent</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                  >
                    <option value="General Maintenance">General Maintenance</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Landscaping">Landscaping</option>
                    <option value="Roofing">Roofing</option>
                  </select>
                </div>
              </div>

              {/* Optional Contractor assignment */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Assign Contractor (Optional)</label>
                <select 
                  value={formContractorId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormContractorId(val);
                    const contractor = contractors.find(c => (c.userId === val || c.id === val));
                    if (contractor && contractor.hourlyRate) {
                      setFormHourlyRate(String(contractor.hourlyRate));
                    } else {
                      setFormHourlyRate('');
                    }
                  }}
                  className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Leave Unassigned / Open Pool --</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.userId || c.id}>{c.name} ({c.specialty})</option>
                  ))}
                </select>
              </div>

              {formContractorId && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-paper-100 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Hourly Rate ($ / hr)</label>
                    <input 
                      type="number"
                      value={formHourlyRate}
                      onChange={(e) => setFormHourlyRate(e.target.value)}
                      placeholder="e.g. 50"
                      className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Max Authorization Limit ($)</label>
                    <input 
                      type="number"
                      value={formMaxAuthorization}
                      onChange={(e) => setFormMaxAuthorization(e.target.value)}
                      placeholder="e.g. 500"
                      className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Issue Description</label>
                <textarea 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full bg-paper-50 dark:bg-ink-900 border ${formErrors.desc ? 'border-red-500' : 'border-paper-200 dark:border-ink-700'} rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 h-24 resize-none`}
                  placeholder="Provide details about the issue. Include tenant notes, specific symptoms, or entry instructions..."
                />
                {formErrors.desc && <span className="text-[10px] text-red-500">{formErrors.desc}</span>}
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-2 border-t border-paper-200 dark:border-ink-700/60 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-paper-700 dark:text-ink-300 border border-paper-200 dark:border-ink-700 rounded hover:bg-paper-100 dark:hover:bg-ink-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingTicket}
                  className="px-3 py-1.5 text-xs font-semibold bg-coral-500 hover:bg-coral-600 text-white rounded shadow-sm flex items-center gap-1"
                >
                  {isSubmittingTicket ? (
                    <>Creating Order... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
                  ) : (
                    <>Create Work Order</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Contractor */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 max-w-sm w-full shadow-lg text-left">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-paper-900 dark:text-white">Assign Contractor</h3>
              <button onClick={() => setShowAssignModal(null)} className="text-paper-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignContractorSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Select Contractor</label>
                <select 
                  value={assigneeId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAssigneeId(val);
                    const contractor = contractors.find(c => (c.userId === val || c.id === val));
                    if (contractor && contractor.hourlyRate) {
                      setAssigneeHourlyRate(String(contractor.hourlyRate));
                    } else {
                      setAssigneeHourlyRate('');
                    }
                  }}
                  className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                  required
                >
                  <option value="">-- Choose Contractor --</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.userId || c.id}>{c.name} ({c.specialty})</option>
                  ))}
                </select>
              </div>

              {assigneeId && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-paper-100 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Hourly Rate ($ / hr)</label>
                    <input 
                      type="number"
                      value={assigneeHourlyRate}
                      onChange={(e) => setAssigneeHourlyRate(e.target.value)}
                      placeholder="e.g. 50"
                      className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-paper-500 dark:text-ink-400 uppercase tracking-wider">Max Limit ($)</label>
                    <input 
                      type="number"
                      value={assigneeMaxAuthorization}
                      onChange={(e) => setAssigneeMaxAuthorization(e.target.value)}
                      placeholder="e.g. 500"
                      className="bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md p-2 text-xs text-paper-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-paper-200 dark:border-ink-700/60 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(null)}
                  className="px-3 py-1.5 text-xs text-paper-700 dark:text-ink-300 border border-paper-200 dark:border-ink-700 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isAssigning}
                  className="px-3 py-1.5 text-xs font-semibold bg-coral-500 hover:bg-coral-600 text-white rounded shadow-sm flex items-center gap-1"
                >
                  {isAssigning ? (
                    <>Assigning... <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
                  ) : (
                    <>Confirm Assign</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Detailed Ticket View */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-5 max-w-lg w-full shadow-lg text-left">
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-paper-900 dark:text-white">Work Order Details</h3>
                <span className="text-[9px] font-mono text-paper-500 dark:text-ink-400">#{showDetailsModal.id.toUpperCase()}</span>
              </div>
              <button onClick={() => setShowDetailsModal(null)} className="text-paper-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Ticket Title</span>
                <div className="text-sm font-semibold text-paper-900 dark:text-white mt-1">{showDetailsModal.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Urgency</span>
                  <div className="mt-1">
                    {(() => {
                      const details = getUrgencyDetails(showDetailsModal.urgency);
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${details.bgClass}`}>
                          {details.animatePulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                          {details.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Category</span>
                  <div className="text-xs text-paper-800 dark:text-white mt-0.5">{showDetailsModal.category}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Property Location</span>
                  <div className="text-xs text-paper-800 dark:text-white mt-0.5">{showDetailsModal.propertyName || 'Common Area'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Unit & Tenant</span>
                  <div className="text-xs text-paper-800 dark:text-white mt-0.5">
                    Unit: {showDetailsModal.unitLabel || 'N/A'} {showDetailsModal.tenantName ? `(${showDetailsModal.tenantName})` : ''}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Description</span>
                <p className="p-3 bg-paper-50 dark:bg-ink-900 border border-paper-150 dark:border-ink-750 text-xs text-paper-800 dark:text-ink-200 rounded mt-1 leading-relaxed whitespace-pre-wrap">
                  {showDetailsModal.description}
                </p>
              </div>

              {showDetailsModal.contractorId && (
                <div className="p-3 bg-coral-500/5 border border-coral-500/20 rounded-md space-y-2">
                  <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider">Assigned Contractor Summary</span>
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      <div className="text-xs font-semibold text-paper-900 dark:text-white">{showDetailsModal.contractorName}</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-400">Assigned Partner</div>
                    </div>
                    {showDetailsModal.amount && (
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-500">${showDetailsModal.amount}</div>
                        <div className="text-[9px] text-paper-500">Invoice Amount</div>
                      </div>
                    )}
                  </div>

                  {(showDetailsModal.hourlyRate || showDetailsModal.maxAuthorization) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-coral-500/10 text-xs">
                      {showDetailsModal.hourlyRate && (
                        <div>
                          <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase">Hourly Rate</span>
                          <div className="font-semibold text-paper-800 dark:text-white">${showDetailsModal.hourlyRate} / hr</div>
                        </div>
                      )}
                      {showDetailsModal.maxAuthorization && (
                        <div>
                          <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase">Authorization Limit</span>
                          <div className="font-semibold text-paper-800 dark:text-white">Up to ${showDetailsModal.maxAuthorization}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {showDetailsModal.scheduledAt && (
                    <div className="pt-2 border-t border-coral-500/10 text-xs">
                      <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase font-bold block">Estimated Schedule</span>
                      <div className="font-semibold text-paper-800 dark:text-white">{showDetailsModal.scheduledAt}</div>
                    </div>
                  )}

                  {showDetailsModal.quoteAmount && (
                    <div className="pt-2 border-t border-coral-500/10 text-xs">
                      <span className="text-[9px] text-paper-400 dark:text-ink-500 uppercase font-bold block">Proposed Quote</span>
                      <div className="font-semibold text-emerald-500 text-sm font-mono">{showDetailsModal.quoteAmount}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Status and Action transitions */}
              <div className="flex flex-col border-t border-paper-200 dark:border-ink-700/60 pt-4 gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-paper-500 uppercase font-bold tracking-wider block">Current Status</span>
                    <span className="text-xs font-semibold text-paper-900 dark:text-white mt-0.5 block capitalize">
                      {showDetailsModal.status === 'completed' ? 'Awaiting Settle Approved' : 
                       showDetailsModal.status === 'quote_submitted' ? 'Quote Submitted' :
                       showDetailsModal.status === 'quote_negotiating' ? 'Negotiating Quote' :
                       showDetailsModal.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  {showDetailsModal.status === 'completed' && (
                    <>
                      <button 
                        onClick={() => updateTicketStatus(showDetailsModal.id, 'in_progress')}
                        className="px-3 py-1.5 text-xs text-red-500 bg-red-500/10 border border-red-500 rounded hover:bg-red-500/20"
                      >
                        Decline/Revise
                      </button>
                      <button 
                        onClick={() => { setShowSettleModal(showDetailsModal); setShowDetailsModal(null); }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 rounded hover:bg-emerald-650 shadow"
                      >
                        Approve & Pay Settle
                      </button>
                    </>
                  )}
                  {showDetailsModal.status === 'open' && (
                    <button 
                      onClick={() => { setShowAssignModal(showDetailsModal); setShowDetailsModal(null); }}
                      className="px-3 py-1.5 text-xs text-white bg-coral-500 rounded hover:bg-coral-650 shadow"
                    >
                      Assign Contractor
                    </button>
                  )}
                  {showDetailsModal.status === 'quote_submitted' && (
                    <div className="flex flex-col gap-2 w-full">
                      {showNegotiateInput ? (
                        <div className="space-y-2 p-3 bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg">
                          <label className="text-[10px] font-bold uppercase text-paper-500 dark:text-ink-400">Counter-Offer Amount ($)</label>
                          <input
                            type="text"
                            placeholder="e.g. 120 or $120 - $180"
                            value={counterOfferValue}
                            onChange={(e) => setCounterOfferValue(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-ink-950 border border-paper-250 dark:border-ink-750 text-xs rounded text-paper-900 dark:text-white"
                          />
                          <label className="text-[10px] font-bold uppercase text-paper-500 dark:text-ink-400">Message / Instructions (Optional)</label>
                          <textarea
                            placeholder="Provide feedback on the quote..."
                            value={counterOfferMessage}
                            onChange={(e) => setCounterOfferMessage(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-ink-950 border border-paper-250 dark:border-ink-750 text-xs rounded text-paper-900 dark:text-white resize-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowNegotiateInput(false)}
                              className="px-3 py-1 bg-paper-250 dark:bg-ink-800 text-xs rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleNegotiateQuote(showDetailsModal.id)}
                              className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded"
                            >
                              Send Counter
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end w-full">
                          <button 
                            onClick={() => handleDeclineQuote(showDetailsModal.id)}
                            className="px-3 py-1.5 text-xs text-red-500 bg-red-500/10 border border-red-500 rounded hover:bg-red-500/20"
                          >
                            Decline & Release
                          </button>
                          <button 
                            onClick={() => {
                              setShowNegotiateInput(true);
                              setCounterOfferValue(showDetailsModal.quoteAmount || '');
                            }}
                            className="px-3 py-1.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded hover:bg-amber-500/20"
                          >
                            Negotiate Quote
                          </button>
                          <button 
                            onClick={() => handleAcceptQuote(showDetailsModal.id, showDetailsModal.quoteAmount)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 rounded hover:bg-emerald-650 shadow"
                          >
                            Accept & Schedule
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {showDetailsModal.status === 'quote_negotiating' && (
                    <div className="flex flex-col gap-2 w-full text-right">
                      <p className="text-xs text-paper-500 dark:text-ink-400 italic">
                        Counter-offer submitted. Awaiting contractor action.
                      </p>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDeclineQuote(showDetailsModal.id)}
                          className="px-3 py-1.5 text-xs text-red-500 bg-red-500/10 border border-red-500 rounded"
                        >
                          Cancel Negotiation & Release
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title={errorTitle}
        message={errorMessage}
        callStack={errorStack}
      />

      {/* Settle Modal */}
      {showSettleModal && (
        <SettleMaintenanceModal
          ticket={showSettleModal}
          onClose={() => setShowSettleModal(null)}
          onSettleCompanyExpense={handleSettleCompanyExpense}
          onSettleChargeTenant={handleSettleChargeTenant}
          onSettleWithoutPay={handleSettleWithoutPay}
        />
      )}
    </div>
  );
}
