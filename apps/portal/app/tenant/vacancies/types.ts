export interface VacancyProperty {
  id: string;
  unitId: string;
  label: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  moveInFeeDetails: string;
  recurringFees: number;
  recurringFeeDetails: string;
  images: string[];
  floor: string;
  unitType: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  county: string;
  subcounty: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  rules: string[];
  agent: {
    name: string;
    email: string;
    phone: string;
    image: string;
  };
}

export const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

// Haversine distance helper
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
