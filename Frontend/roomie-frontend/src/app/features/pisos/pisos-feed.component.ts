import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PisoService } from '../piso/piso.service';
import { PisoDTO } from '../../core/models/piso.dto';
import { SearchService } from '../../shared/services/search.service';
import { FavoritoService } from '../../shared/services/favorito.service';
import { AuthService } from '../../core/auth/auth.service';
import { PisoCardComponent } from './components/piso-card.component';

@Component({
  selector: 'app-pisos-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PisoCardComponent],
  template: `
    <div class="min-h-screen bg-bgMain pb-12 overflow-x-hidden">

      <!-- Toolbar Superior -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-textMain tracking-tight uppercase">Explorar Pisos</h2>
          <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">{{ pisosFiltrados().length }} resultados encontrados</p>
        </div>
        <button (click)="toggleFiltros()" class="flex items-center gap-2 bg-textMain px-6 py-3 rounded-2xl shadow-lg font-black text-white hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-widest">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filtros
        </button>
      </div>

      <!-- Panel de Filtros (Sidebar deslizable) -->
      @if (showFiltros()) {
        <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" (click)="toggleFiltros()"></div>
        <aside class="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl p-8 flex flex-col overflow-y-auto">
          <div class="flex justify-between items-center mb-8">
            <h3 class="font-black text-textMain uppercase tracking-tight text-lg">Filtros</h3>
            <button (click)="toggleFiltros()" class="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="space-y-8 flex-grow">
            <div>
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Precio máx / persona</label>
              <input type="number" [(ngModel)]="filtros.precioMax" placeholder="Ej: 400"
                     class="w-full border border-gray-200 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
            </div>
            <div>
              <label class="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Extras</label>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="filtros.wifi" class="w-5 h-5 rounded accent-primary">
                  <span class="font-bold text-textMain">WiFi incluido</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="filtros.animales" class="w-5 h-5 rounded accent-primary">
                  <span class="font-bold text-textMain">Admite animales</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="filtros.garaje" class="w-5 h-5 rounded accent-primary">
                  <span class="font-bold text-textMain">Garaje</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 mt-8">
            <button (click)="aplicarFiltros()" class="w-full py-4 bg-textMain text-white rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all">Aplicar</button>
            <button (click)="resetFiltros()" class="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all">Limpiar</button>
          </div>
        </aside>
      }

      <!-- Grid Principal -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        @if (isLoading()) {
          <div class="flex flex-col items-center py-32">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cargando resultados...</p>
          </div>
        } @else if (pisosFiltrados().length === 0) {
          <div class="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-gray-100">
            <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg class="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 class="text-3xl font-black text-textMain tracking-tight uppercase">Sin resultados</h3>
            <p class="text-gray-500 font-bold max-w-xs mx-auto mt-4">No hay pisos que coincidan con tus filtros.</p>
            <button (click)="resetFiltros()" class="mt-8 text-primary font-black uppercase text-sm tracking-widest underline decoration-2 underline-offset-8">Limpiar todo</button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (piso of pisosFiltrados(); track piso.id) {
              <app-piso-card [piso]="piso" [isFavoritoInit]="isFavorito(piso.id)"></app-piso-card>
            }
          </div>
        }
      </section>
    </div>
  `
})
export class PisosFeedComponent implements OnInit {
  private pisoService     = inject(PisoService);
  private favoritoService = inject(FavoritoService);
  private authService     = inject(AuthService);
  searchService           = inject(SearchService);

  private pisos    = signal<PisoDTO[]>([]);
  isLoading        = signal<boolean>(true);
  showFiltros      = signal<boolean>(false);
  favoritosIds     = signal<number[]>([]);

  filtros: {
    precioMin: number | null;
    precioMax: number | null;
    wifi: boolean | null;
    animales: boolean | null;
    garaje: boolean | null;
    tabaco: boolean | null;
  } = {
    precioMin: null,
    precioMax: null,
    wifi: null,
    animales: null,
    garaje: null,
    tabaco: null
  };

  pisosFiltrados = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();
    return this.pisos().filter(piso => {
      const precioPersona = piso.precioMes / (piso.numOcupantesActual + 1);

      const matchSearch = !term ||
        piso.direccion.toLowerCase().includes(term) ||
        piso.poblacion?.toLowerCase().includes(term);
      if (!matchSearch) return false;

      if (this.filtros.precioMax && precioPersona > this.filtros.precioMax) return false;
      if (this.filtros.wifi     === true && !piso.wifi)     return false;
      if (this.filtros.animales === true && !piso.animales) return false;
      if (this.filtros.garaje   === true && !piso.garaje)   return false;

      return true;
    });
  });

  ngOnInit() {
    this.cargarPisos();
    const userId = this.authService.userId();
    if (userId) {
      this.favoritoService.getFavoritosByUsuario(userId).subscribe({
        next: (favs) => this.favoritosIds.set(favs.map((f: any) => f.piso.id))
      });
    }
  }

  cargarPisos() {
    this.isLoading.set(true);
    this.pisoService.getLibres().subscribe({
      next: (data) => { this.pisos.set(data); this.isLoading.set(false); },
      error: ()    => this.isLoading.set(false)
    });
  }

  toggleFiltros() { this.showFiltros.update(v => !v); }

  aplicarFiltros() {
    this.showFiltros.set(false);
    this.isLoading.set(true);
    const { precioMax, ...backendFiltros } = this.filtros;
    this.pisoService.filtrar(backendFiltros).subscribe({
      next: (data) => { this.pisos.set(data); this.isLoading.set(false); },
      error: ()    => this.isLoading.set(false)
    });
  }

  resetFiltros() {
    this.filtros = { precioMin: null, precioMax: null, wifi: null, animales: null, garaje: null, tabaco: null };
    this.showFiltros.set(false);
    this.cargarPisos();
  }

  isFavorito(idPiso: number): boolean {
    return this.favoritosIds().includes(idPiso);
  }
}
