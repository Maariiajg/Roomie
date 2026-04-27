import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { forkJoin } from 'rxjs';
// import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-admin-administradores',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-8 min-h-screen bg-bgMain">

      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <span class="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Administración
          </span>
        </div>
        <h1 class="text-3xl font-black text-textMain tracking-tight">Gestión de Administradores</h1>
        <p class="text-gray-400 text-sm mt-1 font-medium">Controla los accesos al panel de control de Roomie</p>
      </div>

      <div class="flex gap-6 border-b border-gray-200 mb-8">
        <button (click)="tabActiva.set('pendientes')" 
                class="pb-3 px-2 font-black text-sm border-b-2 transition-colors relative flex items-center gap-2"
                [class.text-primary]="tabActiva() === 'pendientes'"
                [class.border-primary]="tabActiva() === 'pendientes'"
                [class.border-transparent]="tabActiva() !== 'pendientes'"
                [class.text-gray-400]="tabActiva() !== 'pendientes'"
                [class.hover:text-textMain]="tabActiva() !== 'pendientes'">
          Solicitudes Pendientes
          @if (solicitudes().length > 0) {
            <span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {{ solicitudes().length }}
            </span>
          }
        </button>
        <button (click)="tabActiva.set('activos')" 
                class="pb-3 px-2 font-black text-sm border-b-2 transition-colors"
                [class.text-primary]="tabActiva() === 'activos'"
                [class.border-primary]="tabActiva() === 'activos'"
                [class.border-transparent]="tabActiva() !== 'activos'"
                [class.text-gray-400]="tabActiva() !== 'activos'"
                [class.hover:text-textMain]="tabActiva() !== 'activos'">
          Administradores Activos
        </button>
      </div>

      @if (cargando()) {
        <div class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }

      @if (!cargando() && errorCarga()) {
        <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-medium text-sm mb-6">
          {{ errorCarga() }}
        </div>
      }

      @if (!cargando() && !errorCarga()) {

        @if (tabActiva() === 'pendientes') {
          @if (solicitudes().length === 0) {
            <div class="flex flex-col items-center justify-center py-24 text-gray-300 bg-white/50 border border-dashed border-gray-200 rounded-3xl">
              <svg class="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <p class="text-sm font-medium text-gray-400">No hay ninguna solicitud pendiente de revisión.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              @for (admin of solicitudes(); track admin.id) {
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  
                  <div class="p-6 flex flex-col items-center text-center border-b border-gray-50">
                    <img [src]="admin.foto || getDiceBearAvatar(admin.nombreUsuario)" 
                         alt="Avatar" 
                         class="w-20 h-20 rounded-full object-cover border-4 border-gray-50 mb-3 shadow-sm">
                    <h3 class="font-black text-textMain">{{ admin.nombre }} {{ admin.apellido1 }}</h3>
                    <span class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-1">
                      &#64;{{ admin.nombreUsuario }}
                    </span>
                  </div>

                  <div class="p-5 flex-1 bg-gray-50/50 space-y-3">
                    <div class="flex items-center gap-3 text-sm">
                      <div class="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      </div>
                      <span class="text-gray-600 font-medium truncate" [title]="admin.email">{{ admin.email }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <div class="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </div>
                      <span class="text-gray-600 font-medium">{{ admin.telefono || 'No proporcionado' }}</span>
                    </div>
                  </div>

                  <div class="p-4 grid grid-cols-2 gap-3 bg-white">
                    <button (click)="rechazarSolicitud(admin)" 
                            [disabled]="procesandoId() === admin.id"
                            class="py-2.5 rounded-xl font-bold text-xs text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50">
                      Rechazar
                    </button>
                    <button (click)="aceptarSolicitud(admin)" 
                            [disabled]="procesandoId() === admin.id"
                            class="py-2.5 rounded-xl font-bold text-xs text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50 flex justify-center items-center">
                      @if (procesandoId() === admin.id) {
                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      } @else {
                        Aceptar
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }

        @if (tabActiva() === 'activos') {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="bg-gray-50/50 border-b border-gray-100">
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuario</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (admin of adminsActivos(); track admin.id) {
                    <tr class="hover:bg-bgMain/40 transition-colors">
                      
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <img [src]="admin.foto || getDiceBearAvatar(admin.nombreUsuario)" class="w-8 h-8 rounded-full border border-gray-100 object-cover">
                          <span class="font-bold text-textMain text-xs font-mono">&#64;{{ admin.nombreUsuario }}</span>
                        </div>
                      </td>

                      <td class="px-6 py-4">
                        <span class="font-bold text-gray-700 text-xs">{{ admin.nombre }} {{ admin.apellido1 }} {{ admin.apellido2 || '' }}</span>
                      </td>

                      <td class="px-6 py-4">
                        <span class="text-gray-500 text-xs font-medium">{{ admin.email }}</span>
                      </td>

                      <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Aceptado
                        </span>
                      </td>

                    </tr>
                  }
                  @if (adminsActivos().length === 0) {
                    <tr>
                      <td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                        No hay administradores activos registrados.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      }
    </div>
  `
})
export class AdminAdministradoresComponent implements OnInit {
    private adminService = inject(AdminService);
    // private notificationService = inject(NotificationService);

    tabActiva = signal<'pendientes' | 'activos'>('pendientes');

    solicitudes = signal<any[]>([]);
    adminsActivos = signal<any[]>([]);

    cargando = signal(true);
    errorCarga = signal<string | null>(null);
    procesandoId = signal<number | null>(null);

    ngOnInit() {
        this.cargarDatos();
    }

    cargarDatos() {
        this.cargando.set(true);
        this.errorCarga.set(null);

        // Carga paralela de ambos endpoints
        forkJoin({
            pendientes: this.adminService.getSolicitudesAdmin(),
            // TODO: Asegúrate de tener este método en AdminService que llame a GET /administrador
            activos: this.adminService.getAdministradores()
        }).subscribe({
            next: (res) => {
                this.solicitudes.set(res.pendientes || []);
                // El backend devuelve todos los admins. Filtramos localmente por si acaso los pendientes vienen mezclados.
                const filtradosActivos = (res.activos || []).filter((a: any) => a.aceptado === true);
                this.adminsActivos.set(filtradosActivos);
                this.cargando.set(false);
            },
            error: () => {
                this.errorCarga.set('No se pudieron cargar los datos de los administradores.');
                this.cargando.set(false);
            }
        });
    }

    getDiceBearAvatar(username: string): string {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'admin'}`;
    }

    aceptarSolicitud(admin: any) {
        this.procesandoId.set(admin.id);

        // Llamada al endpoint PUT /administrador/{id}/aceptar
        this.adminService.aceptarAdministrador(admin.id).subscribe({
            next: () => {
                // 1. Quitarlo de la lista de pendientes
                this.solicitudes.update(lista => lista.filter(a => a.id !== admin.id));

                // 2. Añadirlo a la lista de activos poniéndolo como aceptado
                this.adminsActivos.update(lista => [...lista, { ...admin, aceptado: true }]);

                // 3. Mostrar Toast
                // this.notificationService.showSuccess('Administrador aceptado.');

                this.procesandoId.set(null);
            },
            error: () => {
                // this.notificationService.showError('Error al aceptar la solicitud.');
                this.procesandoId.set(null);
            }
        });
    }

    rechazarSolicitud(admin: any) {
        // Guardamos el ID en localStorage para ignorarlo en el futuro
        this.adminService.rechazarAdministradorLocal(admin.id);

        // Lo quitamos visualmente de la lista actual
        this.solicitudes.update(lista => lista.filter(a => a.id !== admin.id));

        // this.notificationService.showInfo('Solicitud rechazada y ocultada.');
    }
}