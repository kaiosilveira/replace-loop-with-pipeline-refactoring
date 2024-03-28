export function acquireData(input) {
  const lines = input.split('\n');
  let firstLine = true;
  let result = [];
  const loopLines = lines;
  for (const line of loopLines) {
    if (firstLine) {
      firstLine = false;
      continue;
    }

    if (line.trim() === '') continue;

    const record = line.split(',');
    if (record[1].trim() === 'India') {
      result.push({ city: record[0].trim(), phone: record[2].trim() });
    }
  }

  return result;
}
