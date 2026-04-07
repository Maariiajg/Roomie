import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'resultados', 
    loadComponent: () => import('./features/pisos/pisos-feed.component').then(m => m.PisosFeedComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'seleccion-registro', 
    loadComponent: () => import('./features/auth/seleccion-registro/seleccion-registro.component').then(m => m.SeleccionRegistroComponent) 
  },
  { 
    path: 'registro/usuario', 
    loadComponent: () => import('./features/auth/registro/registro.component').then(m => m.RegistroComponent) 
  },
  { 
    path: 'registro/admin', 
    loadComponent: () => import('./features/auth/registro-admin/registro-admin.component').then(m => m.RegistroAdminComponent) 
  },
  { path: '**', redirectTo: '/home' }
];
