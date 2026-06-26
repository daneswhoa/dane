export interface TenantProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  unit: string;
  building: string;
  moveInDate: string;
  leaseEnd: string;
  autopayEnabled?: boolean;
  photoUrl?: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  owedAmount?: number;
  deposit?: number;
  rentDueDate?: string;
  latestTicket?: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
  } | null;
  emergencyContacts?: Array<{ name: string; relation: string; phone: string }>;
  nextOfKin?: Array<{ name: string; relation: string; phone: string }>;
  ownerId?: string;
  propertyId?: string;
  unitId?: string;
}

export interface Invoice {
  id: string;
  description: string;
  notes?: string;
  dateIssued: string;
  dueDate: string;
  amount: number;
  status: 'upcoming' | 'paid' | 'overdue';
  type: 'rent' | 'utility' | 'fee';
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: 'submitted' | 'reviewed' | 'scheduled' | 'resolved';
  category: string;
  createdAt: string;
  scheduledFor?: string;
  assignedContractor?: string;
  entryPermission: boolean;
}

export interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isAnnouncement?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'maintenance' | 'community' | 'alert';
}
