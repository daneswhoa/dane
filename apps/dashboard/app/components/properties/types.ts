export interface KinDetail {
  name: string;
  phone: string;
  relation: string;
}

export interface UnitRow {
  unitId: string;
  unitName: string;
  floor: string;
  unitType: string;
  rent: string;
  deposit: string;
  moveInFees: string;
  recurringFees: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  arrears: string;
  kins?: KinDetail[];
  tenantIdNumber?: string;
}

export interface FeeItem {
  id: string;
  name: string;
  amount: string;
}

export interface UnitTypeConfig {
  unitType: string;
  depositMultiplier: '1x' | '2x' | '3x' | 'custom';
  customDeposit: string;
  otherMoveInFees: FeeItem[];
  garbageFee: string;
  otherRecurringFees: FeeItem[];
  utilities: string[];
}

export interface WizardState {
  setupMode: 'single' | 'multi';
  setupType: 'excel' | 'ui';
  uiType: 'identical' | 'scattered';
  step: number;
  propertyName: string;
  propertyType: string;
  propertyRegion: string;
  propertyAddress: string;
  units: UnitRow[];
  uploadedImageUrl: string;
  identicalCount: number;
  identicalRent: string;
  identicalDeposit: string;
  identicalRecurring: string;
  identicalMoveIn: string;
  taxId: string;
  constructionYear: string;
  mapLatitude: string;
  mapLongitude: string;
  unitTypes: string[];
  unitTypeConfigs: Record<string, UnitTypeConfig>;
}

export const initialWizardState: WizardState = {
  setupMode: 'single',
  setupType: 'ui',
  uiType: 'identical',
  step: 1,
  propertyName: '',
  propertyType: 'Multi-Family',
  propertyRegion: 'Downtown',
  propertyAddress: '',
  units: [],
  uploadedImageUrl: '',
  identicalCount: 10,
  identicalRent: '1800',
  identicalDeposit: '1800',
  identicalRecurring: '50',
  identicalMoveIn: '150',
  taxId: '',
  constructionYear: '',
  mapLatitude: '52.3676',
  mapLongitude: '4.9041',
  unitTypes: ['Studio', '1 Bedroom', '2 Bedroom'],
  unitTypeConfigs: {},
};
