import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.accessToken();
  const toastrService = inject(ToastrService);

  if (authToken) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (!authService.isRefreshing()) {
            authService.isRefreshing.set(true);
            return authService.refreshToken().pipe(
              map(response => {
                authService.exchangeAccessToken(response.data.accessToken);
                return response.data.accessToken;
              }),
              switchMap(newToken => {
                authService.isRefreshing.set(false);
                const updateRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                });
                return next(updateRequest);
              }),
              catchError((error: HttpErrorResponse) => {
                authService.isRefreshing.set(false);
                toastrService.info(
                  'Your session has expired, Log in to continue'
                );
                authService.logoutSession();
                return throwError(() => error);
              })
            );
          }
          return next(req);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
