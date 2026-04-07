import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Para evitar la dependencia circular con HttpClient, usamos localStorage directamente
  const token = localStorage.getItem('token');

  // Excluir endpoints públicos
  if (req.url.includes('/login') || req.url.includes('/registro')) {
    return next(req);
  }

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  return next(req);
};
