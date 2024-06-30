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
  fundsRequest: number;
  fundsDeclined: number;
}

export interface IOverviewStatisticsBase {
  totalFundingDisbursed: IMonthTotal[];
  fundingDistribution: ITitleAmount[];
  fundsDisbursed: number;
}

export interface IMonthTotal {
  month: string;
  total: number;
}

export interface ITitleAmount {
  title: string;
  amount: number;
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
