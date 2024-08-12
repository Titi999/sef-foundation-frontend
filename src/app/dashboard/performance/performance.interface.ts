import { Pagination } from '@app/shared/shared.type';
import { Terms } from '@app/libs/constants';

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

export interface CreateAcademics {
  course: string;
  score: string;
  term: Terms;
  year: string;
  remarks: string;
}

export interface BeneficiaryAcademicPerformance extends CreateAcademics {
  id: string;
  grade: string;
  createdAt: Date;
  updatedAt: Date;
}

export type performanceFormControls =
  | 'course'
  | 'score'
  | 'term'
  | 'year'
  | 'remarks';
