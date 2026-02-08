import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

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

        // Handle authentication errors
        if (error.status === 401) {
          // Unauthorized - redirect to login
          console.warn('Unauthorized access - redirecting to login');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - insufficient permissions
          console.warn('Insufficient permissions');
          errorMessage = 'You do not have permission to access this resource';
        }
      }

      console.error('API Error:', errorMessage);

      // You can add toast notification here
      return throwError(() => new Error(errorMessage));
    }),
  );
};
