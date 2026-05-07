import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Redirección raíz
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Página principal pública
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Resultados / Buscador
  {
    path: 'resultados',
    loadComponent: () => import('./features/pisos/pisos-feed.component').then(m => m.PisosFeedComponent)
  },

  // Detalle de piso (sin layout global — se oculta en app.ts)
  {
    path: 'piso/:id',
    loadComponent: () => import('./features/pisos/piso-detalle.component').then(m => m.PisoDetalleComponent)
  },

  // Auth
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

  // Perfil de usuario (requiere autenticación)
  {
    path: 'usuario/:id',
    loadComponent: () => import('./features/usuario/perfil-usuario.component').then(m => m.PerfilUsuarioComponent),
    canActivate: [authGuard]
  },

  // Alias para perfiles de usuario
  {
    path: 'perfil/:id',
    loadComponent: () => import('./features/usuario/perfil-usuario.component').then(m => m.PerfilUsuarioComponent),
    canActivate: [authGuard]
  },

  // Mi Perfil — alias que redirige al perfil del usuario autenticado
  {
    path: 'mi-perfil',
    loadComponent: () => import('./features/usuario/perfil-usuario.component').then(m => m.PerfilUsuarioComponent),
    canActivate: [authGuard]
  },

  // Mis Alquileres (requiere autenticación)
  {
    path: 'mis-alquileres',
    loadComponent: () => import('./features/usuario/mis-alquileres.component').then(m => m.MisAlquileresComponent),
    canActivate: [authGuard]
  },

  // Mis favoritos
  {
    path: 'mis-favoritos',
    loadComponent: () => import('./features/usuario/mis-favoritos.component').then(m => m.MisFavoritosComponent),
    canActivate: [authGuard]
  },

  // GESTIÓN DE MI PISO (Solo Propietarios - NUEVA RUTA)
  {
    path: 'mi-piso',
    loadComponent: () => import('./features/piso/mi-piso.component').then(m => m.MiPisoComponent),
    canActivate: [authGuard]
  },

  // Panel de Administración (requiere rol ADMINISTRADOR)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/admin-usuarios.component').then(m => m.AdminUsuariosComponent)
      },
      {
        path: 'pisos',
        loadComponent: () => import('./features/admin/admin-pisos.component').then(m => m.AdminPisosComponent)
      },
      {
        path: 'feedbacks',
        loadComponent: () => import('./features/admin/admin-feedbacks.component').then(m => m.AdminFeedbacksComponent)
      },
      {
        path: 'administradores',
        loadComponent: () => import('./features/admin/admin-administradores.component').then(m => m.AdminAdministradoresComponent)
      },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/home' }
];