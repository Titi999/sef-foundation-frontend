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

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const schools = [
  {
    id: '1',
    name: 'Maplewood Elementary School',
    email: 'maplewood@example.com',
    phone: '(123) 456-7890',
    location: '123 Main Street, Anytown, USA',
    created_at: '2024-06-02T12:40:02Z',
  },
  {
    id: '2',
    name: 'Willow High School',
    email: 'willowhigh@example.com',
    phone: '(987) 654-3210',
    location: '456 Elm Avenue, Another City, USA',
    created_at: '2024-06-02T12:40:02Z',
  },
  {
    id: '3',
    name: 'Oakridge Middle School',
    email: 'oakridge@example.com',
    phone: '(555) 123-4567',
    location: '789 Oak Lane, Yet Another Town, USA',
    created_at: '2024-06-02T12:40:02Z',
  },
  {
    id: '4',
    name: 'Cedar Grove Academy',
    email: 'cedargrove@example.com',
    phone: '(111) 222-3333',
    location: '987 Cedar Street, Somewhereville, USA',
    created_at: '2024-06-02T12:40:02Z',
  },
  {
    id: '5',
    name: 'Pineview Preparatory School',
    email: 'pineview@example.com',
    phone: '(444) 555-6666',
    location: '321 Pine Road, Anywhere City, USA',
    created_at: '2024-06-02T12:40:02Z',
  },
];
