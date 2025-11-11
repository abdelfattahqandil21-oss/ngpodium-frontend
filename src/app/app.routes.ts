import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  }
];
