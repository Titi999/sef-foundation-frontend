export interface Pagination<T> {
  total: number;
  currentPage: number;
  totalPages: number;
  items: T;
}

export interface Response<T> {
  message: string;
  data: T;
}

export interface IOverviewStatistics {
  totalFundingDisbursed: IMonthTotal[];
}

export interface IMonthTotal {
  month: string;
  total: number;
}
