import { Student } from '@app/dashboard/students/students.interface';

export interface Disbursement extends CreateDisbursement {
  id: string;
  student: Student;
  disbursementDistribution: DisbursementDistribution[];
  __student__: Student;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface DisbursementDistribution {
  id: string;
  title: string;
  amount: number;
  disbursement: Disbursement;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDisbursement {
  studentId?: string;
  title?: string;
  period: string;
  amount: number;
  year: number;
}

export interface CreateDisbursementDistribution {
  title: string;
  amount: number;
  comments: string;
}
