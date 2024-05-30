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
  created_at: Date;
  updated_at: Date;
}
