import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlquilerService } from '../../core/services/alquiler.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { AlquilerDTO } from '../../core/models/alquiler.dto';

@Component({
   selector: 'app-mis-alquileres',
   standalone: true,
   imports: [CommonModule, RouterModule],
   template: `
    <div class="min-h-screen bg-bgMain py-12 px-4 lg:px-8 font-sans">
      <div class="max-w-6xl mx-auto">
        
        <div class="mb-12">
          <h1 class="text-4xl font-black text-textMain uppercase tracking-tighter italic">Mis Alquileres</h1>
          <p class="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Gestiona tus estancias y solicitudes</p>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-32">
            <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        } @else {
          
          <div class="mb-16">
            <h2 class="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Solicitudes en curso / Pasadas
            </h2>

            @if (solicitudes().length === 0) {
              <div class="bg-white p-8 rounded-[2rem] text-center shadow-sm border border-gray-50 border-dashed">
                <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">No tienes solicitudes pendientes ni canceladas.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (sol of solicitudes(); track sol.id) {
                  <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden group">
                    
                    <img [src]="sol.piso?.fotoPrincipal || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80'" 
                         class="w-full sm:w-28 h-32 sm:h-28 rounded-2xl object-cover shadow-sm shrink-0">
                    
                    <div class="flex-grow">
                      <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block"
                            [ngClass]="getBadgeClass(sol.estadoSolicitud)">
                        {{ sol.estadoSolicitud }}
                      </span>
                      <h3 class="font-black text-textMain uppercase tracking-tight text-lg leading-tight mb-1">{{ sol.piso?.direccion || 'Piso #' + sol.pisoId }}</h3>
                      <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Inicio solicitado: {{ sol.fechaInicio || sol.fInicio }}</p>
                    </div>

                    @if (sol.estadoSolicitud === 'PENDIENTE') {
                      <button (click)="confirmarCancelacion(sol.id)" 
                              class="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors active:scale-95 shrink-0">
                        Cancelar
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div>
            <h2 class="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Estancias (Activas y Finalizadas)
            </h2>

            @if (estancias().length === 0) {
              <div class="bg-white p-8 rounded-[2rem] text-center shadow-sm border border-gray-50 border-dashed">
                <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">No tienes estancias activas ni pasadas.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (est of estancias(); track est.id) {
                  <div class="bg-white rounded-[2rem] p-8 shadow-md border-2"
                       [ngClass]="est.estadoSolicitud === 'ACEPTADA' ? 'border-primary shadow-primary/10' : 'border-gray-100'">
                    
                    <div class="flex justify-between items-start mb-6">
                      <div>
                        <div class="flex items-center gap-2 mb-2">
                          @if (est.estadoSolicitud === 'ACEPTADA') {
                            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span class="text-primary font-black uppercase text-[10px] tracking-widest">Viviendo Actualmente</span>
                          } @else {
                            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span class="text-gray-500 font-black uppercase text-[10px] tracking-widest">Estancia Finalizada</span>
                          }
                        </div>
                        <h3 class="font-black text-textMain uppercase tracking-tighter text-2xl leading-none">{{ est.piso?.direccion || 'Piso' }}</h3>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Entrada: {{ est.fechaInicio || est.fInicio }}</p>
                      </div>
                    </div>

                    <a [routerLink]="['/piso', est.piso?.id || est.pisoId]" 
                       class="block text-center w-full py-4 bg-bgMain text-textMain rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-colors">
                      Ver Ficha del Piso
                    </a>
                  </div>
                }
              </div>
            }
          </div>

        }
      </div>
    </div>
  `
})
export class MisAlquileresComponent implements OnInit {
   private alquilerService = inject(AlquilerService);
   private authService = inject(AuthService);
   private notificationService = inject(NotificationService);

   historial = signal<any[]>([]);
   isLoading = signal(true);

   // Computada para SECCIÓN 1: Solicitudes (Pendiente, Rechazada, Cancelada, o Aceptada pero en el futuro)
   solicitudes = computed(() => {
      return this.historial().filter(alq => {
         const isFuturo = this.isDateInFuture(alq.fechaInicio || alq.fInicio);
         return ['PENDIENTE', 'RECHAZADA', 'CANCELADA'].includes(alq.estadoSolicitud) ||
            (alq.estadoSolicitud === 'ACEPTADA' && isFuturo);
      });
   });

   // Computada para SECCIÓN 2: Estancias (Aceptada en el pasado/hoy, o Finalizada)
   estancias = computed(() => {
      return this.historial().filter(alq => {
         const isFuturo = this.isDateInFuture(alq.fechaInicio || alq.fInicio);
         return alq.estadoSolicitud === 'FINALIZADA' ||
            (alq.estadoSolicitud === 'ACEPTADA' && !isFuturo);
      });
   });

   ngOnInit() {
      this.cargarHistorial();
   }

   cargarHistorial() {
      const userId = this.authService.userId();
      if (!userId) return;

      this.alquilerService.historialDeUsuario(userId).subscribe({
         next: (data) => {
            // Ordenamos por id o fecha descendente (lo más reciente primero)
            this.historial.set(data.sort((a: any, b: any) => b.id - a.id));
            this.isLoading.set(false);
         },
         error: () => {
            this.notificationService.showError('Error al cargar tu historial');
            this.isLoading.set(false);
         }
      });
   }

   confirmarCancelacion(idAlquiler: number) {
      if (confirm('¿Estás seguro de que quieres cancelar esta solicitud de alquiler?')) {
         const userId = this.authService.userId();
         if (!userId) return;

         this.alquilerService.cancelarSolicitud(idAlquiler, userId).subscribe({
            next: () => {
               this.notificationService.showSuccess('Solicitud cancelada correctamente');
               this.cargarHistorial(); // Recargamos para actualizar los estados
            },
            error: () => this.notificationService.showError('No se pudo cancelar la solicitud')
         });
      }
   }

   // --- Helpers UI y Lógica ---

   getBadgeClass(estado: string): string {
      switch (estado) {
         case 'PENDIENTE': return 'bg-amber-100 text-amber-600';
         case 'ACEPTADA': return 'bg-green-100 text-green-600';
         case 'RECHAZADA': return 'bg-red-100 text-red-600';
         case 'CANCELADA': return 'bg-gray-200 text-gray-600';
         case 'FINALIZADA': return 'bg-blue-100 text-blue-600';
         default: return 'bg-gray-100 text-gray-500';
      }
   }

   isDateInFuture(dateStr: string): boolean {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const today = new Date();
      // Ponemos ambas fechas a las 00:00:00 para comparar solo el día
      date.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return date > today;
   }
}