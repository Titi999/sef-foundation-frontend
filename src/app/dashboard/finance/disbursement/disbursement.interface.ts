import { Student } from '@app/dashboard/students/students.interface';
import { BudgetAllocation } from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';

export interface Disbursement {
  id: string;
  student: Student;
  budget: BudgetAllocation;
  disbursementDistribution: DisbursementDistribution[];
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
