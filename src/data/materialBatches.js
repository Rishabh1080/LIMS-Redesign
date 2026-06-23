export const materialBatchOptions = [
  {
    value: 'R250118',
    label: 'R250118',
    expiryDate: '18/01/2027',
    supplier: 'Rankem',
    availableQuantity: 320,
  },
  {
    value: 'Q240702',
    label: 'Q240702',
    expiryDate: '30/06/2027',
    supplier: 'Qualigens',
    availableQuantity: 680,
  },
  {
    value: 'L250214',
    label: 'L250214',
    expiryDate: '14/02/2028',
    supplier: 'Loba Chemie',
    availableQuantity: 920,
  },
  {
    value: 'B240301',
    label: 'B240301',
    expiryDate: '01/03/2028',
    supplier: 'Merck Life Science',
    availableQuantity: 1250,
  },
  {
    value: 'C240412',
    label: 'C240412',
    expiryDate: '01/04/2028',
    supplier: 'SD Fine Chemicals',
    availableQuantity: 1480,
  },
  {
    value: 'M240916',
    label: 'M240916',
    expiryDate: '16/09/2028',
    supplier: 'Merck Life Science',
    availableQuantity: 2100,
  },
  {
    value: 'P250104',
    label: 'P250104',
    expiryDate: '04/01/2029',
    supplier: 'Loba Chemie',
    availableQuantity: 760,
  },
  {
    value: 'N250319',
    label: 'N250319',
    expiryDate: '19/03/2029',
    supplier: 'Rankem',
    availableQuantity: 540,
  },
  {
    value: 'T250611',
    label: 'T250611',
    expiryDate: '11/06/2029',
    supplier: 'Qualigens',
    availableQuantity: 1320,
  },
  {
    value: 'V251020',
    label: 'V251020',
    expiryDate: '20/10/2029',
    supplier: 'SD Fine Chemicals',
    availableQuantity: 1160,
  },
  {
    value: 'X260115',
    label: 'X260115',
    expiryDate: '15/01/2030',
    supplier: 'Merck Life Science',
    availableQuantity: 1850,
  },
];

function parseDisplayDate(value) {
  const [day, month, year] = String(value ?? '').split('/').map(Number);

  return new Date(year, month - 1, day).getTime();
}

export function getMaterialBatchOptions() {
  return [...materialBatchOptions]
    .sort((first, second) => parseDisplayDate(first.expiryDate) - parseDisplayDate(second.expiryDate))
    .map((batch, index) => ({
      ...batch,
      rightLabel: batch.expiryDate,
      warning: index === 0,
    }));
}
