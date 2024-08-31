export function formatNumber(num: number | null | undefined): string {
  if (!num) {
    return '0';
  }
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function convertToNumber(input: string | number): number {
  // Remove commas and convert to a number
  const number =
    typeof input === 'string' ? parseFloat(input.replace(/,/g, '')) : input;

  // Check if the result is a valid number, otherwise return 0
  return isNaN(number) ? 0 : number;
}
