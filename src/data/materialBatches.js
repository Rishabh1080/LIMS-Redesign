export const materialBatchOptions = [
  {
    value: 'R250118',
    label: 'R250118',
    expiryDate: '18/01/2027',
  },
  {
    value: 'Q240702',
    label: 'Q240702',
    expiryDate: '30/06/2027',
  },
  {
    value: 'L250214',
    label: 'L250214',
    expiryDate: '14/02/2028',
  },
  {
    value: 'B240301',
    label: 'B240301',
    expiryDate: '01/03/2028',
  },
  {
    value: 'C240412',
    label: 'C240412',
    expiryDate: '01/04/2028',
  },
  {
    value: 'M240916',
    label: 'M240916',
    expiryDate: '16/09/2028',
  },
  {
    value: 'P250104',
    label: 'P250104',
    expiryDate: '04/01/2029',
  },
  {
    value: 'N250319',
    label: 'N250319',
    expiryDate: '19/03/2029',
  },
  {
    value: 'T250611',
    label: 'T250611',
    expiryDate: '11/06/2029',
  },
  {
    value: 'V251020',
    label: 'V251020',
    expiryDate: '20/10/2029',
  },
  {
    value: 'X260115',
    label: 'X260115',
    expiryDate: '15/01/2030',
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
