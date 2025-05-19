import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

// Registra il locale italiano a livello globale
registerLocaleData(localeIt);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
