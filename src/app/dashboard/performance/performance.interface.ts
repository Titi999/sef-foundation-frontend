import { Pagination } from '@app/shared/shared.type';

export interface AcademicPerformance {
  averageScore: string;
  grade: string;
  school: string;
  studentId: string;
  studentName: string;
  totalActualScore: string;
  totalCourses: string;
  totalScore: string;
}

export interface AcademicPerformanceWithRanks {
  performanceRank: AcademicPerformance[];
  academicPerformance: Pagination<AcademicPerformance[]>;
}
