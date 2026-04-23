import { Component, input, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PisoDTO } from '../../../core/models/piso.dto';
import { FavoritoService } from '../../../shared/services/favorito.service';
import { FotoService } from '../../../shared/services/foto.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/components/toast/notification.service';

@Component({
  selector: 'app-piso-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-50 flex flex-col h-full group relative">
      
      <!-- Carrusel -->
      <div class="relative h-64 overflow-hidden bg-gray-100">
        <div class="absolute inset-0 transition-transform duration-700 ease-in-out flex"
             [style.transform]="'translateX(-' + currentImageIndex() * 100 + '%)'">
            @if (images().length > 0) {
              @for (foto of images(); track foto) {
                <img [src]="foto" class="w-full h-full object-cover shrink-0" alt="Piso">
              }
            } @else {
              <img [src]="'https://api.dicebear.com/7.x/identicon/svg?seed=' + piso().owner.nombreUsuario"
                   class="w-full h-full object-cover shrink-0" alt="Avatar Piso">
            }
        </div>
        
        <!-- Controles Carrusel (solo hover) -->
        @if (images().length > 1) {
          <div class="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
            <button (click)="$event.stopPropagation(); prevImage()"
                    class="bg-black/40 backdrop-blur-md p-2.5 rounded-full text-white shadow-lg hover:bg-black/60 hover:scale-110 transition-all pointer-events-auto active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button (click)="$event.stopPropagation(); nextImage()"
                    class="bg-black/40 backdrop-blur-md p-2.5 rounded-full text-white shadow-lg hover:bg-black/60 hover:scale-110 transition-all pointer-events-auto active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        }

        <!-- Botón Favoritos -->
        <button (click)="$event.stopPropagation(); toggleFavorito()"
                class="absolute top-4 right-4 z-30 p-3 rounded-full backdrop-blur-md transition-all active:scale-90"
                [ngClass]="isFavorito() ? 'bg-red-50 text-red-500 shadow-xl' : 'bg-black/20 hover:bg-black/40 text-white'">
          <svg class="w-5 h-5 transition-colors"
               [attr.fill]="isFavorito() ? 'currentColor' : 'none'"
               stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>

        <!-- Badge Precio -->
        <div class="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex flex-col border border-white/20 transform group-hover:scale-105 transition-transform">
          <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Por persona</span>
          <div class="flex items-baseline gap-1">
            <span class="font-black text-2xl leading-none text-primary">
              {{ precioPorPersona() | currency:'EUR':'symbol':'1.0-0' }}
            </span>
            <span class="text-xs font-bold text-gray-500">/mes</span>
          </div>
        </div>
      </div>

      <!-- Info Tarjeta -->
      <div class="p-6 flex flex-col flex-grow cursor-pointer" [routerLink]="['/piso', piso().id]">
        <h3 class="font-black text-base text-textMain line-clamp-1 mb-1 uppercase tracking-tight">{{ piso().direccion }}</h3>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
           <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                   d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
           </svg>
           {{ piso().poblacion || 'Sin ubicar' }}
        </p>

        <!-- Amenidades -->
        <div class="flex gap-3 mt-auto pt-4 border-t border-gray-50">
          <div class="p-2 rounded-xl" [ngClass]="piso().wifi ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
            </svg>
          </div>
          <div class="p-2 rounded-xl" [ngClass]="piso().animales ? 'bg-secondary/10 text-[#4a90e2]' : 'bg-gray-50 text-gray-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
            </svg>
          </div>
          <div class="p-2 rounded-xl" [ngClass]="piso().garaje ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
          <div class="p-2 rounded-xl" [ngClass]="piso().tabaco ? 'bg-orange-50 text-orange-400' : 'bg-green-50 text-green-500'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (piso().tabaco) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.5 14h15M2.5 18h15M17.5 14v4M17.5 14h3v4h-3M18 10c.5-.5 1-1.5.5-2.5a3 3 0 013-3"></path>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
              }
            </svg>
          </div>

          <div class="ml-auto flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-xl font-black text-sm text-textMain">
            {{ piso().numOcupantesActual }}/{{ piso().numTotalHabitaciones }}
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PisoCardComponent implements OnInit {
  piso = input.required<PisoDTO>();
  isFavoritoInit = input<boolean>(false);

  private fotoService   = inject(FotoService);
  private favoritoService = inject(FavoritoService);
  private authService   = inject(AuthService);
  private notificationService = inject(NotificationService);

  images            = signal<string[]>([]);
  currentImageIndex = signal(0);
  isFavorito        = signal(false);

  precioPorPersona = computed(() =>
    this.piso().precioMes / (this.piso().numOcupantesActual + 1)
  );

  ngOnInit() {
    this.isFavorito.set(this.isFavoritoInit());
    this.cargarFotos();
  }

  cargarFotos() {
    this.fotoService.getFotosByPiso(this.piso().id).subscribe({
      next: (fotos) => {
        if (fotos.length > 0) this.images.set(fotos.map(f => f.url));
      }
    });
  }

  nextImage() {
    const len = this.images().length;
    if (len > 1) this.currentImageIndex.update(i => (i + 1) % len);
  }

  prevImage() {
    const len = this.images().length;
    if (len > 1) this.currentImageIndex.update(i => (i - 1 + len) % len);
  }

  toggleFavorito() {
    const userId = this.authService.userId();
    if (!userId) {
      this.notificationService.showInfo('Debes iniciar sesión para usar favoritos');
      return;
    }
    const pId = this.piso().id;
    if (this.isFavorito()) {
      this.isFavorito.set(false);
      this.favoritoService.eliminarFavorito(userId, pId).subscribe({
        error: () => this.isFavorito.set(true)
      });
    } else {
      this.isFavorito.set(true);
      this.favoritoService.anadirFavorito(userId, pId).subscribe({
        error: () => this.isFavorito.set(false)
      });
    }
  }
}
