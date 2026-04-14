import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const http = inject(HttpClient);
  const notificationService = inject(NotificationService);
  const token = authService.accessToken();

  // Excluir endpoints de auth de la interceptación para evitar bucles o manipular los tokens de forma extraña
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  let authReq = req;
  const isValidToken = token && token !== 'null' && token !== 'undefined';
  
  if (isValidToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejar el 401 (Unauthorized) intentando refrescar el token
      if (error.status === 401 && authService.refreshToken()) {
        const backendUrl = ''; // proxy
        const refreshReq = { refresh: authService.refreshToken() };

        return http.post<any>(`${backendUrl}/auth/refresh`, refreshReq).pipe(
          switchMap((response) => {
            // Refresco exitoso
            authService.updateTokens(response.access, response.refresh);
            
            // Reintentar la petición original con el nuevo token
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${response.access}`)
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // Si el refresco también falla, cerrar sesión
            notificationService.showError('Sesión expirada. Por favor identifícate de nuevo.');
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      } else if (error.status === 401) {
        // Falló sin tener refreshToken, así que limpiamente logout
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
