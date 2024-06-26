export const serverError = 'Server Error...';

export const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const;

export const requestFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
];

export const budgetDistributions = [
  { label: 'Primary School Fees', value: 'Primary School Fees' },
  { label: 'Junior High School Fees', value: 'Junior High School Fees' },
  { label: 'Senior High School Fees', value: 'Senior High School Fees' },
  {
    label: 'Senior Technical/Vocation School Fees',
    value: 'Senior Technical/Vocation School',
  },
  { label: 'HND Tuition Fees', value: 'HND Tuition Fees' },
  { label: 'First Degree Tuition Fees', value: 'First Degree Tuition Fees' },
  { label: 'Second Degree Tuition Fees', value: 'Second Degree Tuition Fees' },
  { label: 'Professional Course Fees', value: 'Professional Course Fees' },
  { label: 'Contingency', value: 'Contingency' },
  {
    label: 'Organ Practice Lessons',
    value: 'Organ Practice Lessons',
  },
  {
    label: 'Abacus',
    value: 'Abacus',
  },
  {
    label: 'Utility',
    value: 'Utility',
  },
  {
    label: 'Vocation training during holidays',
    value: 'Vocation training during holidays',
  },
  {
    label: 'Security and Maintenance',
    value: 'Security and Maintenance',
  },
  { label: 'Miscellaneous / Up Keep', value: 'Miscellaneous / Up Keep' },
  { label: 'Medicals (SBH)', value: 'Medicals (SBH)' },
  { label: 'National Service Scheme', value: 'National Service Scheme' },
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

export const multi = [
  {
    name: 'Germany',
    series: [
      {
        name: '2010',
        value: 7300000,
      },
      {
        name: '2011',
        value: 8940000,
      },
    ],
  },

  {
    name: 'USA',
    series: [
      {
        name: '2010',
        value: 7870000,
      },
      {
        name: '2011',
        value: 8270000,
      },
    ],
  },

  {
    name: 'France',
    series: [
      {
        name: '2010',
        value: 5000002,
      },
      {
        name: '2011',
        value: 5800000,
      },
    ],
  },
];

export const classesList = [
  {
    label: 'University',
    value: [
      'Level 100',
      'Level 200',
      'Level 300',
      'Level 400',
      'Level 500',
      'Level 600',
    ],
  },
  {
    label: 'Senior High',
    value: ['SHS 1', 'SHS 2', 'SHS 3'],
  },
  {
    label: 'Junior High',
    value: ['JHS 1', 'JHS 2', 'JHS 3'],
  },
  {
    label: 'Primary',
    value: [
      'Primary 1',
      'Primary 2',
      'Primary 3',
      'Primary 4',
      'Primary 5',
      'Primary 6',
    ],
  },
];

export const typesList = [
  { label: 'All', value: '' },
  {
    label: 'Approved Disbursement',
    value: 'approved',
  },
  {
    label: 'Declined Disbursement',
    value: 'declined',
  },
];
