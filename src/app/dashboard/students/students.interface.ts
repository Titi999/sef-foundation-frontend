import { School } from '../schools/school.service';

export interface Student extends SchoolBase {
  school: School;
  status: 'active' | 'inactive';
  created_at: Date;
  deactivated_at: Date;
  updated_at: Date;
}

interface SchoolBase {
  id: string;
  name: string;
  parent: string;
  level: string;
  description: string;
  phone: string;
  parentPhone: string;
  grandParent: string;
  greatGrandparent: string;
  boardingHouse: boolean;
}

export interface CreateStudent extends SchoolBase {
  school: string;
}

export type studentFormControls =
  | 'name'
  | 'parent'
  | 'school'
  | 'level'
  | 'phone'
  | 'parentPhone'
  | 'description'
  | 'grandParent'
  | 'greatGrandparent';
