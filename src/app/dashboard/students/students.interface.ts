import { School } from '../schools/school.service';
import { User } from '@app/auth/auth.type';

export interface Student extends StudentBase {
  school: School;
  code: string;
  status: 'active' | 'inactive';
  created_at: Date;
  deactivated_at: Date;
  updated_at: Date;
  user: User;
}

interface StudentBase {
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

export interface CreateStudent extends StudentBase {
  school: string;
  email: string;
}

export type studentFormControls =
  | 'name'
  | 'email'
  | 'parent'
  | 'school'
  | 'level'
  | 'phone'
  | 'parentPhone'
  | 'description'
  | 'grandParent'
  | 'greatGrandparent';
