export interface FinanceReportInterface {
  accounting: AccountingRow[];
  runningTotal: number;
  summaryChart: {
    fund: IChart;
    disbursements: IChart;
    budget: IChart;
  };
}

export interface IChart {
  labels: string[];
  values: number[];
}

export interface AccountingRow {
  id: string;
  type: 'budget' | 'disbursement' | 'fund';
  amount: number;
  description: string;
  date: Date;
  runningTotal: number;
  period: string;
  year: number;
}
