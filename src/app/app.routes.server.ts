import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static pages - Prerender for best performance
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  
  // Dynamic pages - Server-side render
  {
    path: 'post/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile/**',
    renderMode: RenderMode.Server
  },
  
  // Authenticated pages - Client-side render
  {
    path: 'write-post',
    renderMode: RenderMode.Client
  },
  {
    path: 'profile/edit',
    renderMode: RenderMode.Client
  },
  {
    path: 'post/*/edit',
    renderMode: RenderMode.Client
  },
  {
    path: 'my-posts',
    renderMode: RenderMode.Client
  },
  
  // Fallback
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
