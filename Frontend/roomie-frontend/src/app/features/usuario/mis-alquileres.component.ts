import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlquilerService } from '../../core/services/alquiler.service';
import { AuthService } from '../../core/auth/auth.service';
import { AlquilerDTO } from '../../core/models/alquiler.dto';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-alquileres',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain pt-24 pb-20 px-6">
      <div class="max-w-5xl mx-auto">
        
        <header class="mb-12">
           <h1 class="text-3xl font-black text-textMain tracking-tight mb-2 uppercase">Gestión de Alquileres</h1>
           <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Mis solicitudes y estancias actuales</p>
        </header>

        <!-- SECCIÓN 1: MIS SOLICITUDES ENVIADAS -->
        <section class="mb-16">
           <div class="flex items-center gap-4 mb-8">
              <div class="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                 <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </div>
              <h2 class="text-sm font-black text-textMain uppercase tracking-widest">Solicitudes Enviadas</h2>
           </div>

           @if (solicitudes().length === 0) {
              <div class="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
                 <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">No has enviado ninguna solicitud todavía.</p>
              </div>
           } @else {
              <div class="grid gap-6">
                 @for (s of solicitudes(); track s.id) {
                    <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 transition-transform hover:scale-[1.01]">
                       <div class="flex items-center gap-6 w-full md:w-auto">
                          <div class="w-16 h-16 bg-bgMain rounded-3xl flex items-center justify-center p-3">
                             <img [src]="s.piso.fotoPrincipal || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200'" class="rounded-xl object-cover w-full h-full">
                          </div>
                          <div>
                             <h3 class="font-black text-textMain uppercase text-sm tracking-tight">{{ s.piso.direccion }}</h3>
                             <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Entrada: {{ s.fInicio | date:'dd MMM yyyy' }}</p>
                          </div>
                       </div>

                       <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div class="px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest" [ngClass]="getStatusStyles(s.estadoSolicitud)">
                             {{ s.estadoSolicitud }}
                          </div>
                          
                          @if (s.estadoSolicitud === 'PENDIENTE') {
                             <button (click)="cancelar(s)" class="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition-colors">
                                Cancelar
                             </button>
                          }
                       </div>
                    </div>
                 }
              </div>
           }
        </section>

        <!-- SECCIÓN 2: ALQUILERES ACTIVOS -->
        <section>
           <div class="flex items-center gap-4 mb-8">
              <div class="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                 <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <h2 class="text-sm font-black text-textMain uppercase tracking-widest">Alquileres Activos / Pasados</h2>
           </div>

           @if (alquileresActivos().length === 0) {
              <div class="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
                 <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">No tienes estancias activas actualmente.</p>
              </div>
           } @else {
              <div class="grid gap-6">
                 @for (a of alquileresActivos(); track a.id) {
                    <div class="bg-gradient-to-r from-primary to-primary-dark p-[1px] rounded-[2.5rem] shadow-xl shadow-primary/10 overflow-hidden">
                       <div class="bg-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                          <div class="flex items-center gap-6">
                             <div class="bg-primary/5 p-2 rounded-3xl">
                                <svg class="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                             </div>
                             <div>
                                <h3 class="font-black text-textMain uppercase text-sm tracking-tight">{{ a.piso.direccion }}</h3>
                                <p class="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Estado: Viviendo Actualmente</p>
                             </div>
                          </div>
                          <div class="flex gap-4">
                             <button [routerLink]="['/piso', a.piso.id]" class="bg-bgMain text-textMain font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Ver Piso</button>
                             @if (a.estadoSolicitud === 'ACEPTADA') {
                                <button class="bg-primary text-white font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Pagar Mes</button>
                             }
                          </div>
                       </div>
                    </div>
                 }
              </div>
           }
        </section>

      </div>
    </div>
  `,
  styles: ``
})
export class MisAlquileresComponent implements OnInit {
  private alquilerService = inject(AlquilerService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  alquileres = signal<AlquilerDTO[]>([]);
  
  solicitudes = computed(() => this.alquileres().filter(a => 
    a.estadoSolicitud === 'PENDIENTE' || 
    a.estadoSolicitud === 'RECHAZADA' || 
    a.estadoSolicitud === 'CANCELADA' ||
    (a.estadoSolicitud === 'ACEPTADA' && new Date(a.fInicio) > new Date())
  ));

  alquileresActivos = computed(() => this.alquileres().filter(a => 
    (a.estadoSolicitud === 'ACEPTADA' && new Date(a.fInicio) <= new Date()) ||
    a.estadoSolicitud === 'FINALIZADA'
  ));

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const userId = this.authService.userId();
    if (userId) {
      this.alquilerService.historialDeUsuario(userId).subscribe({
        next: (data) => this.alquileres.set(data),
        error: () => this.notificationService.showError('Error al cargar tus alquileres')
      });
    }
  }

  getStatusStyles(status: string) {
    switch (status) {
      case 'PENDIENTE': return 'bg-orange-100 text-orange-600 border border-orange-200';
      case 'ACEPTADA': return 'bg-green-100 text-green-600 border border-green-200';
      case 'RECHAZADA': return 'bg-red-100 text-red-600 border border-red-200';
      case 'CANCELADA': return 'bg-gray-100 text-gray-400 border border-gray-200';
      default: return 'bg-gray-50 text-gray-500';
    }
  }

  cancelar(alquiler: AlquilerDTO) {
    const userId = this.authService.userId();
    if (!userId) return;

    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      this.alquilerService.cancelarSolicitud(alquiler.id, userId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Solicitud cancelada');
          this.cargarDatos();
        },
        error: () => this.notificationService.showError('Error al cancelar la solicitud')
      });
    }
  }
}
