import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';

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
