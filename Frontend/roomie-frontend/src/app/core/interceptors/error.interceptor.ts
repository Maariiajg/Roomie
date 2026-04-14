import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/components/toast/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 is handled by auth.interceptor specifically
      if (error.status && error.status !== 401) { 
        // Fallback standard error messages
        let errorMsg = 'Ha ocurrido un error inesperado.';

        if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }

        notificationService.showError(`Error ${error.status}: ${errorMsg}`);
      }

      return throwError(() => error);
    })
  );
};
