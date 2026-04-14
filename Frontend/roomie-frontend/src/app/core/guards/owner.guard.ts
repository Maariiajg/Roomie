import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';

export const ownerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const role = authService.getUserRole();

  if (authService.isLoggedIn() && (role === 'OWNER' || role === 'ADMINISTRADOR')) {
    return true;
  }

  notificationService.showError('Acceso denegado: Se requieren permisos de Propietario.');
  return router.parseUrl('/resultados');
};
