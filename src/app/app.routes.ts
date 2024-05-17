import { Routes } from '@angular/router';
import { dashboardRoutes } from './dashboard/dashboard.routes';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { VerificationComponent } from './verification/verification.component';
import { CheckEmailComponent } from '@app/check-email/check-email.component';
import { ResetPasswordComponent } from '@app/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'verification/:id/:encodedEmail',
    component: VerificationComponent,
  },
  { path: 'check-email/:encodedEmail', component: CheckEmailComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  ...dashboardRoutes,
  { path: '**', component: NotFoundComponent },
];
