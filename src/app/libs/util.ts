import {
  BudgetAllocation,
  BudgetDistribution,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';

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

export function calculateBudgetTotal({
  schoolFeeding,
  provision,
  wears,
  transportation,
  excursion,
  examFee,
  tuition,
  textBooks,
  extraClasses,
  stationery,
  uniformBag,
  homeCare,
}: BudgetDistribution): number {
  return (
    Number(tuition) +
    Number(textBooks) +
    Number(extraClasses) +
    Number(examFee) +
    Number(homeCare) +
    Number(uniformBag) +
    Number(excursion) +
    Number(transportation) +
    Number(wears) +
    Number(schoolFeeding) +
    Number(provision) +
    Number(stationery)
  );
}
