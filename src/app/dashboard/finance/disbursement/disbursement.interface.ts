import { Student } from '@app/dashboard/students/students.interface';
import { BudgetAllocation } from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';

export interface Disbursement {
  id: string;
  student: Student;
  budget: BudgetAllocation;
  disbursementDistribution: DisbursementDistribution[];
  status: string;
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
  studentId: string;
  amount: number;
  disbursementDistribution: CreateDisbursementDistribution[];
}

export interface CreateDisbursementDistribution {
  title: string;
  amount: number;
  comments: string;
}
