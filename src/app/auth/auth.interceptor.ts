import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthService).loggedInUser()?.accessToken;

  if (authToken) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

const handle401Error = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  if (!authService.isRefreshing()) {
    authService.isRefreshing.set(true);
    return authService.refreshToken().pipe(
      map(response =>
        authService.exchangeAccessToken(response.data.accessToken)
      ),
      switchMap(() => {
        authService.isRefreshing.set(false);
        return next(request);
      }),
      catchError((error: HttpErrorResponse) => {
        authService.isRefreshing.set(false);
        if (error.status === 403) {
          authService.logoutSession();
        }

        return throwError(() => error);
      })
    );
  }
  return next(request);
};
