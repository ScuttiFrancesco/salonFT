import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storageService = inject(StorageService);

  // Se non siamo nel browser, permetti l'accesso (sarà gestito lato client)
  if (!storageService.isAvailable) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data['role'] as string;
  const userRole = authService.userRole();

  if (requiredRole && userRole !== requiredRole) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storageService = inject(StorageService);

  // Se non siamo nel browser, permetti l'accesso (sarà gestito lato client)
  if (!storageService.isAvailable) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
