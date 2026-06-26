export interface ContractorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  bio?: string;
  hourlyRate?: string;
  photoUrl?: string;
  locationName?: string;
  status: string;
  stripeAccountId?: string;
}

export interface MaintenanceJob {
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
  photoUrl?: string;
  rating?: number;
  ratingComment?: string;
  scheduledAt?: string;
  quoteAmount?: string;
  quoteStatus?: string;
  contractorMessage?: string;
  proofPhotoUrl?: string;
  createdAt: string;
}
