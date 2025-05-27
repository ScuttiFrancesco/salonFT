import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  // Skip auth completamente per tutti gli endpoint di autenticazione
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh-token')) {
    console.log('Skipping interceptor completely for auth endpoint:', req.url);
    return next(req);
  }

  // Aggiungi token a tutte le richieste (eccetto auth)
  if (storageService.isAvailable) {
    const token = authService.getAccessToken();
    if (token) {
      // Verifica se il token è scaduto prima di inviare la richiesta
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = payload.exp - currentTime;
        
        console.log('Token expires in:', timeUntilExpiry, 'seconds');
        
        // Se il token scade tra meno di 30 secondi, tenta il refresh preventivo
        if (timeUntilExpiry < 30) {
          console.log('Token is about to expire, attempting preemptive refresh');
          return attemptRefreshAndRetry(req, next, authService);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
      
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Added access token to request:', req.url);
    } else {
      console.warn('No access token available');
      authService.logout();
      return throwError(() => new Error('No access token'));
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Interceptor caught error:', error.status, 'for URL:', req.url);
      console.log('Error details:', error.error);
      
      // Se ricevi 401/403, prova il refresh
      if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/refresh-token')) {
        console.log('Received 401/403, attempting token refresh');
        return attemptRefreshAndRetry(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function attemptRefreshAndRetry(
  req: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authService: AuthService
) {
  console.log('Attempting token refresh and retry for:', req.url);
  
  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    console.error('No refresh token available');
    authService.logout();
    return throwError(() => new Error('No refresh token'));
  }
  
  return authService.refreshToken().pipe(
    switchMap(() => {
      console.log('Token refresh successful, retrying original request');
      // Riprova la richiesta originale con il nuovo token
      const newToken = authService.getAccessToken();
      if (newToken) {
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        console.log('Retrying request with new token:', newReq.url);
        console.log('New token (first 20 chars):', newToken.substring(0, 20) + '...');
        return next(newReq);
      } else {
        console.error('No new token available after refresh');
        authService.logout();
        return throwError(() => new Error('No token after refresh'));
      }
    }),
    catchError((refreshError) => {
      console.error('Token refresh failed:', refreshError);
      console.error('Refresh error status:', refreshError.status);
      console.error('Refresh error details:', refreshError.error);
      
      // Se il refresh fallisce, logout
      authService.logout();
      return throwError(() => new Error('Session expired'));
    })
  );
}
