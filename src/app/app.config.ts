import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth.interceptor';
import { registerResponseInterceptor } from './interceptors/register-response.interceptor';

import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

// Registra i dati del locale italiano a livello globale
registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, registerResponseInterceptor]), withFetch()),
    { provide: LOCALE_ID, useValue: 'it-IT' } // Fornisce il LOCALE_ID globalmente
  ],
};
