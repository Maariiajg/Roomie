import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PisoService } from '../piso/piso.service';
import { PisoDTO } from '../../core/models/piso.dto';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { AuthService } from '../../core/auth/auth.service';
import { AlquilerService } from '../../core/services/alquiler.service';

@Component({
  selector: 'app-piso-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- CONTENEDOR RAIZ CON SCROLL GLOBAL (EFECTO PERSIANA) -->
    <div class="fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden custom-scroll">
      
      <!-- 50% SUPERIOR: CARRUSEL PEGAJOSO (STICKY) -->
      <section class="sticky top-0 h-[50vh] w-full z-0 overflow-hidden">
        <div class="absolute inset-0 flex transition-transform duration-1000 ease-in-out" 
             [style.transform]="'translateX(-' + currentImageIndex() * 100 + '%)'">
          @for (img of images(); track img) {
            <img [src]="img" class="w-full h-full object-cover shrink-0" alt="Vista">
          }
        </div>

        <!-- OVERLAY GRADIENTE PARA PROFUNDIDAD -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>

        <!-- Botones Flotantes (Z-INDEX SUPERIOR) -->
        <div class="absolute top-10 left-8 right-8 flex justify-between items-center z-50">
          <button (click)="goBack()" class="bg-white/10 backdrop-blur-2xl p-5 rounded-full text-white border border-white/20 hover:bg-white/30 transition-all shadow-2xl active:scale-90">
             <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <button class="bg-white/10 backdrop-blur-2xl p-5 rounded-full text-white border border-white/20 hover:bg-white/30 transition-all shadow-2xl active:scale-90">
             <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>
        </div>

        <!-- Indicadores de imagen -->
        <div class="absolute bottom-20 inset-x-0 flex justify-center gap-3 z-50">
          @for (img of images(); let i = $index; track img) {
            <div class="h-1.5 rounded-full transition-all duration-300" [ngClass]="currentImageIndex() === i ? 'w-10 bg-primary' : 'w-2 bg-white/40'"></div>
          }
        </div>
      </section>

      <!-- 50% INFERIOR: FICHA DE INFORMACIÓN (LA PERSIANA) -->
      <section class="relative z-10 -mt-20 bg-bgMain rounded-t-[3.5rem] shadow-[0_-30px_100px_rgba(0,0,0,0.5)] min-h-screen pt-12 pb-32">
        <div class="max-w-4xl mx-auto px-10">
          
          @if (piso()) {
            <!-- BLOQUE 1: HEADLINE -->
            <div class="mb-4">
              <h1 class="text-4xl font-black text-textMain tracking-tighter uppercase leading-none mb-6">{{ piso()?.direccion }}</h1>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Ubicación</span>
                  <span class="text-sm font-black text-primary uppercase">Castellón de la Plana</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Superficie</span>
                  <span class="text-2xl font-black text-textMain tabular-nums">{{ piso()?.tamanio }}m²</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Dormitorios</span>
                  <span class="text-2xl font-black text-textMain tabular-nums">{{ piso()?.numTotalHabitaciones }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Viviendo</span>
                  <span class="text-2xl font-black text-textMain tabular-nums">{{ piso()?.numOcupantesActual }}</span>
                </div>
              </div>
            </div>

            <hr class="border-gray-100 my-12">

            <!-- BLOQUE 2: INTEGRANTES (LOS CAJONES) -->
            <div class="mb-12">
               <h2 class="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.3em]">Integrantes del piso</h2>
               @if (inquilinos().length > 0) {
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (user of inquilinos(); track user.id) {
                      <div (click)="openProfile(user)" class="bg-white p-6 rounded-2xl shadow-md border border-gray-50 flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition-transform">
                         <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm">
                               <img [src]="user.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.nombreUsuario" class="w-full h-full object-cover">
                            </div>
                            <span class="font-black text-textMain uppercase text-sm tracking-tight group-hover:text-primary transition-colors">{{ user.nombreUsuario }}</span>
                         </div>
                         <div class="flex items-center gap-1 text-alert">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <span class="text-sm font-black text-textMain">{{ user.calificacionMedia || '5.0' }}</span>
                         </div>
                      </div>
                    }
                 </div>
               } @else {
                 <div class="bg-gray-50 p-10 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                    <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Esperando datos de compañeros...</p>
                 </div>
               }
            </div>

            <hr class="border-gray-100 my-12">

            <!-- BLOQUE 3: ESENCIA (DESCRIPCIÓN) -->
            <div class="mb-12">
               <h2 class="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.3em]">Esencia del hogar</h2>
               <p class="text-gray-600 leading-relaxed text-lg font-medium italic">
                 "{{ piso()?.descripcion || 'Buscamos un compañero que valore la limpieza y el buen ambiente. El piso está decorado con mimo y tiene mucha luz natural.' }}"
               </p>
            </div>

            <hr class="border-gray-100 my-12">

            <!-- BLOQUE 4: AMENITIES (ICONOS) -->
            <div class="mb-12">
                <h2 class="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.3em]">¿Qué ofrecemos?</h2>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 transition-all shadow-sm" [ngClass]="piso()?.wifi ? 'opacity-100' : 'opacity-20 grayscale'">
                     <div class="p-3 bg-primary/10 rounded-2xl text-primary"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 20 0"/></svg></div>
                     <span class="font-black text-[9px] uppercase tracking-widest text-textMain leading-none">WiFi Fibra</span>
                  </div>
                  <div class="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 transition-all shadow-sm" [ngClass]="piso()?.animales ? 'opacity-100' : 'opacity-20 grayscale'">
                     <div class="p-3 bg-primary/10 rounded-2xl text-primary"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M17 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M12 13a5 5 0 0 1 5 5c0 1.1-.9 2-2 2h-6a2 2 0 0 1-2-2 5 5 0 0 1 5-5Z"/></svg></div>
                     <span class="font-black text-[9px] uppercase tracking-widest text-textMain leading-none">Mascotas</span>
                  </div>
                  <div class="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 transition-all shadow-sm" [ngClass]="piso()?.garaje ? 'opacity-100' : 'opacity-20 grayscale'">
                     <div class="p-3 bg-primary/10 rounded-2xl text-primary"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>
                     <span class="font-black text-[9px] uppercase tracking-widest text-textMain leading-none">Garaje</span>
                  </div>
                  <div class="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 transition-all shadow-sm" [ngClass]="!piso()?.tabaco ? 'opacity-100' : 'opacity-20 grayscale'">
                     <div class="p-3 bg-primary/10 rounded-2xl text-primary"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2.5 14h15"/><path d="M2.5 18h15"/><path d="M17.5 14v4"/><line x1="2" y1="2" x2="22" y2="22"/></svg></div>
                     <span class="font-black text-[9px] uppercase tracking-widest text-textMain leading-none">Sin Humos</span>
                  </div>
                </div>
            </div>

            <hr class="border-gray-100 my-12">

            <!-- BLOQUE 5: ECONOMÍA (PRECIO) -->
            <div class="mb-24">
               <h2 class="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.3em]">Economía Personal</h2>
               <div class="flex items-baseline gap-6">
                  <span class="text-8xl font-black text-textMain tracking-tighter tabular-nums">{{ (piso()!.precioMes / (piso()!.numOcupantesActual + 1)) | currency:'EUR':'symbol':'1.0-0' }}</span>
                  <div class="flex flex-col">
                     <span class="text-sm font-black text-primary uppercase tracking-[0.2em]">Euros / Mes</span>
                     <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Calculado por persona</span>
                  </div>
               </div>
            </div>

            <!-- BOTÓN SOLICITAR ROCA (FIJO) -->
            <button (click)="openCalendar()" class="fixed bottom-10 right-10 bg-primary hover:bg-hover text-white font-black py-8 px-16 rounded-[3.5rem] shadow-[0_30px_90px_rgba(63,182,168,0.6)] transition-all active:scale-95 text-2xl uppercase tracking-[0.2em] z-[150]">
               Solicitar
            </button>
          }
        </div>
      </section>

      <!-- RESTO DE MODALES (MISMOS QUE ANTES PERO ENCAPSULADOS) -->
      @if (showCalendar()) {
        <div class="fixed inset-0 z-[200] flex items-center justify-center p-6">
           <div (click)="showCalendar.set(false)" class="absolute inset-0 bg-black/98 backdrop-blur-3xl"></div>
           <div class="relative w-full max-w-lg bg-white rounded-[5rem] p-20 shadow-2xl overflow-hidden">
              <h3 class="text-4xl font-black text-textMain mb-4 uppercase tracking-tighter">Tu entrada</h3>
              <p class="text-primary text-[10px] font-black mb-12 uppercase tracking-[0.4em]">Reserva de plaza inteligente</p>
              
              <div class="grid grid-cols-7 gap-3 mb-16">
                 @for (day of calendarDays; track day.date.getTime()) {
                   <button 
                     [disabled]="!day.isAllowed" (click)="selectDate(day.date)"
                     class="aspect-square flex items-center justify-center rounded-3xl text-sm font-black transition-all"
                     [ngClass]="isSelected(day.date) ? 'bg-primary text-white shadow-xl' : (day.isAllowed ? 'text-textMain border border-gray-100 hover:bg-primary/10' : 'text-gray-100')">
                     {{ day.date.getDate() }}
                   </button>
                 }
              </div>

              <button [disabled]="!selectedDate() || isSubmitting()" (click)="confirmSolicitud()" class="w-full py-8 bg-primary text-white text-xl font-black rounded-[3rem] shadow-2xl shadow-primary/30 disabled:opacity-30 uppercase">
                 {{ isSubmitting() ? 'Procesando...' : 'Confirmar Vuelo' }}
              </button>
           </div>
        </div>
      }

      @if (selectedUser()) {
        <div class="fixed inset-0 z-[250] flex items-center justify-center p-6">
           <div (click)="selectedUser.set(null)" class="absolute inset-0 bg-black/99 backdrop-blur-3xl"></div>
           <div class="relative w-full max-w-3xl bg-white rounded-[6rem] p-20 shadow-2xl max-h-[95vh] overflow-y-auto custom-scroll">
              <div class="text-center mb-16">
                 <h3 class="text-5xl font-black text-textMain lowercase tracking-tighter mb-12">&#64;{{ selectedUser().nombreUsuario }}</h3>
                 <img [src]="selectedUser().foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedUser().nombreUsuario" class="w-56 h-56 rounded-full mx-auto border-[15px] border-bgMain shadow-2xl">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                 <div class="bg-bgMain p-10 rounded-[4rem] text-center">
                    <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Roomie Real</p>
                    <p class="text-2xl font-black text-textMain">{{ selectedUser().nombre }}</p>
                 </div>
                 <div class="bg-bgMain p-10 rounded-[4rem] text-center">
                    <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Edad</p>
                    <p class="text-2xl font-black text-textMain">{{ calcularEdad(selectedUser().fechaNacimiento) }} Años</p>
                 </div>
              </div>

              <div class="mb-16 text-center px-10">
                 <p class="text-gray-500 text-3xl font-medium italic leading-snug">"{{ selectedUser().mensajePresentacion || 'Hola, ¡busco compañero ideal de aventuras!' }}"</p>
              </div>

              <hr class="border-gray-100 my-16">

              <h4 class="text-xs font-black uppercase text-gray-300 tracking-[0.4em] mb-12 text-center">Testimonios directos</h4>
              <div class="relative overflow-hidden mb-20">
                 <div class="flex transition-transform duration-700 ease-in-out gap-10" [style.transform]="'translateX(-' + feedbackIdx() * 100 + '%)'">
                    @if (feedbacks().length === 0) {
                       <div class="w-full bg-bgMain p-20 rounded-[4rem] text-center shrink-0"><p class="text-gray-400 font-black uppercase">Sin historial previo.</p></div>
                    } @else {
                       @for (fb of feedbacks(); track fb.id) {
                          <div class="w-full bg-white p-12 rounded-[4rem] border border-gray-100 shrink-0 shadow-sm">
                             <div class="flex items-center gap-6 mb-8">
                                <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + fb.nombreEmisor" class="w-16 h-16 rounded-full">
                                <div>
                                   <p class="font-black text-textMain uppercase text-sm tracking-widest">{{ fb.nombreEmisor || 'Roommate' }}</p>
                                   <div class="flex text-alert">@for (s of [1,2,3,4,5]; track s) { <svg class="w-4 h-4" [attr.fill]="s <= fb.puntuacion ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> }</div>
                                </div>
                             </div>
                             <p class="text-gray-500 text-2xl font-medium leading-relaxed italic">"{{ fb.comentario }}"</p>
                          </div>
                       }
                    }
                 </div>
              </div>

              <button (click)="selectedUser.set(null)" class="w-full py-10 bg-black text-white font-black rounded-[3rem] uppercase tracking-widest text-sm shadow-2xl">Cerrar Expediente</button>
           </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .custom-scroll::-webkit-scrollbar { width: 0px; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PisoDetalleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private http = inject(HttpClient);
  private pisoService = inject(PisoService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  piso = signal<PisoDTO | null>(null);
  inquilinos = signal<any[]>([]);
  feedbacks = signal<any[]>([]);
  alquileres = signal<any[]>([]);
  
  currentImageIndex = signal(0);
  feedbackIdx = signal(0);
  showCalendar = signal(false);
  selectedUser = signal<any | null>(null);
  selectedDate = signal<Date | null>(null);
  isSubmitting = signal(false);

  images = signal<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200'
  ]);

  calendarDays: { date: Date, isAllowed: boolean }[] = [];

  ngOnInit() {
    window.scrollTo(0, 0);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       this.cargarDatos(Number(id));
    }
    // Ocultar header/footer vía CSS global inyectado o class en body
    document.body.classList.add('hide-layout');
  }

  ngOnDestroy() {
    document.body.classList.remove('hide-layout');
  }

  cargarDatos(id: number) {
    this.pisoService.getPisoById(id).subscribe(p => {
      this.piso.set(p);
      this.cargarAlquileres(id);
    });
    // REPARACIÓN INQUILINOS: Asegurar que la señal se actualice
    this.pisoService.getUsuariosInPiso(id).subscribe({
      next: (users) => {
        console.log('Inquilinos cargados:', users);
        this.inquilinos.set(users);
      },
      error: (err) => console.error('Error cargando inquilinos:', err)
    });
  }

  cargarAlquileres(id: number) {
    this.pisoService.getAlquileresDePiso(id).subscribe(als => {
      this.alquileres.set(als.filter(a => a.estadoSolicitud === 'ACEPTADA'));
      this.generateCalendar();
    });
  }

  calcularEdad(fechaNacimiento: string | undefined): number {
    if (!fechaNacimiento) return 22;
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  goBack() { this.location.back(); }

  openProfile(user: any) {
    this.selectedUser.set(user);
    this.feedbackIdx.set(0);
    this.http.get<any[]>(`http://localhost:8081/feedback/usuario/${user.id}`).subscribe(fbs => this.feedbacks.set(fbs));
  }

  generateCalendar() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const limit = new Date(today);
    limit.setMonth(limit.getMonth() + 2);

    const days = [];
    const maxRooms = this.piso()?.numTotalHabitaciones || 0;

    for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const occupancyOnDay = this.alquileres().filter(a => {
           const start = a.fInicio;
           const end = a.fFin || '9999-12-31';
           return dateStr >= start && dateStr < end;
        }).length;
        days.push({ date: d, isAllowed: d <= limit && occupancyOnDay < maxRooms });
    }
    this.calendarDays = days;
  }

  openCalendar() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showInfo('Inicia sesión para reservar.');
      return;
    }
    this.showCalendar.set(true);
  }

  selectDate(date: Date) { this.selectedDate.set(date); }
  isSelected(date: Date) { return this.selectedDate()?.getTime() === date.getTime(); }

  confirmSolicitud() {
    const p = this.piso();
    const date = this.selectedDate();
    const userId = this.authService.userId();
    if (!p || !date || !userId) return;
    this.isSubmitting.set(true);
    const fInicio = date.toISOString().split('T')[0];
    const url = `http://localhost:8081/alquiler/solicitar?idUsuario=${userId}&idPiso=${p.id}&fInicio=${fInicio}`;
    this.http.post(url, {}).subscribe({
        next: () => {
          this.notificationService.showSuccess('Su solicitud ha sido enviada');
          this.showCalendar.set(false);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Error');
          this.isSubmitting.set(false);
        }
    });
  }
}
