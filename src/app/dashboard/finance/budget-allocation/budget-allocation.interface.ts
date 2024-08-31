import { Student } from '@app/dashboard/students/students.interface';

export interface BudgetAllocation {
  id: string;
  total: number;
  period: string;
  budgetDistribution: BudgetDistribution[];
  created_at: Date;
  updated_at: Date;
  year: number;
}

export interface BaseDistribution {
  school: string;
  class: string;
  tuition: number | string;
  textBooks: number | string;
  extraClasses: number | string;
  examFee: number | string;
  homeCare: number | string;
  uniformBag: number | string;
  excursion: number | string;
  transportation: number | string;
  wears: number | string;
  schoolFeeding: number | string;
  stationery: number | string;
  provision: number | string;
}

export interface CreateRequest extends BaseDistribution {
  budgetId: string;
  status: string;
}

export interface IRequest extends CreateRequest {
  id: string;
  created_at: Date;
  updated_at: Date;
  __budget__: BudgetAllocation;
}

export interface CreateBudgetDistribution extends BaseDistribution {
  studentCode: string;
}

export interface CreateOtherBudgetDistribution {
  title: string;
  amount: number | string;
  comment: string;
}

export interface OtherBudgetDistribution extends CreateOtherBudgetDistribution {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetDistribution extends CreateBudgetDistribution {
  id: string;
  student: Student;
  __student__: Student;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBudget {
  period: string;
  year: number;
}

export interface CreateFund {
  period: string;
  title: string;
  amount: number;
  comments: string;
  year: number;
}

export interface Fund extends CreateFund {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetDetails {
  budget: BudgetAllocation;
  budgetDistribution: BudgetDistribution[];
  splitDetails: {
    labels: string[];
    values: number[];
  };
  otherBudgetDistribution: OtherBudgetDistribution[];
}
