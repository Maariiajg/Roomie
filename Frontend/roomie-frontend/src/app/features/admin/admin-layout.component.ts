import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="flex min-h-screen bg-bgMain font-sans">

      <!-- ══════════════════════════════════
           SIDEBAR
      ══════════════════════════════════ -->
      <aside class="fixed top-0 left-0 h-full w-64 bg-textMain flex flex-col z-40 shadow-2xl">

        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"/>
            </svg>
          </div>
          <span class="text-white font-black text-lg tracking-tight">Roomie</span>
          <span class="ml-auto text-[9px] bg-alert text-textMain font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto">

          <!-- Dashboard -->
          <a routerLink="/admin" routerLinkActive="bg-primary/20 text-primary"
             [routerLinkActiveOptions]="{ exact: true }"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group cursor-pointer">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"/>
            </svg>
            <span class="text-sm font-bold">Dashboard</span>
          </a>

          <!-- Usuarios -->
          <a routerLink="/admin/usuarios" routerLinkActive="bg-primary/20 text-primary"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group cursor-pointer">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="text-sm font-bold">Usuarios</span>
          </a>

          <!-- Pisos -->
          <a routerLink="/admin/pisos" routerLinkActive="bg-primary/20 text-primary"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group cursor-pointer">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="text-sm font-bold">Pisos</span>
          </a>

          <!-- Feedbacks -->
          <a routerLink="/admin/feedbacks" routerLinkActive="bg-primary/20 text-primary"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group cursor-pointer">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <span class="text-sm font-bold">Feedbacks</span>
          </a>

          <!-- Administradores (con badge) -->
          <a routerLink="/admin/administradores" routerLinkActive="bg-primary/20 text-primary"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group cursor-pointer">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span class="text-sm font-bold flex-1">Administradores</span>
            @if (pendingCount() > 0) {
              <span class="bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                {{ pendingCount() }}
              </span>
            }
          </a>

          <!-- Separador -->
          <div class="my-4 border-t border-white/10"></div>

          <!-- Mi Perfil -->
          <a routerLink="/mi-perfil"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group cursor-pointer">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-bold">Mi Perfil</span>
          </a>

        </nav>

        <!-- User info + Logout -->
        <div class="px-3 py-4 border-t border-white/10">
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
            <div class="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
              <span class="text-primary font-black text-xs uppercase">
                {{ (authService.username() || '?').charAt(0) }}
              </span>
            </div>
            <div class="min-w-0">
              <div class="text-white text-xs font-black truncate">{{ authService.username() }}</div>
              <div class="text-gray-500 text-[10px] uppercase tracking-widest">Administrador</div>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-all">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      <!-- ══════════════════════════════════
           ÁREA DE CONTENIDO PRINCIPAL
      ══════════════════════════════════ -->
      <main class="ml-64 flex-1 min-h-screen overflow-y-auto">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styles: []
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  pendingCount = signal(0);

  ngOnInit(): void {
    this.loadPendingCount();
  }

  loadPendingCount(): void {
    this.adminService.getSolicitudesAdmin().subscribe({
      next: (solicitudes) => this.pendingCount.set(solicitudes.length),
      error: () => this.pendingCount.set(0)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
