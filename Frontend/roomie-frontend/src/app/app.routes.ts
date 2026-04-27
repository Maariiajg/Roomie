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
  }, // <-- ¡ESTA COMA ES LA QUE SEGURAMENTE FALTA!

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

  // Mi Perfil — alias que redirige al perfil del usuario autenticado
  // La redirección dinámica se maneja dentro del componente, usando authService.userId()
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
