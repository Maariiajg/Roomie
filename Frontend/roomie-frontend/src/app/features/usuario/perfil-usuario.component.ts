import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { FeedbackService } from '../../shared/services/feedback.service';
import { AlquilerService } from '../../core/services/alquiler.service';
import { PisoService } from '../piso/piso.service';
import { PerfilUsuarioDTO, PisoDTO } from '../../core/models/piso.dto';

type Tab = 'INFO' | 'SEGURIDAD' | 'FEEDBACKS' | 'NOTIFICACIONES' | 'ESTANCIA';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain py-12 px-4">
      <div class="max-w-4xl mx-auto">

        @if (usuario()) {
          <!-- Cabecera del perfil -->
          <div class="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-50 mb-8 flex flex-col md:flex-row items-center gap-8">
            <!-- Avatar -->
            <div class="relative shrink-0">
              <img [src]="usuario()!.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + usuario()!.nombreUsuario"
                   class="w-28 h-28 rounded-[2rem] object-cover border-4 border-bgMain shadow-md" alt="Avatar">
            </div>

            <!-- Info básica -->
            <div class="flex-grow text-center md:text-left">
              <h1 class="text-3xl font-black text-textMain uppercase tracking-tight">
                {{ usuario()!.nombre }} {{ usuario()!.apellido1 }}
              </h1>
              <p class="text-primary font-black uppercase tracking-widest text-sm mt-1">&#64;{{ usuario()!.nombreUsuario }}</p>
              @if (usuario()!.mensajePresentacion) {
                <p class="text-gray-500 font-medium mt-3 max-w-lg">{{ usuario()!.mensajePresentacion }}</p>
              }
            </div>
          </div>

          <!-- Sección de Tabs (solo mi perfil) -->
          @if (isMyProfile()) {
            <div class="flex flex-wrap gap-3 mb-6 overflow-x-auto pb-1 custom-scroll">
              @for (tab of tabs; track tab.id) {
                <button (click)="activeTab.set(tab.id)"
                        class="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap relative"
                        [ngClass]="activeTab() === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-500 hover:bg-gray-50'">
                  {{ tab.label }}
                  @if (tab.id === 'NOTIFICACIONES' && solicitudesRecibidasOwner().length > 0) {
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">
                      {{ solicitudesRecibidasOwner().length }}
                    </span>
                  }
                </button>
              }
              @if (miEstancia()) {
                <button (click)="activeTab.set('ESTANCIA')"
                        class="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap"
                        [ngClass]="activeTab() === 'ESTANCIA' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-500 hover:bg-gray-50'">
                  Mi Estancia
                </button>
              }
            </div>

            <div class="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-50">

              <!-- Tab: Info Personal -->
              @if (activeTab() === 'INFO') {
                <h2 class="text-xl font-black text-textMain mb-8 uppercase">Actualizar Información</h2>
                <form (ngSubmit)="guardarPerfil()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre</label>
                      <input [(ngModel)]="perfilForm.nombre" name="nombre"
                             class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Primer Apellido</label>
                      <input [(ngModel)]="perfilForm.apellido1" name="apellido1"
                             class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Segundo Apellido</label>
                      <input [(ngModel)]="perfilForm.apellido2" name="apellido2"
                             class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Teléfono</label>
                      <input [(ngModel)]="perfilForm.telefono" name="telefono"
                             class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                      <input [(ngModel)]="perfilForm.email" name="email"
                             class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Presentación</label>
                      <textarea [(ngModel)]="perfilForm.mensajePresentacion" name="msg" rows="3"
                                class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                    </div>
                  </div>
                  <button type="submit" class="w-full py-5 bg-textMain text-white rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-black transition-all active:scale-95">
                    Guardar Cambios
                  </button>
                </form>
              }

              <!-- Tab: Seguridad -->
              @if (activeTab() === 'SEGURIDAD') {
                <h2 class="text-xl font-black text-textMain mb-8 uppercase">Cambio de Contraseña</h2>
                <form (ngSubmit)="cambiarPassword()" class="space-y-6">
                  <div>
                    <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña Actual</label>
                    <input type="password" [(ngModel)]="passwordForm.passwordAntigua" name="old"
                           class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nueva Contraseña</label>
                    <input type="password" [(ngModel)]="passwordForm.passwordNueva" name="new"
                           class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirmar Contraseña</label>
                    <input type="password" [(ngModel)]="passwordForm.passwordConfirm" name="confirm"
                           class="w-full bg-bgMain rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <button type="submit" class="w-full py-5 bg-amber-400 text-textMain rounded-2xl font-black uppercase tracking-widest hover:brightness-95 transition-all active:scale-95">
                    Actualizar Seguridad
                  </button>
                </form>
              }

              <!-- Tab: Feedbacks -->
              @if (activeTab() === 'FEEDBACKS') {
                <h2 class="text-xl font-black text-textMain mb-8 uppercase">Reseñas y Evaluaciones</h2>
                @if (feedbacks().length === 0) {
                  <p class="text-gray-400 font-bold">No tienes feedbacks pendientes ni recibidos.</p>
                } @else {
                  <div class="space-y-6">
                    @for (fb of feedbacks(); track fb.id) {
                      <div class="bg-bgMain p-6 rounded-3xl">
                        <div class="flex justify-between items-center mb-4">
                          <span class="font-black uppercase text-sm">De: {{ fb.nombreUsuarioPone || 'Sistema' }}</span>
                          <span class="text-xs font-bold text-gray-400">{{ fb.fecha }}</span>
                        </div>
                        @if (fb.estadoFeedback === 'PENDIENTE') {
                          <div class="flex flex-col gap-4">
                            <p class="text-amber-500 font-black text-xs uppercase tracking-widest">Requiere tu valoración</p>
                            <input type="number" min="1" max="5" [(ngModel)]="fb.tempCalificacion"
                                   placeholder="Nota 1-5" class="p-3 rounded-xl font-bold outline-none bg-white border border-gray-100">
                            <textarea [(ngModel)]="fb.tempDescripcion" placeholder="Escribe tu reseña..."
                                      class="p-3 rounded-xl font-bold outline-none bg-white border border-gray-100 resize-none" rows="2"></textarea>
                            <button (click)="enviarValoracion(fb)"
                                    class="bg-primary text-white py-3 rounded-xl font-black uppercase text-xs active:scale-95 transition-all">
                              Enviar Valoración
                            </button>
                          </div>
                        } @else {
                          <div class="flex text-amber-400 mb-2">
                            @for (s of [1,2,3,4,5]; track s) {
                              <svg class="w-4 h-4" [attr.fill]="s <= fb.calificacion ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                              </svg>
                            }
                          </div>
                          <p class="text-gray-600 font-medium italic">"{{ fb.descripcion }}"</p>
                        }
                      </div>
                    }
                  </div>
                }
              }

              <!-- Tab: Notificaciones -->
              @if (activeTab() === 'NOTIFICACIONES') {
                <h2 class="text-xl font-black text-textMain mb-8 uppercase">Mis Notificaciones</h2>

                <!-- Mis Solicitudes Enviadas -->
                <div class="mb-10">
                  <h3 class="text-xs font-black uppercase tracking-widest mb-4" style="color:#4a90e2">Solicitudes Enviadas</h3>
                  @if (misSolicitudesEnviadas().length === 0) {
                    <p class="text-gray-400 font-bold text-sm">No has enviado ninguna solicitud de alquiler.</p>
                  } @else {
                    <div class="space-y-3">
                      @for (sol of misSolicitudesEnviadas(); track sol.id) {
                        <div class="bg-bgMain p-5 rounded-2xl flex justify-between items-center border border-gray-100">
                          <div>
                            <p class="font-black text-sm uppercase">{{ sol.piso?.direccion || 'Piso #' + sol.pisoId }}</p>
                            <p class="text-xs font-bold text-gray-400 mt-1">Inicio: {{ sol.fechaInicio || sol.fInicio }}</p>
                          </div>
                          <span class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                [ngClass]="{
                                  'bg-amber-100 text-amber-700': sol.estadoSolicitud === 'PENDIENTE',
                                  'bg-primary/20 text-primary':  sol.estadoSolicitud === 'ACEPTADA',
                                  'bg-red-100 text-red-600':     sol.estadoSolicitud === 'RECHAZADA',
                                  'bg-gray-100 text-gray-500':   sol.estadoSolicitud === 'CANCELADA' || sol.estadoSolicitud === 'FINALIZADA'
                                }">
                            {{ sol.estadoSolicitud }}
                          </span>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Solicitudes Recibidas (Solo OWNER) -->
                @if (isOwner()) {
                  <div>
                    <h3 class="text-xs font-black uppercase tracking-widest mb-4" style="color:#3fb6a8">Solicitudes Recibidas en Tu Piso</h3>
                    @if (solicitudesRecibidasOwner().length === 0) {
                      <p class="text-gray-400 font-bold text-sm">No tienes solicitudes pendientes.</p>
                    } @else {
                      <div class="space-y-4">
                        @for (sol of solicitudesRecibidasOwner(); track sol.id) {
                          <div class="bg-white border-2 border-primary/20 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                            <div>
                              <p class="font-black text-sm uppercase">{{ sol.usuario?.nombre }} {{ sol.usuario?.apellido1 }}</p>
                              <p class="text-xs font-bold text-gray-500 mt-1">Desde: {{ sol.fechaInicio || sol.fInicio }}</p>
                            </div>
                            <div class="flex gap-3">
                              <button (click)="resolverSolicitud(sol.id, false)"
                                      class="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase active:scale-95 transition-all hover:bg-red-100">
                                Rechazar
                              </button>
                              <button (click)="resolverSolicitud(sol.id, true)"
                                      class="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg shadow-primary/30 active:scale-95 transition-all">
                                Aceptar
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              }

              <!-- Tab: Mi Estancia -->
              @if (activeTab() === 'ESTANCIA' && miEstancia() && pisoEstancia()) {
                <h2 class="text-xl font-black text-textMain mb-8 uppercase">Mi Estancia Actual</h2>
                <div class="bg-bgMain rounded-[2rem] p-8">
                  <div class="flex flex-col sm:flex-row items-start justify-between mb-8 gap-6">
                    <div>
                      <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Dirección</span>
                      <h3 class="font-black text-2xl text-textMain mt-1">{{ pisoEstancia()!.direccion }}</h3>
                      <p class="text-sm font-bold text-gray-500 mt-1">{{ pisoEstancia()!.poblacion }}</p>
                    </div>
                    <div class="bg-white px-8 py-5 rounded-2xl shadow-sm text-center">
                      <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Tu Cuota Exacta</span>
                      <span class="font-black text-2xl" style="color:#3fb6a8">{{ precioEstancia() | currency:'EUR' }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-4 rounded-2xl">
                      <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Fecha de Inicio</span>
                      <span class="font-black text-sm">{{ miEstancia()!.fechaInicio || miEstancia()!.fInicio }}</span>
                    </div>
                    <div class="bg-white p-4 rounded-2xl">
                      <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Compañeros</span>
                      <span class="font-black text-sm">{{ pisoEstancia()!.numOcupantesActual }} conviviendo</span>
                    </div>
                  </div>
                </div>
              }
            </div>

          <!-- Vista Perfil Ajeno (solo lectura) -->
          } @else {
            <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 mb-6">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Información de contacto</h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4 text-textMain font-bold">
                  <svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  {{ usuario()!.email }}
                </div>
                <div class="flex items-center gap-4 text-textMain font-bold">
                  <svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  {{ usuario()!.telefono }}
                </div>
              </div>
            </div>

            <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Presentación</h3>
              <p class="text-gray-700 font-medium">{{ usuario()!.mensajePresentacion || 'Este usuario no tiene presentación.' }}</p>
            </div>
          }

        } @else {
          <div class="flex flex-col items-center py-32">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cargando perfil...</p>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`.custom-scroll::-webkit-scrollbar { height: 4px; } .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }`]
})
export class PerfilUsuarioComponent implements OnInit {
  private route               = inject(ActivatedRoute);
  private router              = inject(Router);
  private usuarioService      = inject(UsuarioService);
  private authService         = inject(AuthService);
  private notificationService = inject(NotificationService);
  private feedbackService     = inject(FeedbackService);
  private alquilerService     = inject(AlquilerService);
  private pisoService         = inject(PisoService);

  usuario   = signal<PerfilUsuarioDTO | null>(null);
  activeTab = signal<Tab>('INFO');

  isMyProfile = computed(() => {
    const currentId = this.authService.userId();
    const pId       = this.usuario()?.id;
    return currentId !== null && pId !== undefined && currentId === pId;
  });

  isOwner = computed(() => this.authService.role() === 'OWNER');

  tabs = [
    { id: 'INFO'           as Tab, label: 'Info Personal' },
    { id: 'SEGURIDAD'      as Tab, label: 'Seguridad' },
    { id: 'FEEDBACKS'      as Tab, label: 'Feedbacks' },
    { id: 'NOTIFICACIONES' as Tab, label: 'Notificaciones' }
  ];

  perfilForm   = { nombre: '', apellido1: '', apellido2: '', telefono: '', email: '', mensajePresentacion: '' };
  passwordForm = { passwordAntigua: '', passwordNueva: '', passwordConfirm: '' };

  feedbacks                 = signal<any[]>([]);
  misSolicitudesEnviadas    = signal<any[]>([]);
  solicitudesRecibidasOwner = signal<any[]>([]);
  miEstancia                = signal<any>(null);
  pisoEstancia              = signal<PisoDTO | null>(null);
  precioEstancia            = signal<number | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarUsuario(Number(idParam));
    } else {
      const myId = this.authService.userId();
      myId ? this.cargarUsuario(myId) : this.router.navigate(['/login']);
    }
  }

  cargarUsuario(id: number) {
    this.usuarioService.getUsuarioById(id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        if (this.isMyProfile()) {
          this.perfilForm = {
            nombre: u.nombre || '', apellido1: u.apellido1 || '',
            apellido2: u.apellido2 || '', telefono: u.telefono || '',
            email: u.email || '', mensajePresentacion: u.mensajePresentacion || ''
          };
          this.cargarFeedbacks(u.id);
          this.cargarDatosExtra(u.id);
        }
      },
      error: () => this.notificationService.showError('Error al cargar el usuario')
    });
  }

  cargarFeedbacks(idUsuario: number) {
    this.feedbackService.getFeedbacksByUsuario(idUsuario).subscribe({
      next: (fbs) => this.feedbacks.set(fbs)
    });
  }

  cargarDatosExtra(myId: number) {
    // Alquiler actual → Mi Estancia
    this.alquilerService.alquilerActual(myId).subscribe({
      next: (alq) => {
        if (alq?.id) {
          this.miEstancia.set(alq);
          const pisoId = alq.pisoId ?? alq.piso?.id;
          if (pisoId) {
            this.pisoService.getPisoById(pisoId).subscribe(p => this.pisoEstancia.set(p));
            this.pisoService.getPisoResidenteById(pisoId).subscribe(pr => this.precioEstancia.set(pr.precioMesPersona));
          }
        }
      },
      error: () => {} // Sin alquiler activo es normal
    });

    // Historial de solicitudes enviadas
    this.alquilerService.historialDeUsuario(myId).subscribe({
      next: (als) => this.misSolicitudesEnviadas.set(als)
    });

    // Solicitudes recibidas si es OWNER
    if (this.isOwner()) {
      this.pisoService.getLibres().subscribe(pisos => {
        const misPisos = pisos.filter(p => p.owner.id === myId);
        misPisos.forEach(p => {
          this.alquilerService.solicitudesPendientes(p.id).subscribe(sols => {
            this.solicitudesRecibidasOwner.update(curr => [...curr, ...sols]);
          });
        });
      });
    }
  }

  guardarPerfil() {
    const myId = this.usuario()?.id;
    if (!myId) return;
    this.usuarioService.actualizarPerfil(myId, this.perfilForm).subscribe({
      next: (u) => { this.usuario.set(u); this.notificationService.showSuccess('Perfil actualizado'); },
      error: ()  => this.notificationService.showError('Error al actualizar perfil')
    });
  }

  cambiarPassword() {
    const myId = this.usuario()?.id;
    if (!myId) return;
    if (this.passwordForm.passwordNueva !== this.passwordForm.passwordConfirm) {
      this.notificationService.showError('Las contraseñas no coinciden');
      return;
    }
    this.usuarioService.cambiarCredenciales(myId, this.passwordForm).subscribe({
      next: () => { this.notificationService.showSuccess('Contraseña actualizada'); this.passwordForm = { passwordAntigua: '', passwordNueva: '', passwordConfirm: '' }; },
      error: ()  => this.notificationService.showError('Error al cambiar la contraseña')
    });
  }

  resolverSolicitud(idAlquiler: number, aceptar: boolean) {
    const myId = this.authService.userId();
    if (!myId) return;
    this.alquilerService.resolverSolicitud(idAlquiler, myId, aceptar).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Solicitud ${aceptar ? 'aceptada' : 'rechazada'}`);
        this.solicitudesRecibidasOwner.update(list => list.filter(a => a.id !== idAlquiler));
      },
      error: () => this.notificationService.showError('Error al resolver la solicitud')
    });
  }

  enviarValoracion(fb: any) {
    const myId = this.authService.userId();
    if (!myId || !fb.idUsuarioPone) return;
    if (!fb.tempCalificacion || !fb.tempDescripcion) {
      this.notificationService.showError('Falta calificación o descripción');
      return;
    }
    const dto = { calificacion: fb.tempCalificacion, descripcion: fb.tempDescripcion, estadoFeedback: 'ACEPTADA' };
    this.feedbackService.valorar(myId, fb.idUsuarioPone, dto).subscribe({
      next: () => { this.notificationService.showSuccess('Valoración enviada'); this.cargarFeedbacks(myId); },
      error: () => this.notificationService.showError('Error al valorar')
    });
  }
}
