// ── User & Auth ──

export type UserRole = 'landlord' | 'manager' | 'tenant' | 'contractor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  createdAt: Date;
}

// ── Properties ──

export interface Property {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  unitsCount: number;
  status: 'active' | 'inactive';
  photoUrl?: string | null;
  createdAt: Date;
}

export interface Unit {
  id: string;
  propertyId: string;
  label: string;
  rent: number;
  status: 'occupied' | 'vacant';
  tenantId?: string | null;
}

// ── Tenants ──

export interface TenantContact {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  unitId: string;
  propertyId: string;
  ownerId: string;
  rent: number;
  arrears: number;
  status: 'active' | 'inactive';
}

// ── Invoices ──

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  tenantId: string;
  tenantEmail: string;
  tenantName: string;
  unitId: string;
  propertyId: string;
  ownerId: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  dueDate?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
}

// ── Tickets (Maintenance) ──

export type TicketUrgency = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'rejected';

export interface Ticket {
  id: string;
  description: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  tenantId: string;
  tenantEmail: string;
  propertyId: string;
  unitId: string;
  ownerId: string;
  contractorId?: string | null;
  amount?: number | null;
  photoUrl?: string | null;
  rating?: number | null;
  ratingComment?: string | null;
  createdAt: Date;
}

// ── Contractors ──

export interface Contractor {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  specialty: string;
  bio?: string | null;
  hourlyRate?: number | null;
  photoUrl?: string | null;
  status: 'available' | 'busy' | 'offline';
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
}
