import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home.component').then((m) => m.HomeComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'customer-list',
    loadComponent: () =>
      import('./components/customer-list.component').then(
        (m) => m.CustomerListComponent
      ),
  },
  {
    path: 'appointment-list',
    loadComponent: () =>
      import('./components/appointment-list.component').then(
        (m) => m.AppointmentListComponent
      ),
  },
];
