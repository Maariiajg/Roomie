import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { AdminService } from '../../core/services/admin.service';
import { AlquilerService } from '../../core/services/alquiler.service';
import { AlquilerDTO } from '../../core/models/alquiler.dto';
import { PerfilUsuarioDTO } from '../../core/models/piso.dto';

interface KpiCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 min-h-screen bg-bgMain">

      <!-- ─── Page Header ─── -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <span class="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Panel de Control
          </span>
        </div>
        <h1 class="text-3xl font-black text-textMain tracking-tight">Dashboard</h1>
        <p class="text-gray-400 text-sm mt-1 font-medium">Vista general de la plataforma Roomie</p>
      </div>

      <!-- ─── Loading Global ─── -->
      @if (cargando()) {
        <div class="flex flex-col items-center justify-center py-32 gap-4">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p class="text-gray-400 font-medium text-sm">Cargando estadísticas...</p>
        </div>
      }

      <!-- ─── Error Global ─── -->
      @if (!cargando() && errorCarga()) {
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 mb-8">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-black text-red-700 text-sm">Error al cargar los datos</h3>
            <p class="text-red-500 text-sm mt-0.5">{{ errorCarga() }}</p>
            <button (click)="cargarTodo()"
              class="mt-3 text-xs font-black text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      }

      @if (!cargando()) {

        <!-- ═══════════════════════════════════════════════
             SECCIÓN A: KPI CARDS
        ═══════════════════════════════════════════════ -->
        <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          <!-- Total Usuarios -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="flex items-start justify-between mb-4 relative">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-widest text-gray-300">usuarios</span>
            </div>
            <div class="relative">
              <div class="text-4xl font-black text-textMain tabular-nums">{{ totalUsuarios() }}</div>
              <div class="text-sm text-gray-400 font-medium mt-1">Total registrados</div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-hover rounded-b-2xl"></div>
          </div>

          <!-- Total Pisos -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="flex items-start justify-between mb-4 relative">
              <div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-widest text-gray-300">pisos</span>
            </div>
            <div class="relative">
              <div class="text-4xl font-black text-textMain tabular-nums">{{ totalPisos() }}</div>
              <div class="text-sm text-gray-400 font-medium mt-1">Total publicados</div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-blue-400 rounded-b-2xl"></div>
          </div>

          <!-- Pisos Libres -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="flex items-start justify-between mb-4 relative">
              <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-widest text-gray-300">libres</span>
            </div>
            <div class="relative">
              <div class="text-4xl font-black text-textMain tabular-nums">{{ pisosLibres() }}</div>
              <div class="text-sm text-gray-400 font-medium mt-1">Con plazas disponibles</div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-2xl"></div>
          </div>

          <!-- Solicitudes Admin Pendientes -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
               [class.border-red-200]="solicitudesPendientes() > 0"
               [class.bg-red-50]="solicitudesPendientes() > 0">
            <div class="absolute inset-0 bg-gradient-to-br from-alert/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="flex items-start justify-between mb-4 relative">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                   [class.bg-alert]="solicitudesPendientes() > 0"
                   [class.bg-yellow-50]="solicitudesPendientes() === 0">
                <svg class="w-6 h-6"
                     [class.text-textMain]="solicitudesPendientes() > 0"
                     [class.text-yellow-500]="solicitudesPendientes() === 0"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-widest text-gray-300">pendientes</span>
            </div>
            <div class="relative">
              <div class="text-4xl font-black tabular-nums"
                   [class.text-red-600]="solicitudesPendientes() > 0"
                   [class.text-textMain]="solicitudesPendientes() === 0">
                {{ solicitudesPendientes() }}
              </div>
              <div class="text-sm font-medium mt-1"
                   [class.text-red-400]="solicitudesPendientes() > 0"
                   [class.text-gray-400]="solicitudesPendientes() === 0">
                Solicitudes de admin
              </div>
            </div>
            @if (solicitudesPendientes() > 0) {
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-b-2xl"></div>
            } @else {
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-alert to-yellow-400 rounded-b-2xl"></div>
            }
          </div>

        </section>

        <!-- ═══════════════════════════════════════════════
             SECCIÓN B: ACTIVIDAD RECIENTE
        ═══════════════════════════════════════════════ -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <!-- Header de sección -->
          <div class="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 class="text-base font-black text-textMain">Actividad Reciente</h2>
              <p class="text-xs text-gray-400 font-medium mt-0.5">Últimos 5 alquileres globales</p>
            </div>
            <div class="w-9 h-9 bg-bgMain rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>

          <!-- Loading alquileres -->
          @if (cargandoAlquileres()) {
            <div class="flex items-center justify-center py-16 gap-3">
              <div class="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span class="text-gray-400 text-sm font-medium">Cargando alquileres...</span>
            </div>
          }

          <!-- Error alquileres -->
          @if (!cargandoAlquileres() && errorAlquileres()) {
            <div class="flex items-center gap-3 px-6 py-8 text-red-400">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span class="text-sm font-medium">{{ errorAlquileres() }}</span>
            </div>
          }

          <!-- Tabla alquileres -->
          @if (!cargandoAlquileres() && !errorAlquileres()) {
            @if (recentAlquileres().length === 0) {
              <div class="flex flex-col items-center py-16 text-gray-300">
                <svg class="w-14 h-14 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-sm font-medium text-gray-400">No hay alquileres registrados aún</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-bgMain">
                      <th class="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
                      <th class="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Piso</th>
                      <th class="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                      <th class="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (alquiler of recentAlquileres(); track alquiler.id) {
                      <tr class="hover:bg-bgMain/60 transition-colors">

                        <!-- Usuario -->
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span class="text-primary font-black text-xs uppercase">
                                {{ (alquiler.usuario?.nombreUsuario || alquiler.usuario?.nombre || '?').charAt(0) }}
                              </span>
                            </div>
                            <div>
                              <div class="font-bold text-textMain text-xs">
                                {{ alquiler.usuario?.nombre }} {{ alquiler.usuario?.apellido1 }}
                              </div>
                              <div class="text-gray-400 text-[10px] font-mono">
                                &#64;{{ alquiler.usuario?.nombreUsuario || ('ID: ' + alquiler.usuario?.id) }}
                              </div>
                            </div>
                          </div>
                        </td>

                        <!-- Piso -->
                        <td class="px-6 py-4">
                          <div class="font-bold text-textMain text-xs truncate max-w-[180px]">
                            {{ alquiler.piso?.direccion || ('Piso #' + alquiler.pisoId) }}
                          </div>
                          <div class="text-gray-400 text-[10px] font-mono">ID: {{ alquiler.pisoId }}</div>
                        </td>

                        <!-- Estado -->
                        <td class="px-6 py-4">
                          <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full"
                                [ngClass]="getEstadoClasses(alquiler.estadoSolicitud)">
                            <span class="w-1.5 h-1.5 rounded-full inline-block"
                                  [ngClass]="getEstadoDotClass(alquiler.estadoSolicitud)"></span>
                            {{ alquiler.estadoSolicitud }}
                          </span>
                        </td>

                        <!-- Fecha -->
                        <td class="px-6 py-4">
                          <div class="text-xs font-bold text-textMain">
                            {{ formatDate(alquiler.fSolicitud || alquiler.fechaInicio) }}
                          </div>
                          <div class="text-[10px] text-gray-400 font-mono">
                            {{ alquiler.fSolicitud || alquiler.fechaInicio }}
                          </div>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }

        </section>

      }

    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private adminService   = inject(AdminService);
  private alquilerService = inject(AlquilerService);

  // KPI Signals
  totalUsuarios       = signal(0);
  totalPisos          = signal(0);
  pisosLibres         = signal(0);
  solicitudesPendientes = signal(0);

  // Loading / error states
  cargando      = signal(true);
  errorCarga    = signal<string | null>(null);
  cargandoAlquileres = signal(true);
  errorAlquileres    = signal<string | null>(null);

  // Recent rentals
  recentAlquileres = signal<AlquilerDTO[]>([]);

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    forkJoin({
      usuarios:    this.usuarioService.getUsuarios(),
      pisos:       this.adminService.getTodosPisos(),
      pisosLibres: this.adminService.getPisosLibres(),
      solicitudes: this.adminService.getSolicitudesAdmin(),
    }).subscribe({
      next: ({ usuarios, pisos, pisosLibres, solicitudes }) => {
        this.totalUsuarios.set(usuarios.length);
        this.totalPisos.set(pisos.length);
        this.pisosLibres.set(pisosLibres.length);
        this.solicitudesPendientes.set(solicitudes.length);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorCarga.set('No se pudieron cargar las estadísticas. Verifica tu conexión o los permisos.');
        this.cargando.set(false);
      }
    });

    this.cargarAlquileres();
  }

  cargarAlquileres(): void {
    this.cargandoAlquileres.set(true);
    this.errorAlquileres.set(null);

    this.alquilerService.getAllAlquileres().subscribe({
      next: (alquileres) => {
        // Ordenar por fecha descendente y tomar los 5 más recientes
        const sorted = [...alquileres].sort((a, b) => {
          const fechaA = new Date(a.fSolicitud || a.fechaInicio || '').getTime();
          const fechaB = new Date(b.fSolicitud || b.fechaInicio || '').getTime();
          return fechaB - fechaA;
        });
        this.recentAlquileres.set(sorted.slice(0, 5));
        this.cargandoAlquileres.set(false);
      },
      error: () => {
        this.errorAlquileres.set('No se pudo cargar el historial de alquileres.');
        this.cargandoAlquileres.set(false);
      }
    });
  }

  getEstadoClasses(estado: string): Record<string, boolean> {
    return {
      'bg-yellow-50 text-yellow-700':  estado === 'PENDIENTE',
      'bg-green-50 text-green-700':    estado === 'ACEPTADA',
      'bg-red-50 text-red-600':        estado === 'RECHAZADA' || estado === 'CANCELADA',
      'bg-gray-100 text-gray-500':     estado === 'FINALIZADA',
    };
  }

  getEstadoDotClass(estado: string): Record<string, boolean> {
    return {
      'bg-yellow-400': estado === 'PENDIENTE',
      'bg-green-400':  estado === 'ACEPTADA',
      'bg-red-400':    estado === 'RECHAZADA' || estado === 'CANCELADA',
      'bg-gray-400':   estado === 'FINALIZADA',
    };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
