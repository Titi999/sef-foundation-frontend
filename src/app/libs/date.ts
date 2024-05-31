export function getShortMonthName(date: Date | string) {
  const formattedDate = new Date(date);
  return formattedDate.toLocaleString('en-US', { month: 'short' });
}

export function getShortMonthAndYear(date: Date | string) {
  const formattedDate = new Date(date);
  return formattedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}
