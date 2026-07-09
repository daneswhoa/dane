export interface Unit {
  id: string;
  label: string;
  rent: number;
  status: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
  floor: string | null;
  unitType: string | null;
  arrears: number | null;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  unitsCount: number;
  status: string;
  photoUrl: string | null;
  settings?: string;
  currency?: string;
}

export function getCurrencySymbol(currency?: string) {
  switch (currency?.toUpperCase()) {
    case 'KES': return 'KES ';
    case 'EUR': return '€';
    case 'USD': return '$';
    default: return '$';
  }
}

export function formatMoney(amount: number, currency?: string) {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
}
