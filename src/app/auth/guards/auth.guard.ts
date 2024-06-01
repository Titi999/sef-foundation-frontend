import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { UserRoles } from '@app/auth/auth.type';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedInUser()) {
    return true;
  } else {
    void router.navigate(['/login']);

    return false;
  }
};

export const canActivateAuthPages: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.loggedInUser()) {
    return true;
  } else {
    void router.navigate(['/dashboard/overview']);
    return false;
  }
};

export const CanActiveAdmin: CanActivateFn = () => {
  const role = inject(AuthService).role;
  const router = inject(Router);
  if (role() === UserRoles.ADMIN || role() === UserRoles.SUPER_ADMIN) {
    return true;
  } else {
    void router.navigate(['/dashboard/overview']);
    return false;
  }
};

export const CanActiveSuperAdmin: CanActivateFn = () => {
  const role = inject(AuthService).role;
  const router = inject(Router);
  if (role() === UserRoles.SUPER_ADMIN) {
    return true;
  } else {
    void router.navigate(['/dashboard/overview']);
    return false;
  }
};
