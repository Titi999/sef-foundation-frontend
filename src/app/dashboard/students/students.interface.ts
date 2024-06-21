import { School } from '../schools/school.service';

export interface Student {
  id: string;
  name: string;
  parent: string;
  school: School;
  level: string;
  description: string;
  phone: string;
  parentPhone: string;
  status: 'active' | 'inactive';
  created_at: Date;
  deactivated_at: Date;
  updated_at: Date;
}

export interface CreateStudent {
  id: string;
  name: string;
  parent: string;
  school: string;
  level: string;
  description: string;
  phone: string;
  parentPhone: string;
}

export type studentFormControls =
  | 'name'
  | 'parent'
  | 'school'
  | 'level'
  | 'phone'
  | 'parentPhone'
  | 'description';
