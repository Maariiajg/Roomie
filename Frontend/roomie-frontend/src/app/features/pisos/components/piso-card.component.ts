import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PisoDTO } from '../../../core/models/piso.dto';
import { FavoritoService } from '../../../shared/services/favorito.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/components/toast/notification.service';
import { AlquilerService } from '../../../core/services/alquiler.service';

@Component({
  selector: 'app-piso-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all group relative">
      
      <!-- Contenedor de la imagen -->
      <div class="relative w-full h-48 mb-5 rounded-2xl overflow-hidden cursor-pointer" [routerLink]="['/piso', piso.id]">
        <img [src]="piso.fotos?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div class="absolute top-4 left-4 bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
          {{ piso.numTotalHabitaciones - piso.numOcupantesActual }} Libres
        </div>
      </div>
      
      <!-- BOTÓN FAVORITO: Siempre visible con fondo blanco sólido -->
      <button (click)="toggleFavorito($event)" class="absolute top-9 right-9 z-20 p-2.5 rounded-full bg-white hover:bg-gray-50 hover:scale-110 transition-all shadow-md flex items-center justify-center">
        <!-- Corazón: Rojo si es favorito, Gris si no lo es -->
        <svg class="w-5 h-5 transition-colors" [ngClass]="isFavorito() ? 'text-red-500 fill-current' : 'text-gray-300 stroke-current fill-none'" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div class="flex flex-col flex-grow">
        <a [routerLink]="['/piso', piso.id]" class="font-black text-lg text-textMain uppercase leading-tight hover:text-primary transition-colors line-clamp-1">{{ piso.direccion }}</a>
        <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Madrid</p>

        <!-- Comodidades booleanas -->
        <div class="flex items-center gap-3 mt-4 mb-2">
          <div [ngClass]="piso.wifi ? 'text-primary' : 'text-gray-200'" title="WiFi"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg></div>
          <div [ngClass]="piso.animales ? 'text-secondary' : 'text-gray-200'" title="Mascotas"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a2 2 0 100-4 2 2 0 000 4zm4.5 1.5a2 2 0 100-4 2 2 0 000 4zm-9 0a2 2 0 100-4 2 2 0 000 4zM2 9a2 2 0 100-4 2 2 0 000 4zm16 0a2 2 0 100-4 2 2 0 000 4zm-4.7 2.3c-.6-.4-1.3-.3-1.8.2l-1.5 1.5-1.5-1.5c-.5-.5-1.2-.6-1.8-.2-1.3.8-1.7 2.5-1 3.8.7 1.3 2.1 2.2 3.6 2.2h1.4c1.5 0 2.9-.9 3.6-2.2.7-1.3.3-3-1-3.8z"/></svg></div>
          <div [ngClass]="piso.garaje ? 'text-alert' : 'text-gray-200'" title="Garaje"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM8 17a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
          <div [ngClass]="piso.tabaco ? 'text-orange-400' : 'text-green-500'" title="Tabaco"><div class="relative w-5 h-5"><svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2 14h13m-13 3h13m2-3v4m0-4h3v4h-3m1-10c.5-.5 1-1.5.5-2.5a3 3 0 013-3" /></svg>@if (!piso.tabaco) {<svg class="w-full h-full absolute inset-0 text-red-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}</div></div>
        </div>
        
        <div class="mt-auto border-t border-gray-100 pt-4 flex justify-between items-end">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Precio x persona</p>
            <p class="text-xl font-black text-textMain leading-none">
              <!-- USAMOS EL PRECIO INTELIGENTE -->
              {{ precioCalculado() | currency:'EUR':'symbol':'1.0-0' }}<span class="text-xs text-gray-400 font-bold">/mes</span>
            </p>
          </div>
          <a [routerLink]="['/piso', piso.id]" class="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </div>
  `
})
export class PisoCardComponent implements OnInit {
  @Input() piso!: PisoDTO;
  @Input() isFavoritoInit: boolean = false;

  private favoritoService = inject(FavoritoService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private alquilerService = inject(AlquilerService);

  isFavorito = signal<boolean>(false);
  precioCalculado = signal<number>(0);

  ngOnInit() {
    this.isFavorito.set(this.isFavoritoInit);
    this.calcularPrecioInteligente();
  }

  calcularPrecioInteligente() {
    const userId = this.authService.userId();
    const ocupantes = Math.max(this.piso.numOcupantesActual, 0);

    // Si no está logueado, es visitante (+1)
    if (!userId) {
      this.precioCalculado.set(this.piso.precioMes / (ocupantes + 1));
      return;
    }

    // Comprobamos si el usuario ya vive en ESTE piso
    this.alquilerService.alquilerActual(userId).subscribe({
      next: (alq) => {
        const pisoId = alq?.pisoId ?? alq?.piso?.id;
        if (pisoId === this.piso.id) {
          // Ya vive aquí (división exacta)
          this.precioCalculado.set(this.piso.precioMes / (ocupantes > 0 ? ocupantes : 1));
        } else {
          // Vive en otro lado, por lo que aquí sería nuevo (+1)
          this.precioCalculado.set(this.piso.precioMes / (ocupantes + 1));
        }
      },
      error: () => {
        // No tiene ningún alquiler, aquí sería nuevo (+1)
        this.precioCalculado.set(this.piso.precioMes / (ocupantes + 1));
      }
    });
  }

  toggleFavorito(event: Event) {
    event.stopPropagation();
    const userId = this.authService.userId();
    if (!userId) {
      this.notificationService.showInfo('Inicia sesión para añadir a favoritos.');
      return;
    }
    const estadoActual = this.isFavorito();
    this.isFavorito.set(!estadoActual);
    if (estadoActual) {
      this.favoritoService.eliminarFavorito(userId, this.piso.id).subscribe({ error: () => this.isFavorito.set(true) });
    } else {
      this.favoritoService.anadirFavorito(userId, this.piso.id).subscribe({ error: () => this.isFavorito.set(false) });
    }
  }
}