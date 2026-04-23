import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PisoService } from '../piso/piso.service';
import { PisoDTO } from '../../core/models/piso.dto';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { AuthService } from '../../core/auth/auth.service';
import { AlquilerService } from '../../core/services/alquiler.service';
import { FotoService } from '../../shared/services/foto.service';
import { FavoritoService } from '../../shared/services/favorito.service';

@Component({
  selector: 'app-piso-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden">

      <!-- CARRUSEL SUPERIOR STICKY -->
      <section class="sticky top-0 h-[50vh] w-full z-0 overflow-hidden">
        <div class="absolute inset-0 flex transition-transform duration-700 ease-in-out"
             [style.transform]="'translateX(-' + currentImageIndex() * 100 + '%)'">
          @for (img of images(); track img) {
            <img [src]="img" class="w-full h-full object-cover shrink-0" alt="Vista del piso">
          }
          @if (images().length === 0) {
            <div class="w-full h-full shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg class="w-24 h-24 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          }
        </div>

        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>

        <!-- Botones Flotantes -->
        <div class="absolute top-10 left-6 right-6 flex justify-between items-center z-50">
          <button (click)="goBack()" class="bg-white/10 backdrop-blur-2xl p-4 rounded-full text-white border border-white/20 hover:bg-white/30 transition-all shadow-2xl active:scale-90">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M15 19l-7-7 7-7"></path></svg>
          </button>
          @if (isLoggedIn()) {
            <button (click)="toggleFavorito()" class="bg-white/10 backdrop-blur-2xl p-4 rounded-full border border-white/20 hover:bg-white/30 transition-all shadow-2xl active:scale-90"
                    [ngClass]="isFavorito() ? 'text-red-400' : 'text-white'">
              <svg class="w-6 h-6 transition-colors" [attr.fill]="isFavorito() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          }
        </div>

        <!-- Flechas Carrusel -->
        @if (images().length > 1) {
          <div class="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-40 pointer-events-none">
            <button (click)="prevImage()" class="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/40 transition-all pointer-events-auto active:scale-90">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button (click)="nextImage()" class="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/40 transition-all pointer-events-auto active:scale-90">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        }

        <!-- Bullets indicadores -->
        <div class="absolute bottom-16 inset-x-0 flex justify-center gap-2 z-50">
          @for (img of images(); let i = $index; track img) {
            <div class="h-1.5 rounded-full transition-all duration-300"
                 [ngClass]="currentImageIndex() === i ? 'w-8 bg-white' : 'w-2 bg-white/40'"></div>
          }
        </div>

        <!-- Badge precio -->
        <div class="absolute bottom-4 left-6 z-50 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
          <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">
            {{ isResidente() ? 'Tu cuota exacta' : 'Precio estimado/persona' }}
          </span>
          <div class="flex items-baseline gap-1">
            <span class="font-black text-2xl text-primary">
              {{ precioPorPersona() | currency:'EUR':'symbol':'1.0-0' }}
            </span>
            <span class="text-xs font-bold text-gray-500">/mes</span>
          </div>
        </div>
      </section>

      <!-- CONTENIDO PRINCIPAL -->
      <section class="relative z-10 bg-bgMain min-h-[60vh] rounded-t-[3rem] -mt-8 pb-32">
        @if (isLoading()) {
          <div class="flex items-center justify-center py-32">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        } @else if (piso()) {
          <div class="max-w-4xl mx-auto px-6 pt-12">

            <!-- Cabecera -->
            <div class="mb-8">
              <h1 class="text-3xl font-black text-textMain uppercase tracking-tight">{{ piso()!.direccion }}</h1>
              <p class="text-gray-500 font-bold mt-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                {{ piso()!.poblacion || 'Ubicación no especificada' }}
              </p>
            </div>

            <!-- Descripción -->
            @if (piso()!.descripcion) {
              <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-6">
                <h2 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Descripción</h2>
                <p class="text-gray-700 font-medium leading-relaxed">{{ piso()!.descripcion }}</p>
              </div>
            }

            <!-- Características -->
            <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-6">
              <h2 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Características</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="flex flex-col items-center gap-2 p-4 rounded-2xl" [ngClass]="piso()!.wifi ? 'bg-primary/5 text-primary' : 'bg-gray-50 text-gray-300'">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">WiFi</span>
                </div>
                <div class="flex flex-col items-center gap-2 p-4 rounded-2xl" [ngClass]="piso()!.animales ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-300'">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">Animales</span>
                </div>
                <div class="flex flex-col items-center gap-2 p-4 rounded-2xl" [ngClass]="piso()!.garaje ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-300'">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">Garaje</span>
                </div>
                <div class="flex flex-col items-center gap-2 p-4 rounded-2xl" [ngClass]="piso()!.tabaco ? 'bg-orange-50 text-orange-400' : 'bg-green-50 text-green-500'">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                  </svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">{{ piso()!.tabaco ? 'Tabaco OK' : 'Sin tabaco' }}</span>
                </div>
              </div>
            </div>

            <!-- Detalles numéricos -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 text-center">
                <span class="text-3xl font-black text-primary">{{ piso()!.numOcupantesActual }}</span>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Viviendo</p>
              </div>
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 text-center">
                <span class="text-3xl font-black text-textMain">{{ piso()!.numTotalHabitaciones }}</span>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Habitaciones</p>
              </div>
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 text-center">
                <span class="text-3xl font-black text-textMain">{{ piso()!.tamanio }}</span>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">m²</p>
              </div>
            </div>

            <!-- Inquilinos -->
            @if (inquilinos().length > 0) {
              <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 mb-6">
                <h2 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Compañeros</h2>
                <div class="flex flex-wrap gap-4">
                  @for (inq of inquilinos(); track inq.id) {
                    <div class="flex flex-col items-center gap-2 cursor-pointer" [routerLink]="['/usuario', inq.id]">
                      <img [src]="inq.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + inq.nombreUsuario"
                           class="w-14 h-14 rounded-2xl object-cover border-2 border-bgMain" alt="Compañero">
                      <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">{{ inq.nombreUsuario }}</span>
                    </div>
                  }
                </div>
              </div>
            }

          </div>
        }
      </section>

      <!-- BOTÓN SOLICITAR (Flotante) -->
      @if (mostrarBotonSolicitar()) {
        <div class="fixed bottom-8 inset-x-0 flex justify-center z-[200] px-6">
          <button (click)="showCalendar.set(true)"
                  class="bg-primary text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 hover:bg-primary/90 active:scale-95 transition-all">
            Solicitar Alquiler
          </button>
        </div>
      }

      <!-- MODAL CALENDARIO -->
      @if (showCalendar()) {
        <div class="fixed inset-0 bg-black/60 z-[300] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl">
            <div class="flex justify-between items-center mb-8">
              <h3 class="font-black text-xl text-textMain uppercase">Selecciona Fecha</h3>
              <button (click)="showCalendar.set(false)" class="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <p class="text-sm font-bold text-gray-500 mb-6">¿Cuándo quieres empezar a vivir aquí?</p>

            <div class="grid grid-cols-7 gap-1 mb-6">
              @for (day of ['L','M','X','J','V','S','D']; track day) {
                <div class="text-center text-[10px] font-black text-gray-400 uppercase py-2">{{ day }}</div>
              }
              @for (day of calendarDays(); track day.date) {
                <button (click)="day.available && selectDate(day.date)"
                        class="aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all"
                        [ngClass]="{
                          'bg-primary text-white shadow-lg shadow-primary/30': selectedDate() === day.date,
                          'bg-bgMain hover:bg-primary/10 text-textMain cursor-pointer': day.available && selectedDate() !== day.date,
                          'text-gray-300 cursor-not-allowed': !day.available,
                          'opacity-0 pointer-events-none': !day.date
                        }">
                  {{ day.label }}
                </button>
              }
            </div>

            @if (selectedDate()) {
              <div class="bg-primary/5 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span class="font-black text-primary text-sm">Entrada: {{ selectedDate() }}</span>
              </div>
            }

            <button (click)="confirmSolicitud()"
                    [disabled]="!selectedDate() || isSubmitting()"
                    class="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
                    [ngClass]="selectedDate() && !isSubmitting() ? 'bg-primary text-white shadow-xl shadow-primary/30 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
              {{ isSubmitting() ? 'Enviando...' : 'Enviar Solicitud' }}
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class PisoDetalleComponent implements OnInit {
  private route               = inject(ActivatedRoute);
  private pisoService         = inject(PisoService);
  private http                = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private authService         = inject(AuthService);
  private alquilerService     = inject(AlquilerService);
  private fotoService         = inject(FotoService);
  private favoritoService     = inject(FavoritoService);
  private location            = inject(Location);

  piso       = signal<PisoDTO | null>(null);
  images     = signal<string[]>([]);
  inquilinos = signal<any[]>([]);
  isLoading  = signal(true);
  isResidente      = signal(false);
  precioResidente  = signal<number | null>(null);
  isFavorito       = signal(false);
  tieneAlquilerActivo = signal(false);
  showCalendar    = signal(false);
  selectedDate    = signal<string | null>(null);
  isSubmitting    = signal(false);
  currentImageIndex = signal(0);
  calendarDays    = signal<{ date: string; label: string; available: boolean }[]>([]);

  isLoggedIn = computed(() => this.authService.isLoggedIn());

  precioPorPersona = computed(() => {
    const p = this.piso();
    if (!p) return 0;
    if (this.isResidente() && this.precioResidente() !== null) return this.precioResidente()!;
    return p.precioMes / (p.numOcupantesActual + 1);
  });

  mostrarBotonSolicitar = computed(() => {
    const p    = this.piso();
    const role = this.authService.role();
    if (!p || !this.isLoggedIn()) return false;
    if (role === 'ADMINISTRADOR') return false;
    if (this.isResidente()) return false;
    if (this.tieneAlquilerActivo()) return false;
    if (p.plazasLibres <= 0) return false;
    return true;
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.pisoService.getPisoById(id).subscribe(p => {
      this.piso.set(p);
      this.cargarFotos(id, p);
      this.verificarEstadoUsuario(id);
    });

    if (this.authService.isLoggedIn()) {
      this.pisoService.getUsuariosInPiso(id).subscribe({
        next: (users) => {
          this.inquilinos.set(users);
          const userId = this.authService.userId();
          if (userId && users.some((u: any) => u.id === userId)) {
            this.isResidente.set(true);
            this.pisoService.getPisoResidenteById(id).subscribe(pr => {
              this.precioResidente.set(pr.precioMesPersona);
            });
          }
        },
        error: () => {}
      });
    }

    this.generarCalendario();
    this.isLoading.set(false);
  }

  cargarFotos(id: number, piso: PisoDTO) {
    this.fotoService.getFotosByPiso(id).subscribe({
      next: (fotos) => {
        if (fotos.length > 0) {
          this.images.set(fotos.map((f: any) => f.url));
        }
      }
    });
  }

  verificarEstadoUsuario(idPiso: number) {
    const userId = this.authService.userId();
    if (!userId) return;

    // Verificar si tiene favorito
    this.favoritoService.getFavoritosByUsuario(userId).subscribe({
      next: (favs: any[]) => {
        this.isFavorito.set(favs.some(f => f.piso.id === idPiso));
      },
      error: () => {}
    });

    // Verificar si tiene alquiler activo
    this.alquilerService.alquilerActual(userId).subscribe({
      next: (alq) => { if (alq?.id) this.tieneAlquilerActivo.set(true); },
      error: () => {}
    });
  }

  generarCalendario() {
    const days: { date: string; label: string; available: boolean }[] = [];
    const today = new Date();
    const start = new Date(today);
    // Padding para que empiece en lunes
    const dow = (start.getDay() + 6) % 7;
    for (let i = 0; i < dow; i++) days.push({ date: '', label: '', available: false });

    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      days.push({ date: `${yyyy}-${mm}-${dd}`, label: String(d.getDate()), available: true });
    }
    this.calendarDays.set(days);
  }

  selectDate(date: string) { this.selectedDate.set(date); }

  confirmSolicitud() {
    const p      = this.piso();
    const userId = this.authService.userId();
    const fInicio = this.selectedDate();
    if (!p || !userId || !fInicio || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const url = `http://localhost:8081/alquiler/solicitar?idUsuario=${userId}&idPiso=${p.id}&fInicio=${fInicio}`;
    this.http.post(url, {}).subscribe({
      next: () => {
        this.notificationService.showSuccess('Solicitud enviada correctamente');
        this.showCalendar.set(false);
        this.isSubmitting.set(false);
        this.tieneAlquilerActivo.set(true);
      },
      error: (err) => {
        this.notificationService.showError(err?.error?.message || 'Error al enviar la solicitud');
        this.isSubmitting.set(false);
      }
    });
  }

  toggleFavorito() {
    const userId = this.authService.userId();
    const p      = this.piso();
    if (!userId || !p) return;

    if (this.isFavorito()) {
      this.isFavorito.set(false);
      this.favoritoService.eliminarFavorito(userId, p.id).subscribe({ error: () => this.isFavorito.set(true) });
    } else {
      this.isFavorito.set(true);
      this.favoritoService.anadirFavorito(userId, p.id).subscribe({ error: () => this.isFavorito.set(false) });
    }
  }

  nextImage() {
    const len = this.images().length;
    if (len > 1) this.currentImageIndex.update(i => (i + 1) % len);
  }

  prevImage() {
    const len = this.images().length;
    if (len > 1) this.currentImageIndex.update(i => (i - 1 + len) % len);
  }

  goBack() { this.location.back(); }
}
