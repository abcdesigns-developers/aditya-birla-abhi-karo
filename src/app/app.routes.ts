import { Routes } from '@angular/router';

// Every page is lazy-loaded: its code downloads only when the user visits it.
export const routes: Routes = [
  {
    path: '',
    title: 'Abhi Karo | Aditya Birla Health Insurance',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '**',
    title: 'Page not found | Abhi Karo',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];