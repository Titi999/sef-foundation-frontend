import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import {
  authGuard,
  CanActiveAdmin,
  CanActiveBeneficiary,
  CanActiveSuperAdmin,
} from '@app/auth/guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { UserAdministrationComponent } from '@app/dashboard/user-administration/user-administration.component';
import { StudentsComponent } from '@app/dashboard/students/students.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { SettingsComponent } from './settings/settings.component';
import { BudgetAllocationComponent } from '@app/dashboard/finance/budget-allocation/budget-allocation.component';
import { CreateBudgetComponent } from '@app/dashboard/finance/create-budget/create-budget.component';
import { BudgetStatisticsComponent } from '@app/dashboard/finance/budget-statistics/budget-statistics.component';
import { DisbursementComponent } from '@app/dashboard/finance/disbursement/disbursement.component';
import { CreateDisbursementComponent } from '@app/dashboard/finance/create-disbursement/create-disbursement.component';
import { SchoolsComponent } from './schools/schools.component';
import { FinancialReportComponent } from './finance/financial-report/financial-report.component';
import { RequestsComponent } from '@app/dashboard/requests/requests.component';
import { CreateRequestComponent } from '@app/dashboard/requests/create-request/create-request.component';
import { PerformanceComponent } from './performance/performance.component';
import { BudgetComponent } from '@app/dashboard/finance/budget-allocation/budget/budget.component';
import { AcademicComponent } from '@app/dashboard/performance/academic/academic.component';
import { BeneficiaryAcademicsComponent } from '@app/dashboard/performance/beneficiary-academics/beneficiary-academics.component';

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'overview',
        component: HomeComponent,
      },
      {
        path: 'user-administration',
        component: UserAdministrationComponent,
        canActivate: [CanActiveSuperAdmin],
      },
      {
        path: 'students',
        component: StudentsComponent,
        canActivate: [CanActiveAdmin],
      },
      {
        path: 'student-profile/:id',
        component: StudentProfileComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'finance',
        component: BudgetStatisticsComponent,
        canActivate: [CanActiveSuperAdmin],
        children: [
          {
            path: 'budget-allocation',
            component: BudgetAllocationComponent,
          },
          {
            path: 'budget-allocation/:id',
            component: BudgetComponent,
          },
          {
            path: 'create-budget',
            component: CreateBudgetComponent,
          },
          {
            path: 'edit-budget/:id',
            component: CreateBudgetComponent,
          },
          {
            path: 'disbursements',
            component: DisbursementComponent,
          },
          {
            path: 'create-disbursement',
            component: CreateDisbursementComponent,
          },
          {
            path: 'edit-disbursement/:id',
            component: CreateDisbursementComponent,
          },
          {
            path: 'financial-report',
            component: FinancialReportComponent,
          },
        ],
      },
      {
        path: 'schools',
        component: SchoolsComponent,
        canActivate: [CanActiveAdmin],
      },
      {
        path: 'requests',
        component: RequestsComponent,
        canActivate: [CanActiveBeneficiary],
      },
      {
        path: 'create-request',
        component: CreateRequestComponent,
        canActivate: [CanActiveBeneficiary],
      },
      {
        path: 'edit-request/:id',
        component: CreateRequestComponent,
        canActivate: [CanActiveBeneficiary],
      },
      {
        path: 'academic-performance',
        component: BeneficiaryAcademicsComponent,
        canActivate: [CanActiveBeneficiary],
      },
      {
        path: 'performance',
        children: [
          { path: 'financial', component: PerformanceComponent },
          { path: 'academic', component: AcademicComponent },
        ],
        canActivate: [CanActiveAdmin],
      },
    ],
  },
];
