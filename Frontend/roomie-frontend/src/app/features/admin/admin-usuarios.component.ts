import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
// import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-8 min-h-screen bg-bgMain">

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Administración
            </span>
          </div>
          <h1 class="text-3xl font-black text-textMain tracking-tight">Gestión de Usuarios</h1>
          <p class="text-gray-400 text-sm mt-1 font-medium">Gestiona y modera las cuentas de la plataforma</p>
        </div>

        <div class="relative w-full md:w-80">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input 
            type="text" 
            [ngModel]="searchTerm()" 
            (ngModelChange)="searchTerm.set($event)"
            placeholder="Buscar por nombre, @usuario o email..." 
            class="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
          >
        </div>
      </div>

      @if (cargando()) {
        <div class="flex flex-col items-center justify-center py-32 gap-4">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p class="text-gray-400 font-medium text-sm">Cargando usuarios...</p>
        </div>
      }

      @if (!cargando() && errorCarga()) {
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 mb-8">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <h3 class="font-black text-red-700 text-sm">Error al cargar la lista</h3>
            <p class="text-red-500 text-sm mt-0.5">{{ errorCarga() }}</p>
            <button (click)="loadUsuarios()" class="mt-3 text-xs font-black text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors">Reintentar</button>
          </div>
        </div>
      }

      @if (!cargando() && !errorCarga()) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          @if (filteredUsuarios().length === 0) {
            <div class="flex flex-col items-center py-20 text-gray-300">
              <svg class="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p class="text-sm font-medium text-gray-400">No se encontraron usuarios con esos criterios.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="bg-gray-50/50 border-b border-gray-100">
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contacto</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Rol</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Calificación</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Estado</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (user of filteredUsuarios(); track user.id) {
                    <tr class="hover:bg-bgMain/40 transition-colors" [class.opacity-50]="user.id === procesandoId()">
                      
                      <td class="px-6 py-4">
                        <a [routerLink]="['/perfil', user.id]" class="flex items-center gap-4 group cursor-pointer">
                          <img [src]="user.foto || getDiceBearAvatar(user.nombreUsuario)" 
                               alt="Avatar" 
                               class="w-10 h-10 rounded-full border border-gray-100 object-cover shadow-sm group-hover:ring-2 ring-primary/50 transition-all">
                          <div>
                            <div class="font-bold text-textMain text-sm group-hover:text-primary transition-colors">{{ user.nombre }} {{ user.apellido1 }}</div>
                            <div class="text-gray-400 text-[11px] font-mono mt-0.5">&#64;{{ user.nombreUsuario }}</div>
                          </div>
                        </a>
                      </td>

                      <td class="px-6 py-4">
                        <div class="text-xs text-textMain font-medium">{{ user.email }}</div>
                      </td>

                      <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                              [ngClass]="user.rol === 'OWNER' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'">
                          {{ user.rol }}
                        </span>
                      </td>

                      <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-1 text-alert">
                          <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span class="text-textMain font-bold text-xs">{{ user.calificacionMedia || 'N/A' }}</span>
                        </div>
                      </td>

                      <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                              [ngClass]="user.bloqueado ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'">
                          <span class="w-1.5 h-1.5 rounded-full inline-block" [ngClass]="user.bloqueado ? 'bg-red-500' : 'bg-green-500'"></span>
                          {{ user.bloqueado ? 'Bloqueado' : 'Activo' }}
                        </span>
                      </td>

                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <a [routerLink]="['/perfil', user.id]" 
                             class="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors cursor-pointer"
                             title="Ver perfil completo">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </a>

                          <button (click)="toggleBloqueo(user)"
                                  [disabled]="procesandoId() === user.id"
                                  class="p-2 rounded-xl transition-colors"
                                  [ngClass]="user.bloqueado ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'"
                                  [title]="user.bloqueado ? 'Desbloquear usuario' : 'Bloquear usuario'">
                            
                            @if (procesandoId() === user.id) {
                              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            } @else {
                              @if (user.bloqueado) {
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                                </svg>
                              } @else {
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                              }
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class AdminUsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  // private notificationService = inject(NotificationService);

  usuarios = signal<any[]>([]);
  cargando = signal<boolean>(true);
  errorCarga = signal<string | null>(null);
  searchTerm = signal<string>('');
  procesandoId = signal<number | null>(null);

  filteredUsuarios = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.usuarios();

    return this.usuarios().filter(u =>
      (u.nombre?.toLowerCase() || '').includes(term) ||
      (u.nombreUsuario?.toLowerCase() || '').includes(term) ||
      (u.email?.toLowerCase() || '').includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.errorCarga.set('No se pudo establecer conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  getDiceBearAvatar(username: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'default'}`;
  }

  toggleBloqueo(user: any): void {
    if (this.procesandoId() === user.id) return;

    this.procesandoId.set(user.id);
    const peticion$ = user.bloqueado
      ? this.usuarioService.desbloquearUsuario(user.id)
      : this.usuarioService.bloquearUsuario(user.id);

    peticion$.subscribe({
      next: () => {
        this.usuarios.update(current =>
          current.map(u => u.id === user.id ? { ...u, bloqueado: !u.bloqueado } : u)
        );
        this.procesandoId.set(null);
      },
      error: (err) => {
        console.error('Error al cambiar estado del usuario', err);
        this.procesandoId.set(null);
      }
    });
  }
}