import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { PerfilUsuarioDTO } from '../../core/models/piso.dto';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-8 min-h-screen bg-bgMain">

      <!-- ─── Page Header ─── -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <span class="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Administración
          </span>
        </div>
        <h1 class="text-3xl font-black text-textMain tracking-tight">Gestión de Usuarios</h1>
        <p class="text-gray-400 text-sm mt-1 font-medium">
          {{ cargando() ? 'Cargando...' : (totalUsuarios() + ' usuarios registrados en la plataforma') }}
        </p>
      </div>

      <!-- ─── Search + Stats bar ─── -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Buscar por nombre, usuario o email..."
            class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
                   font-medium text-textMain placeholder:text-gray-300 focus:outline-none
                   focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
          />
          @if (searchTerm) {
            <button (click)="searchTerm = ''"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>
        <div class="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm text-sm text-gray-500 font-medium">
          <span class="w-2 h-2 bg-primary rounded-full"></span>
          {{ filteredUsuarios().length }} resultado{{ filteredUsuarios().length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- ─── Loading ─── -->
      @if (cargando()) {
        <div class="flex flex-col items-center justify-center py-32 gap-4">
          <div class="relative">
            <div class="w-14 h-14 border-4 border-primary/20 rounded-full"></div>
            <div class="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p class="text-gray-400 font-medium text-sm">Cargando usuarios...</p>
        </div>
      }

      <!-- ─── Error ─── -->
      @if (!cargando() && errorMsg()) {
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 mb-6">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-black text-red-700 text-sm">{{ errorMsg() }}</p>
            <button (click)="cargar()"
              class="mt-2 text-xs font-black text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      }

      <!-- ─── Table ─── -->
      @if (!cargando() && !errorMsg()) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-bgMain border-b border-gray-100">
                  <th class="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
                  <th class="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden md:table-cell">Nombre Real</th>
                  <th class="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Rol</th>
                  <th class="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden lg:table-cell">Valoración</th>
                  <th class="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                  <th class="text-right px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @if (filteredUsuarios().length === 0) {
                  <tr>
                    <td colspan="6" class="px-5 py-16 text-center text-gray-400">
                      <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <p class="font-medium text-sm">No se encontraron usuarios</p>
                    </td>
                  </tr>
                }
                @for (u of filteredUsuarios(); track u.id) {
                  <tr class="hover:bg-bgMain/60 transition-colors">

                    <!-- Avatar + @usuario -->
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">
                        <div class="relative flex-shrink-0">
                          <img
                            [src]="getAvatar(u)"
                            [alt]="u.nombreUsuario"
                            class="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                            (error)="onAvatarError($event, u)"
                          />
                          <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                                [class.bg-green-400]="!u.bloqueado"
                                [class.bg-red-400]="u.bloqueado"></span>
                        </div>
                        <div class="min-w-0">
                          <div class="font-black text-textMain text-xs">&#64;{{ u.nombreUsuario }}</div>
                          <div class="text-gray-400 text-[10px] truncate max-w-[120px]">{{ u.email }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Nombre real -->
                    <td class="px-5 py-4 hidden md:table-cell">
                      <span class="font-medium text-textMain text-xs">{{ u.nombre }} {{ u.apellido1 }}</span>
                    </td>

                    <!-- Rol badge -->
                    <td class="px-5 py-4">
                      <span class="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                            [ngClass]="getRolClasses(u.rol)">
                        {{ u.rol || 'USUARIO' }}
                      </span>
                    </td>

                    <!-- Valoración (estrellas) -->
                    <td class="px-5 py-4 hidden lg:table-cell">
                      <div class="flex items-center gap-0.5">
                        @for (star of getStars(u); track $index) {
                          <svg class="w-3.5 h-3.5"
                               [class.text-alert]="star === 'full'"
                               [class.text-gray-200]="star === 'empty'"
                               fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        }
                        <span class="text-[10px] text-gray-400 font-medium ml-1">
                          {{ (u as any).calificacion != null ? ((u as any).calificacion | number:'1.1-1') : 'N/A' }}
                        </span>
                      </div>
                    </td>

                    <!-- Estado badge -->
                    <td class="px-5 py-4">
                      <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                            [class.bg-green-50]="!u.bloqueado" [class.text-green-700]="!u.bloqueado"
                            [class.bg-red-50]="u.bloqueado"   [class.text-red-600]="u.bloqueado">
                        <span class="w-1.5 h-1.5 rounded-full"
                              [class.bg-green-400]="!u.bloqueado"
                              [class.bg-red-400]="u.bloqueado"></span>
                        {{ u.bloqueado ? 'Bloqueado' : 'Activo' }}
                      </span>
                    </td>

                    <!-- Acciones -->
                    <td class="px-5 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <a [routerLink]="['/usuario', u.id]"
                           class="text-[10px] font-black px-3 py-1.5 rounded-xl bg-bgMain hover:bg-gray-100
                                  text-gray-600 transition-colors whitespace-nowrap">
                          Ver perfil
                        </a>
                        <button
                          (click)="toggleBloqueo(u)"
                          [disabled]="accionEnCurso() === u.id"
                          class="text-[10px] font-black px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                          [ngClass]="u.bloqueado
                            ? 'bg-green-50 hover:bg-green-100 text-green-700'
                            : 'bg-red-50 hover:bg-red-100 text-red-600'">
                          @if (accionEnCurso() === u.id) {
                            <span class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          } @else {
                            {{ u.bloqueado ? 'Desbloquear' : 'Bloquear' }}
                          }
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

    </div>
  `,
  styles: []
})
export class AdminUsuariosComponent implements OnInit {
  private usuarioService     = inject(UsuarioService);
  private notificationService = inject(NotificationService);

  usuarios     = signal<PerfilUsuarioDTO[]>([]);
  cargando     = signal(true);
  errorMsg     = signal<string | null>(null);
  accionEnCurso = signal<number | null>(null);
  searchTerm   = '';

  totalUsuarios = computed(() => this.usuarios().length);

  filteredUsuarios = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.usuarios();
    return this.usuarios().filter(u =>
      (u.nombre        || '').toLowerCase().includes(term) ||
      (u.nombreUsuario || '').toLowerCase().includes(term) ||
      (u.email         || '').toLowerCase().includes(term) ||
      (u.apellido1     || '').toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorMsg.set(null);
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar la lista de usuarios. Verifica tu conexión.');
        this.cargando.set(false);
      }
    });
  }

  toggleBloqueo(usuario: PerfilUsuarioDTO): void {
    this.accionEnCurso.set(usuario.id);
    const accion$ = usuario.bloqueado
      ? this.usuarioService.desbloquearUsuario(usuario.id)
      : this.usuarioService.bloquearUsuario(usuario.id);

    accion$.subscribe({
      next: (updated) => {
        this.usuarios.update(list =>
          list.map(u => u.id === usuario.id ? updated : u)
        );
        this.notificationService.showSuccess(
          usuario.bloqueado ? `Usuario @${usuario.nombreUsuario} desbloqueado.` : `Usuario @${usuario.nombreUsuario} bloqueado.`
        );
        this.accionEnCurso.set(null);
      },
      error: () => {
        this.notificationService.showError('No se pudo cambiar el estado del usuario.');
        this.accionEnCurso.set(null);
      }
    });
  }

  getAvatar(u: PerfilUsuarioDTO): string {
    if (u.foto && u.foto.startsWith('http')) return u.foto;
    const seed = encodeURIComponent(u.nombreUsuario || u.id.toString());
    return `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  onAvatarError(event: Event, u: PerfilUsuarioDTO): void {
    const seed = encodeURIComponent(u.nombreUsuario || u.id.toString());
    (event.target as HTMLImageElement).src =
      `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4`;
  }

  getRolClasses(rol?: string): Record<string, boolean> {
    return {
      'bg-primary/10 text-primary': rol === 'OWNER',
      'bg-gray-100 text-gray-500':  !rol || rol === 'USUARIO',
    };
  }

  getStars(u: PerfilUsuarioDTO): string[] {
    const rating = (u as any).calificacion ?? 0;
    const full  = Math.round(rating);
    const stars: string[] = [];
    for (let i = 0; i < 5; i++) stars.push(i < full ? 'full' : 'empty');
    return stars;
  }
}
