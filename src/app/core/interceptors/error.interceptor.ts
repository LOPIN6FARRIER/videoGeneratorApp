import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage =
          error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
      }

      console.error('API Error:', errorMessage);

      // You can add toast notification here
      return throwError(() => new Error(errorMessage));
    }),
  );
};
