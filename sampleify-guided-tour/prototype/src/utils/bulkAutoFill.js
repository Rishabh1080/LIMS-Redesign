const DAY_MS = 24 * 60 * 60 * 1000;

export function generateAutoFillData(row1, row2, targetRowCount) {
  const normalizedTarget = Math.max(2, Math.floor(targetRowCount));
  const generatedRows = [];
  const keys = [...new Set([...Object.keys(row1), ...Object.keys(row2)])];

  for (let rowNumber = 3; rowNumber <= normalizedTarget; rowNumber += 1) {
    const stepsAfterRow2 = rowNumber - 2;
    const generatedRow = {};

    keys.forEach((key) => {
      generatedRow[key] = extrapolateValue(row1[key], row2[key], stepsAfterRow2);
    });

    generatedRows.push(generatedRow);
  }

  return generatedRows;
}

// Exported so per-column auto-fill (single column, arbitrary anchor rows) can
// reuse the same date/alphanumeric pattern detection as the whole-row version
// above, instead of re-implementing it.
export function extrapolateValue(value1, value2, stepsAfterRow2) {
  if (value1 === value2) return value1;

  if (typeof value1 === 'string' && typeof value2 === 'string') {
    const date1 = parseSupportedDate(value1);
    const date2 = parseSupportedDate(value2);

    if (
      date1
      && date2
      && date1.order === date2.order
      && date1.separator === date2.separator
    ) {
      const deltaInDays = Math.round((date2.timestamp - date1.timestamp) / DAY_MS);
      return formatDate(date2.timestamp + deltaInDays * stepsAfterRow2 * DAY_MS, date2);
    }

    const alphanumericValue = extrapolateAlphanumeric(value1, value2, stepsAfterRow2);
    if (alphanumericValue !== null) return alphanumericValue;
  }

  return value2;
}

function parseSupportedDate(value) {
  const dmyMatch = /^(\d{2})([/-])(\d{2})\2(\d{4})$/.exec(value);
  const ymdMatch = /^(\d{4})([/-])(\d{2})\2(\d{2})$/.exec(value);
  let day;
  let month;
  let year;
  let order;
  let separator;

  if (dmyMatch) {
    day = Number(dmyMatch[1]);
    separator = dmyMatch[2];
    month = Number(dmyMatch[3]);
    year = Number(dmyMatch[4]);
    order = 'DMY';
  } else if (ymdMatch) {
    year = Number(ymdMatch[1]);
    separator = ymdMatch[2];
    month = Number(ymdMatch[3]);
    day = Number(ymdMatch[4]);
    order = 'YMD';
  } else {
    return null;
  }

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return { timestamp, order, separator };
}

function formatDate(timestamp, format) {
  const date = new Date(timestamp);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).padStart(4, '0');

  return format.order === 'DMY'
    ? `${day}${format.separator}${month}${format.separator}${year}`
    : `${year}${format.separator}${month}${format.separator}${day}`;
}

function extrapolateAlphanumeric(value1, value2, stepsAfterRow2) {
  const parts1 = value1.match(/\d+|\D+/g);
  const parts2 = value2.match(/\d+|\D+/g);

  if (!parts1 || !parts2 || parts1.length !== parts2.length) return null;

  let changedIndex = -1;

  for (let index = 0; index < parts1.length; index += 1) {
    if (parts1[index] === parts2[index]) continue;

    const isNumericPair = /^\d+$/.test(parts1[index]) && /^\d+$/.test(parts2[index]);
    if (!isNumericPair || changedIndex !== -1) return null;

    changedIndex = index;
  }

  if (changedIndex === -1) return null;

  const number1 = BigInt(parts1[changedIndex]);
  const number2 = BigInt(parts2[changedIndex]);
  const delta = number2 - number1;
  const generatedNumber = number2 + delta * BigInt(stepsAfterRow2);
  const originalWidth = parts2[changedIndex].length;
  const sign = generatedNumber < 0n ? '-' : '';
  const digits = (generatedNumber < 0n ? -generatedNumber : generatedNumber)
    .toString()
    .padStart(originalWidth, '0');
  const result = [...parts2];
  result[changedIndex] = `${sign}${digits}`;

  return result.join('');
}