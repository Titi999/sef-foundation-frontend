import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from '../guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { UserAdministrationComponent } from '@app/dashboard/user-administration/user-administration.component';

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
    ],
  },
];
