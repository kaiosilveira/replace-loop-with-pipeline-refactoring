export function acquireData(input) {
  const lines = input.split('\n');
  let result = [];
  const loopLines = lines.slice(1);
  for (const line of loopLines) {
    if (line.trim() === '') continue;

    const record = line.split(',');
    if (record[1].trim() === 'India') {
      result.push({ city: record[0].trim(), phone: record[2].trim() });
    }
  }

  return result;
}
