import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

const isRefreshing = new BehaviorSubject<boolean>(false);
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastrService = inject(ToastrService);
  let authToken = authService.accessToken();

  if (authToken) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          //TODO: for some reason catchError in refreshToken does not work. This is a temporary fix till a solution is found
          if (error.url?.endsWith('authentication/refresh-token')) {
            isRefreshing.next(false);
            toastrService.info('Your session has expired, Log in to continue');
            authService.logoutSession();
          }
          if (!isRefreshing.value) {
            isRefreshing.next(true);
            return authService.refreshToken().pipe(
              switchMap(response => {
                authToken = response.data.accessToken;
                authService.exchangeAccessToken(authToken);
                isRefreshing.next(false);
                const updateRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${authToken}`,
                  },
                });
                return next(updateRequest);
              }),
              catchError(refreshError => {
                isRefreshing.next(false);
                toastrService.info(
                  'Your session has expired, Log in to continue'
                );
                authService.logoutSession();
                return throwError(() => refreshError);
              })
            );
          } else {
            return isRefreshing.pipe(
              filter(value => !value),
              take(1),
              switchMap(() => {
                authToken = authService.accessToken(); // get the latest token
                const updateRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${authToken}`,
                  },
                });
                return next(updateRequest);
              })
            );
          }
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
