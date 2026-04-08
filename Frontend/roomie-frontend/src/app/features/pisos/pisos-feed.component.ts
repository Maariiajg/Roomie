import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PisoService } from '../piso/piso.service';
import { PisoDTO } from '../../core/models/piso.dto';
import { SearchService } from '../../shared/services/search.service';
import { FavoritoService } from '../../shared/services/favorito.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-pisos-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-bgMain pb-12 overflow-x-hidden">
      
      <!-- Toolbar Superior / Resultados Count -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-textMain tracking-tight uppercase">Explorar Pisos</h2>
          <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">{{ pisosFiltrados().length }} resultados encontrados</p>
        </div>
        
        <button (click)="toggleFiltros()" class="flex items-center gap-2 bg-textMain px-6 py-3 rounded-2xl shadow-lg shadow-black/10 font-black text-white hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-widest">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filtros
        </button>
      </div>

      <!-- Feed Grid -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        @if (isLoading()) {
          <div class="flex flex-col items-center py-32">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cargando resultados...</p>
          </div>
        } @else if (pisosFiltrados().length === 0) {
          <div class="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-gray-100 animate-fade-in">
             <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg class="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
             <h3 class="text-3xl font-black text-textMain tracking-tight uppercase">Sin resultados</h3>
             <p class="text-gray-500 font-bold max-w-xs mx-auto mt-4 px-6">No hay pisos que coincidan con tu presupuesto o preferencias actuales.</p>
             <button (click)="resetFiltros()" class="mt-8 text-primary font-black uppercase text-sm tracking-widest underline decoration-2 underline-offset-8">Limpiar todo</button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (piso of pisosFiltrados(); track piso.id) {
              <div class="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-50 flex flex-col h-full group">
                
                <!-- Carrusel Mockup Area -->
                <div class="relative h-64 overflow-hidden bg-gray-100">
                  <div class="absolute inset-0 transition-transform duration-700 ease-in-out flex transform" [style.transform]="'translateX(-' + (currentImageIndexes()[piso.id] || 0) * 100 + '%)'">
                     <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600" class="w-full h-full object-cover shrink-0" alt="Piso">
                     <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" class="w-full h-full object-cover shrink-0" alt="Habitacion">
                     <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" class="w-full h-full object-cover shrink-0" alt="Salon">
                  </div>
                  
                  <!-- Controles Carrusel -->
                  <div class="absolute inset-x-0 inset-y-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button (click)="$event.stopPropagation(); prevImage(piso.id)" class="bg-white/90 p-2.5 rounded-full shadow-lg hover:scale-110 transition-all active:scale-95">
                      <svg class="w-4 h-4 text-textMain" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button (click)="$event.stopPropagation(); nextImage(piso.id)" class="bg-white/90 p-2.5 rounded-full shadow-lg hover:scale-110 transition-all active:scale-95">
                      <svg class="w-4 h-4 text-textMain" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>

                  <!-- Botón Favoritos -->
                  <button (click)="$event.stopPropagation(); toggleFavorito(piso.id)" class="absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all active:scale-90" [ngClass]="isFavorito(piso.id) ? 'bg-red-50 text-red-500 shadow-xl' : 'bg-black/20 hover:bg-black/40 text-white'">
                    <svg class="w-5 h-5 transition-colors" [attr.fill]="isFavorito(piso.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </button>

                  <!-- Badge Precio -->
                  <div class="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-2xl flex flex-col border border-white/20 transform group-hover:scale-105 transition-transform">
                    <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-2">Precio por Persona</span>
                    <div class="flex items-baseline gap-1">
                      <span class="font-black text-3xl leading-none text-primary">
                        {{ (piso.precioMes / (piso.numOcupantesActual + 1)) | currency:'EUR':'symbol':'1.0-0' }}
                      </span>
                      <span class="text-sm font-bold text-gray-500">/mes</span>
                    </div>
                  </div>
                </div>

                <!-- Info Tarjeta -->
                <div class="p-8 flex flex-col flex-grow cursor-pointer" [routerLink]="['/piso', piso.id]">
                  <h3 class="font-black text-lg text-textMain line-clamp-1 mb-1 uppercase tracking-tight">{{ piso.direccion }}</h3>
                  <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Castellón, España</p>

                  <!-- Iconos Profesionales (Lucide Pattern) -->
                  <div class="grid grid-cols-4 gap-3 mb-8">
                    <div class="flex flex-col items-center p-3 rounded-2xl shadow-sm border border-gray-50 flex-1 h-14 justify-center" [ngClass]="piso.wifi ? 'bg-primary/5 text-textMain' : 'bg-gray-50 text-gray-300 opacity-40'">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>
                      </svg>
                    </div>
                    <div class="flex flex-col items-center p-3 rounded-2xl shadow-sm border border-gray-50 flex-1 h-14 justify-center" [ngClass]="piso.animales ? 'bg-secondary/10 text-textMain' : 'bg-gray-50 text-gray-300 opacity-40'">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path d="M11 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M17 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M21 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M12 13a5 5 0 0 1 5 5c0 1.1-.9 2-2 2h-6a2 2 0 0 1-2-2 5 5 0 0 1 5-5Z"/>
                      </svg>
                    </div>
                    <div class="flex flex-col items-center p-3 rounded-2xl shadow-sm border border-gray-50 flex-1 h-14 justify-center" [ngClass]="piso.garaje ? 'bg-alert/20 text-textMain' : 'bg-gray-50 text-gray-300 opacity-40'">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 10l2-5h10l2 5"/>
                      </svg>
                    </div>
                    <div class="flex flex-col items-center p-3 rounded-2xl shadow-sm border border-gray-50 flex-1 h-14 justify-center" [ngClass]="piso.tabaco ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'">
                       @if (piso.tabaco) {
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                           <path d="M2.5 14h15"/><path d="M2.5 18h15"/><path d="M17.5 14v4"/><path d="M17.5 14h3v4h-3"/><path d="M18 10c.5-.5 1-1.5.5-2.5a3 3 0 0 1 3-3"/>
                         </svg>
                       } @else {
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                           <path d="M2.5 14h15"/><path d="M2.5 18h15"/><path d="M17.5 14v4"/><path d="M17.5 14h3v4h-3"/><line x1="2" y1="2" x2="22" y2="22"/>
                         </svg>
                       }
                    </div>
                  </div>

                  <div class="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                    <div class="flex flex-col">
                       <span class="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">VACANTES</span>
                       <span class="font-black text-sm text-textMain">{{ piso.plazasLibres }} PLAZAS</span>
                    </div>
                    <div class="flex flex-col">
                       <span class="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">COMPAÑEROS</span>
                       <span class="font-black text-sm text-textMain">{{ piso.numOcupantesActual }} VIVIENDO</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Sidebar de Filtros (Página 3.1) -->
      @if (showFiltros()) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <!-- Overlay -->
          <div (click)="toggleFiltros()" class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in shadow-inner"></div>
          
          <!-- Panel Amarillo Lateral -->
          <div class="relative w-full max-w-sm sm:max-w-md bg-alert/90 backdrop-blur-xl h-full shadow-[-30px_0_60px_rgba(0,0,0,0.1)] flex flex-col p-10 pt-16 transform animate-slide-in-right overflow-y-auto">
            <button (click)="toggleFiltros()" class="absolute top-10 right-10 text-textMain hover:scale-125 transition-transform p-2 bg-white/20 rounded-full">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h2 class="text-4xl font-black text-textMain mb-1 underline decoration-primary decoration-8 underline-offset-[-2px] uppercase tracking-tighter">Filtros</h2>
            <p class="text-textMain/60 font-black uppercase tracking-widest text-[10px] mb-12">Personaliza tu búsqueda</p>

            <div class="space-y-12">
              <!-- Rango de Precio -->
              <div class="space-y-6">
                <label class="block text-xs font-black uppercase tracking-widest text-textMain/80">Presupuesto por Persona</label>
                <div class="flex gap-4 items-center">
                   <input type="number" [(ngModel)]="filtros.precioMax" placeholder="Máximo presupuesto" class="flex-grow bg-white border-0 shadow-inner rounded-2xl py-5 px-6 outline-none focus:ring-4 focus:ring-primary/20 font-black text-primary text-xl">
                   <span class="font-black text-textMain">€</span>
                </div>
              </div>

              <!-- Comodidades con Checkboxes Custom -->
              <div class="space-y-6">
                <label class="block text-xs font-black uppercase tracking-widest text-textMain/80">Equipamiento</label>
                <div class="grid grid-cols-1 gap-4">
                   <label class="flex justify-between items-center bg-white/40 p-5 rounded-3xl cursor-pointer hover:bg-white/60 transition-all border border-black/5 group">
                      <span class="font-black text-textMain uppercase tracking-tight">WiFi Incluido</span>
                      <div class="w-8 h-8 rounded-xl border-4 border-textMain flex items-center justify-center transition-all group-active:scale-90" [class.bg-textMain]="filtros.wifi">
                        @if (filtros.wifi) { <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> }
                      </div>
                      <input type="checkbox" [(ngModel)]="filtros.wifi" class="hidden">
                   </label>

                   <label class="flex justify-between items-center bg-white/40 p-5 rounded-3xl cursor-pointer hover:bg-white/60 transition-all border border-black/5 group">
                      <span class="font-black text-textMain uppercase tracking-tight">Mascotas</span>
                      <div class="w-8 h-8 rounded-xl border-4 border-textMain flex items-center justify-center transition-all group-active:scale-90" [class.bg-textMain]="filtros.animales">
                        @if (filtros.animales) { <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> }
                      </div>
                      <input type="checkbox" [(ngModel)]="filtros.animales" class="hidden">
                   </label>

                   <label class="flex justify-between items-center bg-white/40 p-5 rounded-3xl cursor-pointer hover:bg-white/60 transition-all border border-black/5 group">
                      <span class="font-black text-textMain uppercase tracking-tight">Garaje Público</span>
                      <div class="w-8 h-8 rounded-xl border-4 border-textMain flex items-center justify-center transition-all group-active:scale-90" [class.bg-textMain]="filtros.garaje">
                        @if (filtros.garaje) { <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> }
                      </div>
                      <input type="checkbox" [(ngModel)]="filtros.garaje" class="hidden">
                   </label>
                </div>
              </div>

              <!-- Radio Tabaco -->
              <div class="space-y-6">
                <label class="block text-xs font-black uppercase tracking-widest text-textMain/80">Ambiente de convivencia</label>
                <div class="flex flex-col gap-3">
                   <div (click)="filtros.tabaco = null" class="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2" [ngClass]="filtros.tabaco === null ? 'bg-primary/20 border-primary' : 'bg-transparent border-black/10'">
                      <div class="w-4 h-4 rounded-full border-4 border-textMain" [class.bg-textMain]="filtros.tabaco === null"></div>
                      <span class="font-black text-textMain uppercase text-sm">Cualquiera</span>
                   </div>
                   <div (click)="filtros.tabaco = true" class="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2" [ngClass]="filtros.tabaco === true ? 'bg-primary/20 border-primary' : 'bg-transparent border-black/10'">
                      <div class="w-4 h-4 rounded-full border-4 border-textMain" [class.bg-textMain]="filtros.tabaco === true"></div>
                      <span class="font-black text-textMain uppercase text-sm">Permitido Fumar</span>
                   </div>
                   <div (click)="filtros.tabaco = false" class="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2" [ngClass]="filtros.tabaco === false ? 'bg-primary/20 border-primary' : 'bg-transparent border-black/10'">
                      <div class="w-4 h-4 rounded-full border-4 border-textMain" [class.bg-textMain]="filtros.tabaco === false"></div>
                      <span class="font-black text-textMain uppercase text-sm">No fumadores (Eco)</span>
                   </div>
                </div>
              </div>
            </div>

            <div class="mt-auto pt-16 flex gap-4">
               <button (click)="resetFiltros()" class="flex-1 py-5 font-black text-textMain bg-white/50 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all uppercase text-xs tracking-widest">Limpiar</button>
               <button (click)="aplicarFiltros()" class="flex-[1.5] py-5 font-black bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/40 hover:bg-hover transition-all uppercase text-xs tracking-widest">Ver Resultados</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-in-right { animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  `]
})
export class PisosFeedComponent implements OnInit {
  private pisoService = inject(PisoService);
  private favoritoService = inject(FavoritoService);
  private authService = inject(AuthService);
  searchService = inject(SearchService);

  private pisos = signal<PisoDTO[]>([]);
  isLoading = signal<boolean>(true);
  showFiltros = signal<boolean>(false);
  
  favoritosIds = signal<number[]>([]);
  currentImageIndexes = signal<{[key: number]: number}>({});

  filtros: {
    precioMin: number | null,
    precioMax: number | null,
    wifi: boolean | null,
    animales: boolean | null,
    garaje: boolean | null,
    tabaco: boolean | null
  } = {
    precioMin: null,
    precioMax: 9999,
    wifi: null,
    animales: null,
    garaje: null,
    tabaco: null
  };

  pisosFiltrados = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();
    const todos = this.pisos();
    
    // Capa de filtrado estricto en el frontend
    return todos.filter(piso => {
       const precioPersona = piso.precioMes / (piso.numOcupantesActual + 1);
       
       // Filtro por término de búsqueda
       const matchesSearch = !term || 
         piso.direccion.toLowerCase().includes(term) || 
         piso.id.toString().includes(term);

       if (!matchesSearch) return false;

       // Filtro por precio por persona (Estricto)
       if (this.filtros.precioMax && precioPersona > this.filtros.precioMax) return false;

       // Filtro por WiFI
       if (this.filtros.wifi === true && !piso.wifi) return false;
       
       // Filtro por Mascotas
       if (this.filtros.animales === true && !piso.animales) return false;

       // Filtro por Garaje
       if (this.filtros.garaje === true && !piso.garaje) return false;

       // Filtro por Tabaco
       if (this.filtros.tabaco !== null && piso.tabaco !== this.filtros.tabaco) return false;

       return true;
    });
  });

  ngOnInit() {
    this.cargarPisos();
  }

  cargarPisos() {
    this.isLoading.set(true);
    this.pisoService.getLibres().subscribe({
      next: (data) => {
        this.pisos.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleFiltros() {
    this.showFiltros.set(!this.showFiltros());
  }

  aplicarFiltros() {
    this.showFiltros.set(false);
    this.isLoading.set(true);
    // Primero llamamos al backend para un filtrado general de ahorro de red
    this.pisoService.filtrar(this.filtros).subscribe({
      next: (data) => {
        this.pisos.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetFiltros() {
    this.filtros = {
      precioMin: null,
      precioMax: 9999,
      wifi: null,
      animales: null,
      garaje: null,
      tabaco: null
    };
    this.showFiltros.set(false);
    this.cargarPisos();
  }

  isFavorito(idPiso: number): boolean {
    return this.favoritosIds().includes(idPiso);
  }

  toggleFavorito(idPiso: number) {
    const ids = this.favoritosIds();
    if (ids.includes(idPiso)) {
      this.favoritosIds.set(ids.filter(id => id !== idPiso));
    } else {
      this.favoritosIds.set([...ids, idPiso]);
    }
  }

  nextImage(idPiso: number) {
    const idx = this.currentImageIndexes()[idPiso] || 0;
    this.currentImageIndexes.update(map => ({...map, [idPiso]: (idx + 1) % 3}));
  }

  prevImage(idPiso: number) {
    const idx = this.currentImageIndexes()[idPiso] || 0;
    this.currentImageIndexes.update(map => ({...map, [idPiso]: (idx - 1 + 3) % 3}));
  }
}
