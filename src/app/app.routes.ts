import { Routes } from '@angular/router';
import { dashboardRoutes } from './dashboard/dashboard.routes';
import { ForgotPasswordComponent } from '@app/auth/forgot-password/forgot-password.component';
import { LoginComponent } from '@app/auth/login/login.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { VerificationComponent } from '@app/auth/verification/verification.component';
import { CheckEmailComponent } from '@app/auth/check-email/check-email.component';
import { ResetPasswordComponent } from '@app/auth/reset-password/reset-password.component';
import { canActivateAuthPages } from '@app/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [canActivateAuthPages],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [canActivateAuthPages],
  },
  {
    path: 'verification/:id/:encodedEmail',
    component: VerificationComponent,
    canActivate: [canActivateAuthPages],
  },
  {
    path: 'check-email/:encodedEmail',
    component: CheckEmailComponent,
    canActivate: [canActivateAuthPages],
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent,
    canActivate: [canActivateAuthPages],
  },
  ...dashboardRoutes,
  { path: '**', component: NotFoundComponent },
];
