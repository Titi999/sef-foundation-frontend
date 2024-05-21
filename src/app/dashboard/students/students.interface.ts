export interface Student {
  name: string;
  parent: string;
  school: string;
  level: string;
  description: string;
  phone: string;
  status: string;
}

export type studentFormControls =
  | 'name'
  | 'parent'
  | 'school'
  | 'level'
  | 'phone'
  | 'description';
