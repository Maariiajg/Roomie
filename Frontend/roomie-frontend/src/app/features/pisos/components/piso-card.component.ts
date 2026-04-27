import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PisoDTO } from '../../../core/models/piso.dto';
import { AuthService } from '../../../core/auth/auth.service';
import { FavoritoService } from '../../../shared/services/favorito.service';

@Component({
  selector: 'app-piso-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group overflow-hidden">
      
      <div class="relative h-64 w-full overflow-hidden bg-gray-200">
        <img [src]="currentImage()" 
             alt="Foto del piso" 
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
             (click)="goToDetail()">

        <button (click)="toggleFavorito($event)" 
                class="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/70 backdrop-blur hover:bg-white transition-all shadow-sm">
          <svg class="w-6 h-6 transition-colors duration-300" 
               [ngClass]="isFav() ? 'text-red-500 fill-current' : 'text-gray-400 stroke-current fill-none'" 
               viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <button (click)="prevImage($event)" 
                class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all z-10 backdrop-blur-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button (click)="nextImage($event)" 
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all z-10 backdrop-blur-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          @for (foto of getFotosSeguras(); track $index) {
            <div class="w-2 h-2 rounded-full transition-all" [ngClass]="$index === currentImageIndex() ? 'bg-white' : 'bg-white/50'"></div>
          }
        </div>
      </div>

      <div class="p-8 flex flex-col flex-grow cursor-pointer bg-white" (click)="goToDetail()">
        
        <div class="mb-4">
          <h3 class="font-black text-textMain uppercase text-lg truncate tracking-tight" [title]="piso.direccion">
            {{ piso.direccion }}
          </h3>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            {{ piso.poblacion || 'Población no especificada' }}
          </p>
        </div>

        <div class="flex items-center gap-4 mb-6">
          <svg class="w-6 h-6 transition-colors" [ngClass]="piso.wifi ? 'text-primary' : 'text-gray-300 opacity-50'" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="WiFi">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          
          <svg class="w-6 h-6 transition-colors" [ngClass]="piso.animales ? 'text-primary' : 'text-gray-300 opacity-50'" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Mascotas">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>

          <svg class="w-6 h-6 transition-colors" [ngClass]="piso.garaje ? 'text-primary' : 'text-gray-300 opacity-50'" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Garaje">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H12c-.6 0-1.2.3-1.6.8L8.3 10c0 0-2.7.6-4.5 1.1-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM8 17a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>

          <div class="relative w-6 h-6" [title]="piso.tabaco ? 'Fumadores permitidos' : 'Prohibido fumar'">
            <svg class="w-full h-full transition-colors" [ngClass]="piso.tabaco ? 'text-primary' : 'text-gray-300 opacity-50'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16h12M4 12h16M8 8V6m4 2V6m4 2V6" />
            </svg>
            @if (!piso.tabaco) {
              <svg class="w-6 h-6 absolute inset-0 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4l16 16" />
              </svg>
            }
          </div>
        </div>

        <div class="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {{ piso.numOcupantesActual }} VIVIENDO
            </span>
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {{ piso.numTotalHabitaciones }} PLAZAS TOTALES
            </span>
            <div class="mt-2 bg-primary text-white px-3 py-1.5 rounded-lg w-max flex flex-col items-start shadow-md">
              <span class="text-lg font-black leading-none">{{ precioPorPersona() | number:'1.0-0' }}€</span>
              <span class="text-[8px] uppercase tracking-wider font-bold">Por Persona</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PisoCardComponent implements OnInit {
  @Input({ required: true }) piso!: PisoDTO;
  @Input() isFavoritoInit: boolean = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  private favoritoService = inject(FavoritoService);

  isFav = signal<boolean>(false);
  currentImageIndex = signal<number>(0);

  precioPorPersona = computed(() => {
    if (!this.piso) return 0;
    return this.piso.precioMes / (this.piso.numOcupantesActual + 1);
  });

  currentImage = computed(() => {
    const fotos = this.getFotosSeguras();
    return fotos[this.currentImageIndex()];
  });

  ngOnInit() {
    this.isFav.set(this.isFavoritoInit);
  }

  getFotosSeguras(): string[] {
    // Al no venir las fotos en el DTO, usamos directamente los placeholders 
    // de Unsplash que indica tu documento técnico para desarrollo.
    return [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'
    ];
  }

  nextImage(event: Event) {
    event.stopPropagation();
    const fotosLength = this.getFotosSeguras().length;
    this.currentImageIndex.update(i => (i + 1) % fotosLength);
  }

  prevImage(event: Event) {
    event.stopPropagation();
    const fotosLength = this.getFotosSeguras().length;
    this.currentImageIndex.update(i => (i - 1 + fotosLength) % fotosLength);
  }

  goToDetail() {
    this.router.navigate(['/piso', this.piso.id]);
  }

  toggleFavorito(event: Event) {
    event.stopPropagation();

    const userId = this.authService.userId();

    if (!userId) {
      alert('Debes iniciar sesión para añadir este piso a tus favoritos.');
      return;
    }

    const currentFavState = this.isFav();

    // UI Optimista
    this.isFav.set(!currentFavState);

    if (currentFavState) {
      this.favoritoService.eliminarFavorito(userId, this.piso.id).subscribe({
        error: () => {
          this.isFav.set(true);
          console.error('Error al eliminar favorito');
        }
      });
    } else {
      // Ahora usamos 'anadirFavorito' tal y como se llama en tu servicio
      this.favoritoService.anadirFavorito(userId, this.piso.id).subscribe({
        error: () => {
          this.isFav.set(false);
          console.error('Error al añadir favorito');
        }
      });
    }
  }
}