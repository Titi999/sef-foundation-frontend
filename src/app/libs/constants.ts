export const serverError = 'Server Error...';

export const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;

export const budgetDistributions = [
  { label: 'Primary School Fees', value: 'Primary School Fees' },
  { label: 'Junior High School Fees', value: 'Junior High School Fees' },
  { label: 'Senior High School Fees', value: 'Senior High School Fees' },
  {
    label: 'Senior Techical/Vocation School Fees',
    value: 'Senior Techical/Vocation School',
  },
  { label: 'HND Tuition Fees', value: 'HND Tuition Fees' },
  { label: 'First Degree Tuition Fees', value: 'First Degree Tuition Fees' },
  { label: 'Second Degree Tuition Fees', value: 'Second Degree Tuition Fees' },
  { label: 'Professional Course Fees', value: 'Professional Course Fees' },
];
