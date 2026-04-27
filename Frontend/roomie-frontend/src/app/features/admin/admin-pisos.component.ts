import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PisoDTO } from '../../core/models/piso.dto';
import { PisoService } from '../piso/piso.service';

@Component({
    selector: 'app-admin-pisos',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="p-8 min-h-screen bg-bgMain relative">

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Administración
            </span>
          </div>
          <h1 class="text-3xl font-black text-textMain tracking-tight">Gestión de Pisos</h1>
          <p class="text-gray-400 text-sm mt-1 font-medium">Controla todo el inventario de inmuebles de la plataforma</p>
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
            placeholder="Buscar por dirección o @owner..." 
            class="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
          >
        </div>
      </div>

      @if (cargando()) {
        <div class="flex flex-col items-center justify-center py-32 gap-4">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-400 font-medium text-sm">Cargando pisos...</p>
        </div>
      }

      @if (!cargando() && errorCarga()) {
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-red-500">
          <span class="font-bold">Error: </span> {{ errorCarga() }}
        </div>
      }

      @if (!cargando() && !errorCarga()) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          @if (filteredPisos().length === 0) {
            <div class="flex flex-col items-center py-20 text-gray-300">
              <svg class="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <p class="text-sm font-medium text-gray-400">No se encontraron pisos con esos criterios.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="bg-gray-50/50 border-b border-gray-100">
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Dirección</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Owner</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Ocupación</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Precio</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Estado</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (piso of filteredPisos(); track piso.id) {
                    <tr class="hover:bg-bgMain/40 transition-colors">
                      
                      <td class="px-6 py-4">
                        <a [routerLink]="['/piso', piso.id]" class="group block cursor-pointer">
                          <div class="font-bold text-textMain text-sm group-hover:text-primary transition-colors">{{ piso.direccion }}</div>
                          <div class="text-gray-400 text-[11px] font-mono mt-0.5 uppercase">Madrid</div>
                        </a>
                      </td>

                      <td class="px-6 py-4">
                        <a [routerLink]="['/perfil', piso.owner.id]" 
                           class="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                          <span class="text-primary font-black text-[11px]">&#64;{{ piso.owner.nombreUsuario }}</span>
                        </a>
                      </td>

                      <td class="px-6 py-4 text-center">
                        <div class="text-xs font-bold font-mono">
                          <span [ngClass]="(piso.numOcupantesActual || 0) >= 4 ? 'text-red-500' : 'text-textMain'">
                            {{ piso.numOcupantesActual || 0 }}
                          </span> 
                          <span class="text-gray-400">/ 4</span>
                        </div>
                      </td>

                      <td class="px-6 py-4 text-center">
                        <div class="text-sm font-black text-textMain">{{ piso.precioMes }}€<span class="text-[10px] font-medium text-gray-400">/mes</span></div>
                      </td>

                      <td class="px-6 py-4 text-center">
                        @if ((piso.numOcupantesActual || 0) < 4) {
                          <span class="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Con Plazas
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span> Lleno
                          </span>
                        }
                      </td>

                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <a [routerLink]="['/piso', piso.id]" 
                             class="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-colors"
                             title="Ver detalle público">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </a>
                          <button (click)="abrirModalEliminar(piso)"
                                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                  title="Eliminar piso">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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

      @if (modalAbierto()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-textMain/80 backdrop-blur-sm p-4">
          <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-xl font-black text-center text-textMain mb-2">Eliminar Piso</h3>
            <p class="text-gray-500 text-center text-sm mb-8">
              ¿Seguro que quieres eliminar el piso en <strong class="text-textMain">{{ pisoSeleccionado()?.direccion }}</strong>?<br><br>
              <span class="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Atención:</span> Los inquilinos actuales finalizarán su estancia inmediatamente.
            </p>
            
            <div class="flex gap-3">
              <button (click)="cerrarModal()" [disabled]="procesando()" class="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-textMain font-bold hover:bg-gray-50 transition-colors disabled:opacity-50">Cancelar</button>
              <button (click)="confirmarEliminacion()" [disabled]="procesando()" class="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                @if (procesando()) {
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                } @else {
                  Sí, eliminar
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminPisosComponent implements OnInit {
    private pisoService = inject(PisoService);
    // private notificationService = inject(NotificationService);

    pisos = signal<PisoDTO[]>([]);
    cargando = signal(true);
    errorCarga = signal<string | null>(null);

    // Añadido para el buscador
    searchTerm = signal<string>('');

    // Computed Signal para filtrar los pisos en tiempo real
    filteredPisos = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return this.pisos();

        return this.pisos().filter(p =>
            (p.direccion?.toLowerCase() || '').includes(term) ||
            (p.owner?.nombreUsuario?.toLowerCase() || '').includes(term) ||
            (p.id?.toString() || '').includes(term)
        );
    });

    // Modal State
    modalAbierto = signal(false);
    pisoSeleccionado = signal<PisoDTO | null>(null);
    procesando = signal(false);

    ngOnInit() {
        this.loadPisos();
    }

    loadPisos() {
        this.cargando.set(true);
        this.pisoService.getAllPisos().subscribe({
            next: (data) => {
                this.pisos.set(data);
                this.cargando.set(false);
            },
            error: () => {
                this.errorCarga.set('No se pudieron cargar los pisos del servidor.');
                this.cargando.set(false);
            }
        });
    }

    abrirModalEliminar(piso: PisoDTO) {
        this.pisoSeleccionado.set(piso);
        this.modalAbierto.set(true);
    }

    cerrarModal() {
        this.modalAbierto.set(false);
        this.pisoSeleccionado.set(null);
    }

    confirmarEliminacion() {
        const id = this.pisoSeleccionado()?.id;
        if (!id) return;

        this.procesando.set(true);
        this.pisoService.deletePiso(id).subscribe({
            next: () => {
                // this.notificationService.showSuccess('Piso eliminado con éxito.');
                this.cerrarModal();
                this.procesando.set(false);
                this.loadPisos();
            },
            error: () => {
                // this.notificationService.showError('Error al eliminar el piso.');
                this.procesando.set(false);
            }
        });
    }
}