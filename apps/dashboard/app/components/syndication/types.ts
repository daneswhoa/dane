export interface Property {
  id: string;
  name: string;
  address: string;
  units?: number;
  image?: string;
  occupancy?: string;
  currency: 'KES' | 'USD' | 'EUR';
  county?: string;
  subcounty?: string;
  latitude?: string;
  longitude?: string;
}

export interface ListedUnitData {
  unitId: string;
  label: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  moveInFeeDetails?: string;
  recurringFees: number;
  recurringFeeDetails?: string;
  images?: string;
  floor: string;
  unitType: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  county?: string;
  subcounty?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string;
  rules?: string;
}

export interface PresetAmenity {
  slug: string;
  label: string;
}

export const PRESET_AMENITIES: PresetAmenity[] = [
  { slug: 'wifi', label: 'WiFi Internet' },
  { slug: 'borehole', label: 'Borehole Water' },
  { slug: 'school', label: 'Nearby School' },
  { slug: 'highway', label: 'Nearby Highway' },
  { slug: 'parking', label: 'Ample Parking' },
  { slug: 'cctv', label: 'CCTV Surveillance' },
  { slug: 'generator', label: 'Backup Generator' },
  { slug: 'security', label: '24/7 Security Guard' },
  { slug: 'balcony', label: 'Private Balcony' },
  { slug: 'token_meter', label: 'Token Meter (KPLC)' }
];

export const COUNTY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Nairobi": { lat: -1.2921, lng: 36.8219 },
  "Mombasa": { lat: -4.0435, lng: 39.6682 },
  "Kiambu": { lat: -1.1463, lng: 36.9676 },
  "Kajiado": { lat: -2.0981, lng: 36.7818 },
  "Machakos": { lat: -1.5177, lng: 37.2634 },
  "Nakuru": { lat: -0.3031, lng: 36.0800 },
  "Kisumu": { lat: -0.1022, lng: 34.7617 },
  "Uasin Gishu": { lat: 0.5143, lng: 35.2698 },
  "Kwale": { lat: -4.1737, lng: 39.4475 },
  "Kilifi": { lat: -3.5107, lng: 39.9093 },
  "Tana River": { lat: -1.4988, lng: 40.0154 },
  "Lamu": { lat: -2.2717, lng: 40.9006 },
  "Taita-Taveta": { lat: -3.3161, lng: 38.4850 },
  "Garissa": { lat: -0.4532, lng: 39.6461 },
  "Wajir": { lat: 1.7471, lng: 40.0596 },
  "Mandera": { lat: 3.9367, lng: 41.8569 },
  "Marsabit": { lat: 2.3369, lng: 37.9904 },
  "Isiolo": { lat: 0.3524, lng: 37.5822 },
  "Meru": { lat: 0.0515, lng: 37.6456 },
  "Tharaka-Nithi": { lat: -0.2996, lng: 37.8979 },
  "Embu": { lat: -0.5388, lng: 37.4596 },
  "Kitui": { lat: -1.3725, lng: 38.0106 },
  "Makueni": { lat: -2.2612, lng: 37.7656 },
  "Nyandarua": { lat: -0.2642, lng: 36.3749 },
  "Nyeri": { lat: -0.4201, lng: 36.9476 },
  "Kirinyaga": { lat: -0.4989, lng: 37.3311 },
  "Murang'a": { lat: -0.7212, lng: 37.1503 },
  "Turkana": { lat: 3.1140, lng: 35.5973 },
  "West Pokot": { lat: 1.5126, lng: 35.1269 },
  "Samburu": { lat: 1.2185, lng: 36.8049 },
  "Trans-Nzoia": { lat: 1.0205, lng: 34.9982 },
  "Elgeyo-Marakwet": { lat: 0.8037, lng: 35.5398 },
  "Nandi": { lat: 0.1836, lng: 35.1269 },
  "Baringo": { lat: 0.4905, lng: 35.7412 },
  "Laikipia": { lat: 0.3606, lng: 36.7818 },
  "Narok": { lat: -1.0783, lng: 35.8601 },
  "Kericho": { lat: -0.3677, lng: 35.2827 },
  "Bomet": { lat: -0.7813, lng: 35.3416 },
  "Kakamega": { lat: 0.2842, lng: 34.7516 },
  "Vihiga": { lat: 0.0784, lng: 34.7224 },
  "Bungoma": { lat: 0.5695, lng: 34.5584 },
  "Busia": { lat: 0.4608, lng: 34.1115 },
  "Siaya": { lat: -0.0607, lng: 34.2882 },
  "Homa Bay": { lat: -0.5273, lng: 34.4571 },
  "Migori": { lat: -0.9996, lng: 34.4782 },
  "Kisii": { lat: -0.6817, lng: 34.7717 },
  "Nyamira": { lat: -0.5668, lng: 34.9358 }
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  const symbol = currency === 'EUR' ? '€' : currency === 'KES' ? 'KES ' : '$';
  return `${symbol}${amount.toLocaleString()}`;
};
