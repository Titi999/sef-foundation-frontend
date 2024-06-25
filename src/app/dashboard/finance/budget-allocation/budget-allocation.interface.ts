export interface BudgetAllocation {
  id: string;
  total: number;
  utilized: number;
  surplus: number;
  startDate: Date;
  endDate: Date;
  budgetDistribution: BudgetDistribution[];
  created_at: Date;
  updated_at: Date;
}

export interface BudgetDistribution {
  id: string;
  title: string;
  amount: number;
  boardingHouse: boolean;
  comments: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBudget {
  total: number;
  startDate: Date;
  endDate: Date;
  distributions: CreateBudgetDistribution[];
}

export interface CreateBudgetDistribution {
  title: string;
  amount: number;
  boardingHouse: boolean;
  comments: string;
}
