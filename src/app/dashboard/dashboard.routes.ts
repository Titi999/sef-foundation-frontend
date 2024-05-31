import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from '@app/auth/guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { UserAdministrationComponent } from '@app/dashboard/user-administration/user-administration.component';
import { StudentsComponent } from '@app/dashboard/students/students.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { SettingsComponent } from './settings/settings.component';
import { BudgetAllocationComponent } from '@app/dashboard/finance/budget-allocation/budget-allocation.component';
import { CreateBudgetComponent } from '@app/dashboard/finance/create-budget/create-budget.component';
import { BudgetStatisticsComponent } from '@app/dashboard/finance/budget-statistics/budget-statistics.component';

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
      },
      {
        path: 'students',
        component: StudentsComponent,
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
        children: [
          {
            path: 'budget-allocation',
            component: BudgetAllocationComponent,
          },
          {
            path: 'create-budget',
            component: CreateBudgetComponent,
          },
        ],
      },
    ],
  },
];
