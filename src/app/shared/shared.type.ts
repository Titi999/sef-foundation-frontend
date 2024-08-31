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

export interface IOverviewStatistics extends IOverviewStatisticsBase {
  fundsAllocated: number;
  studentsSupported: number;
}

export interface IBeneficiaryOverviewStatistics
  extends IOverviewStatisticsBase {
  totalRequests: number;
  pendingRequests: number;
}

export interface IOverviewStatisticsBase {
  totalFundingDisbursed: { labels: string[]; values: number[] };
  fundingDistribution: { labels: string[]; values: number[] };
  fundsDisbursed: number;
  totalFunds: number;
}

export interface IStudentPerformanceRanks {
  student: string;
  totalDisbursement: number;
  school: string;
  level: string;
}

export interface IPerformance {
  studentPerformanceRank: IStudentPerformanceRanks[];
  studentTotalDisbursements: Pagination<IStudentPerformanceRanks[]>;
}
