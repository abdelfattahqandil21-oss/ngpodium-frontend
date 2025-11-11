import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'write-post',
    loadComponent: () => import('./components/write-post-page.component').then((m) => m.WritePostPageComponent),
  },
  {
    path: 'post/:slug/edit',
    loadComponent: () => import('./components/write-post-page.component').then((m) => m.WritePostPageComponent),
  },
  {
    path: 'post/:slug',
    loadComponent: () => import('./pages/post-detail/post-detail.component').then((m) => m.PostDetailComponent),
  },
  {
    path: 'my-posts',
    loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
  },
];
