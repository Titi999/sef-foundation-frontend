export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function areAllValuesIncluded<T>(subset: T[], superset: T[]): boolean {
  return subset.every(value => superset.includes(value));
}

export function getYearsDropDownValues() {
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const years = [{ label: 'All', value: '' }];
  for (let i = 0; i <= currentYear - startYear; i++) {
    const year = (currentYear - i).toString();
    years.push({ label: year, value: year });
  }
  return years;
}
