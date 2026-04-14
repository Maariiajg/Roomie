import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isLoggedIn() && authService.getUserRole() === 'ADMINISTRADOR') {
    return true;
  }

  // Not logged in or not admin
  notificationService.showError('Acceso denegado: Se requieren permisos de Administrador.');
  return router.parseUrl('/resultados');
};
