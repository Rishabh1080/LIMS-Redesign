export function parseSampleDate(value) {
  const [datePart] = String(value ?? '').split(',').map((part) => part.trim());

  if (!datePart) {
    return null;
  }

  const separator = datePart.includes('/') ? '/' : '-';
  const pieces = datePart.split(separator).map((piece) => Number(piece));

  if (pieces.length !== 3 || pieces.some((piece) => Number.isNaN(piece))) {
    return null;
  }

  const [first, second, third] = pieces;
  const year = first > 31 ? first : third;
  const month = second;
  const day = first > 31 ? third : first;
  const parsedDate = new Date(year, month - 1, day);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(23, 59, 59, 999);
  return parsedDate;
}

export function isSampleDelayed(sample) {
  if (typeof sample?.delayed === 'boolean') {
    return sample.delayed;
  }

  const targetDate = parseSampleDate(sample?.reportingDate);

  if (!targetDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today > targetDate;
}
