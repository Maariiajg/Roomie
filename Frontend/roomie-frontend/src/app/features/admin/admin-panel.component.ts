import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { PerfilUsuarioDTO } from '../../core/models/piso.dto';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain">

      <!-- Hero Admin -->
      <section class="w-full bg-gradient-to-br from-primary via-hover to-secondary py-16 px-6 text-white">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="bg-alert text-textMain text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Modo Admin
                </span>
              </div>
              <h1 class="text-4xl md:text-5xl font-black tracking-tight drop-shadow-xl">Panel de Administración</h1>
              <p class="text-white/70 font-medium mt-2">Gestión global de usuarios y contenido de la plataforma.</p>
            </div>
            <div class="flex gap-4">
              <div class="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 text-center border border-white/20">
                <div class="text-3xl font-black">{{ usuarios.length }}</div>
                <div class="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Usuarios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabla de usuarios -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-black text-textMain">Gestión de Usuarios</h2>
        </div>

        @if (cargando) {
          <div class="flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (usuarios.length === 0) {
          <div class="text-center py-20 text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0
                   0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0
                   11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="font-medium">No se encontraron usuarios.</p>
          </div>
        } @else {
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-bgMain border-b border-gray-100">
                    <th class="text-left px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">ID</th>
                    <th class="text-left px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Usuario</th>
                    <th class="text-left px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Email</th>
                    <th class="text-left px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Rol</th>
                    <th class="text-left px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Estado</th>
                    <th class="text-right px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (usuario of usuarios; track usuario.id) {
                    <tr class="border-b border-gray-50 hover:bg-bgMain/50 transition-colors">
                      <td class="px-6 py-4 font-mono text-gray-400 text-xs">{{ usuario.id }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="text-primary font-black text-xs uppercase">
                              {{ (usuario.nombreUsuario || '?').charAt(0) }}
                            </span>
                          </div>
                          <span class="font-bold text-textMain">{{ usuario.nombreUsuario }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-gray-500">{{ usuario.email }}</td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-black uppercase px-2 py-1 rounded-full"
                          [ngClass]="{
                            'bg-alert/20 text-amber-700':  usuario.rol === 'ADMINISTRADOR',
                            'bg-secondary/10 text-secondary': usuario.rol === 'OWNER',
                            'bg-primary/10 text-primary':  usuario.rol === 'USUARIO'
                          }">
                          {{ usuario.rol || '—' }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="w-2 h-2 rounded-full inline-block mr-2"
                          [class.bg-green-400]="!usuario.bloqueado"
                          [class.bg-red-400]="usuario.bloqueado">
                        </span>
                        <span class="text-xs font-medium"
                          [class.text-green-600]="!usuario.bloqueado"
                          [class.text-red-500]="usuario.bloqueado">
                          {{ usuario.bloqueado ? 'Bloqueado' : 'Activo' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-2">
                          <button
                            [routerLink]="['/usuario', usuario.id]"
                            class="text-xs font-bold px-3 py-1.5 rounded-xl bg-bgMain hover:bg-gray-100 text-gray-600 transition-colors">
                            Ver
                          </button>
                          <button
                            (click)="toggleBloqueo(usuario)"
                            class="text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                            [ngClass]="usuario.bloqueado
                              ? 'bg-green-50 hover:bg-green-100 text-green-700'
                              : 'bg-red-50 hover:bg-red-100 text-red-600'">
                            {{ usuario.bloqueado ? 'Desbloquear' : 'Bloquear' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </section>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  private authService        = inject(AuthService);
  private usuarioService     = inject(UsuarioService);
  private notificationService = inject(NotificationService);
  private router             = inject(Router);

  usuarios: PerfilUsuarioDTO[] = [];
  cargando = true;

  ngOnInit(): void {
    if (this.authService.role() !== 'ADMINISTRADOR') {
      this.router.navigate(['/home']);
      return;
    }
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (data: PerfilUsuarioDTO[]) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar los usuarios.');
        this.cargando = false;
      }
    });
  }

  toggleBloqueo(usuario: PerfilUsuarioDTO): void {
    const accion$ = usuario.bloqueado
      ? this.usuarioService.desbloquearUsuario(usuario.id)
      : this.usuarioService.bloquearUsuario(usuario.id);

    accion$.subscribe({
      next: (updated: PerfilUsuarioDTO) => {
        const idx = this.usuarios.findIndex(u => u.id === usuario.id);
        if (idx > -1) this.usuarios[idx] = updated;
        this.notificationService.showSuccess(
          usuario.bloqueado ? 'Usuario desbloqueado.' : 'Usuario bloqueado.'
        );
      },
      error: () => this.notificationService.showError('No se pudo cambiar el estado del usuario.')
    });
  }
}
