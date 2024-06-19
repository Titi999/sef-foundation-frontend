export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function areAllValuesIncluded<T>(subset: T[], superset: T[]): boolean {
  return subset.every(value => superset.includes(value));
}
