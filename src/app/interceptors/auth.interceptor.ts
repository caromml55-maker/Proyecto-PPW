import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Solo interceptar requests al backend Jakarta, pero excluir la validación de token
  if (!req.url.includes('localhost:8080') || req.url.includes('/auth/validate-token')) {
    return next(req);
  }

  // Obtener token actual y agregarlo al header
  return from(authService.getCurrentToken()).pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      } else {
        // Si no hay token, continuar sin header
        return next(req);
      }
    })
  );
};