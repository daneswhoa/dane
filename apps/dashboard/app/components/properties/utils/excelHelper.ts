import * as XLSX from 'xlsx';
import { UnitRow } from '../types';

export const parseExcelRoster = (
  file: File,
  defaultPropertyType: string,
  onSuccess: (units: UnitRow[], uniqueTypes: string[]) => void,
  onError: (errorMsg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

      if (data.length === 0) {
        onError('The selected Excel sheet appears to be empty.');
        return;
      }

      const uniqueTypesSet = new Set<string>();
      const parsedUnits: UnitRow[] = data.map((row: any, idx) => {
        // Floor
        const floor = (row['Floor'] || row['Level'] || '1').toString().trim();

        // Unit Name
        const unitName = (row['Unit Name'] || row['Unit'] || row['Name'] || row['Label'] || `${idx + 101}`).toString().trim();

        // Unit ID (Floor + Unit Name, max 5 chars)
        let unitId = (row['Unit ID'] || row['ID'] || row['UnitCode'] || row['Code'] || `${floor}${unitName}`).toString().trim();
        if (!unitId) {
          unitId = `${floor}${unitName}`;
        }
        // Normalize Unit ID to max 5 chars uppercase
        unitId = unitId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 5).toUpperCase();

        // Unit Type
        const unitType = (row['Unit Type'] || row['Type'] || defaultPropertyType || 'Apartment').toString().trim();
        if (unitType) {
          uniqueTypesSet.add(unitType);
        }

        // Rent extraction (handles 'Rent (KES)', 'Rent ($)', etc.)
        let rawRent = '0';
        for (const key of Object.keys(row)) {
          if (key.toLowerCase().startsWith('rent')) {
            rawRent = row[key] || '0';
            break;
          }
        }
        const rent = Math.round(parseFloat(rawRent.toString().replace(/[^\d.-]/g, ''))) || 0;

        // Arrears extraction (handles 'Arrears (KES)', 'Arrears ($)', etc.)
        let rawArrears = '0';
        for (const key of Object.keys(row)) {
          if (key.toLowerCase().startsWith('arrears')) {
            rawArrears = row[key] || '0';
            break;
          }
        }
        const arrears = Math.round(parseFloat(rawArrears.toString().replace(/[^\d.-]/g, ''))) || 0;

        // Tenant info
        const tenantName = (row['Tenant Name'] || row['Tenant'] || '').toString().trim();
        const tenantPhone = (row['Tenant Phone'] || row['Phone'] || '').toString().trim();
        const tenantEmail = (row['Tenant Email'] || row['Email'] || '').toString().trim();
        const tenantIdNumber = (row['Tenant ID Number'] || row['Tenant ID'] || '').toString().trim();
        const moveInDate = (row['Move-in Date'] || row['Move In'] || '').toString().trim();

        // Kin/emergency contact extraction
        const kins = [];
        for (let k = 1; k <= 3; k++) {
          const name = (row[`Kin ${k} Name`] || '').toString().trim();
          const phone = (row[`Kin ${k} Phone`] || '').toString().trim();
          const relation = (row[`Kin ${k} Relation`] || '').toString().trim();
          if (name || phone) {
            kins.push({ name, phone, relation });
          }
        }

        return {
          unitId,
          unitName,
          floor,
          unitType,
          rent: rent.toString(),
          deposit: '0', // will be calculated by Unit Type configs
          moveInFees: '0',
          recurringFees: '0',
          tenantName,
          tenantEmail,
          tenantPhone,
          tenantIdNumber,
          moveInDate,
          arrears: arrears.toString(),
          kins,
        };
      });

      onSuccess(parsedUnits, Array.from(uniqueTypesSet));
    } catch (err: any) {
      onError(`Failed to parse Excel roster file: ${err.message}`);
    }
  };
  reader.readAsBinaryString(file);
};

export const downloadXlsxRosterTemplate = () => {
  const templateRows = [
    {
      'Floor': 1,
      'Unit Name': '101',
      'Unit Type': '2 Bedroom',
      'Rent (KES)': 25000,
      'Tenant Name': 'Michael Kamau',
      'Tenant Phone': '0734956412',
      'Tenant Email': 'michael.kamau@example.com',
      'Tenant ID Number': '25276549',
      'Kin 1 Name': 'Ruth Kamau',
      'Kin 1 Phone': '0772252076',
      'Kin 1 Relation': 'Spouse',
      'Kin 2 Name': '',
      'Kin 2 Phone': '',
      'Kin 2 Relation': '',
      'Kin 3 Name': '',
      'Kin 3 Phone': '',
      'Kin 3 Relation': '',
      'Move-in Date': '2023-05-26',
      'Arrears (KES)': 0
    },
    {
      'Floor': 1,
      'Unit Name': '102',
      'Unit Type': 'Studio',
      'Rent (KES)': 15000,
      'Tenant Name': '',
      'Tenant Phone': '',
      'Tenant Email': '',
      'Tenant ID Number': '',
      'Kin 1 Name': '',
      'Kin 1 Phone': '',
      'Kin 1 Relation': '',
      'Kin 2 Name': '',
      'Kin 2 Phone': '',
      'Kin 2 Relation': '',
      'Kin 3 Name': '',
      'Kin 3 Phone': '',
      'Kin 3 Relation': '',
      'Move-in Date': '',
      'Arrears (KES)': 0
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Property Setup');
  XLSX.writeFile(workbook, 'LandlordNL_Sample_Tenants_Template.xlsx');
};
