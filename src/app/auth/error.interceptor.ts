import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.error('Unauthorized request:', error);
        } else {
          console.error('HTTP error:', error);
        }
      } else {
        console.log('An error occured', error);
      }
      return throwError(() => error);
    })
  );
};
