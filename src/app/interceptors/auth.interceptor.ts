import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

let isRefreshing = false; // Flag per evitare refresh multipli

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

  // Verifica se l'utente è effettivamente autenticato
  if (!authService.isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    authService.logout();
    return throwError(() => new Error('User not authenticated'));
  }

  // Aggiungi token a tutte le richieste (eccetto auth)
  if (storageService.isAvailable) {
    const token = authService.getAccessToken();
    
    if (!token) {
      console.warn('No access token available despite being authenticated');
      authService.logout();
      return throwError(() => new Error('No access token'));
    }

    // Verifica se il token è scaduto prima di inviare la richiesta
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      console.log('Token expires in:', timeUntilExpiry, 'seconds');
      
      // Se il token è già scaduto, tenta refresh preventivo solo se abbiamo refresh token
      if (timeUntilExpiry <= 0 && !isRefreshing) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          console.log('Token is expired, attempting preemptive refresh');
          return attemptRefreshAndRetry(req, next, authService, router);
        } else {
          console.log('Token expired and no refresh token, logging out');
          authService.logout();
          return throwError(() => new Error('Token expired and no refresh token'));
        }
      }
      
      // Se il token scade tra meno di 30 secondi, tenta il refresh preventivo
      if (timeUntilExpiry < 30 && timeUntilExpiry > 0 && !isRefreshing) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          console.log('Token is about to expire, attempting preemptive refresh');
          return attemptRefreshAndRetry(req, next, authService, router);
        }
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      authService.logout();
      return throwError(() => new Error('Invalid token format'));
    }
    
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Added access token to request:', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Interceptor caught error:', error.status, 'for URL:', req.url);
      
      // Se ricevi 401/403, prova il refresh solo se abbiamo un refresh token
      if ((error.status === 401 || error.status === 403) && 
          !req.url.includes('/auth/refresh-token') && 
          !isRefreshing) {
        
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          console.log('Received 401/403, attempting token refresh');
          return attemptRefreshAndRetry(req, next, authService, router);
        } else {
          console.log('Received 401/403 but no refresh token, logging out');
          authService.logout();
          return throwError(() => new Error('Authentication failed'));
        }
      }
      
      return throwError(() => error);
    })
  );
};

function attemptRefreshAndRetry(
  req: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authService: AuthService,
  router: Router
) {
  console.log('Attempting token refresh and retry for:', req.url);
  
  // Verifica che esista un refresh token prima di procedere
  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    console.error('No refresh token available - redirecting to login');
    authService.logout();
    return throwError(() => new Error('No refresh token available'));
  }
  
  // Imposta il flag per evitare refresh multipli
  isRefreshing = true;
  
  return authService.refreshToken().pipe(
    switchMap(() => {
      console.log('Token refresh successful, retrying original request');
      isRefreshing = false;
      
      const newToken = authService.getAccessToken();
      if (newToken) {
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        console.log('Retrying request with new token:', newReq.url);
        return next(newReq);
      } else {
        console.error('No new token available after refresh');
        authService.logout();
        return throwError(() => new Error('No token after refresh'));
      }
    }),
    catchError((refreshError) => {
      console.error('Token refresh failed:', refreshError);
      isRefreshing = false;
      
      authService.logout();
      return throwError(() => new Error('Session expired'));
    })
  );
}
