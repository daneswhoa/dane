const XLSX = require('xlsx');

const workbook = XLSX.readFile('C:\\Users\\My PC\\Documents\\sample\\Generated_Sample_Tenants (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet);

const parsedUnits = [];
json.forEach(row => {
  const getVal = (keys) => keys.reduce((acc, k) => acc || row[k], undefined);
  const label = getVal(['Unit Name', 'Unit']);
  if (!label) return;
  const rentRaw = getVal(['Rent', 'price']);
  const rent = Math.round(Number(String(rentRaw || '0').replace(/[^\d.-]/g, ''))) || 1200;
  
  parsedUnits.push({
    label: label.toString(),
    rent,
    rentRaw
  });
});

console.log(parsedUnits.slice(0, 5));
