import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./components/customer-list.component').then(
        (m) => m.CustomerListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./components/appointment-list.component').then(
        (m) => m.AppointmentListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./components/calendar.component').then(
        (m) => m.CalendarComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    children: [
      {
        path: 'receipts',
        loadComponent: () =>
          import('./components/receipt-list.component').then(
            (m) => m.ReceiptListComponent
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./components/customer-list.component').then(
            (m) => m.CustomerListComponent
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./components/appointment-list.component').then(
            (m) => m.AppointmentListComponent
          ),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./components/calendar.component').then(
            (m) => m.CalendarComponent
          ),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
    canActivate: [adminGuard],
  },
  {
    path: 'user',
    children: [
     
      {
        path: 'calendar',
        loadComponent: () =>
          import('./components/calendar.component').then(
            (m) => m.CalendarComponent
          ),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
    canActivate: [authGuard],
    data: { role: 'ROLE_USER' },
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
