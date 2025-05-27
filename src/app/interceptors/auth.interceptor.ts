import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  
  // Skip auth for login/register endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Solo aggiungere token se siamo nel browser
  if (storageService.isAvailable) {
    const accessToken = authService.getAccessToken();
    
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh-token') && storageService.isAvailable) {
        return refreshTokenAndRetry(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function refreshTokenAndRetry(
  req: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authService: AuthService
) {
  const refreshToken = authService.getRefreshToken();
  
  if (!refreshToken) {
    authService.logout();
    return throwError(() => new Error('No refresh token available'));
  }

  return authService.refreshToken().pipe(
    switchMap(() => {
      const newAccessToken = authService.getAccessToken();
      if (newAccessToken) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${newAccessToken}` }
        });
      }
      return next(req);
    }),
    catchError((error) => {
      authService.logout();
      return throwError(() => error);
    })
  );
}
