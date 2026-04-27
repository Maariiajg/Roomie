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

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-black text-textMain tracking-tighter uppercase italic">Explorar Pisos</h2>
          <p class="text-primary font-bold text-xs uppercase tracking-[0.2em] mt-1">
            {{ pisosFiltrados().length }} resultados encontrados
          </p>
        </div>
        <button (click)="toggleFiltros()" 
                class="flex items-center gap-2 bg-textMain px-8 py-4 rounded-2xl shadow-xl font-black text-white hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-widest">
          <svg class="w-4 h-4 text-alert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filtros
        </button>
      </div>

      @if (showFiltros()) {
        <div class="fixed inset-0 bg-textMain/40 z-[100] backdrop-blur-md transition-opacity" (click)="toggleFiltros()"></div>
        <aside class="fixed right-0 top-0 h-full w-80 bg-alert/95 z-[110] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] p-8 flex flex-col animate-in slide-in-from-right duration-300">
          <div class="flex justify-between items-center mb-10">
            <h3 class="font-black text-textMain uppercase tracking-tighter text-2xl italic">Filtros</h3>
            <button (click)="toggleFiltros()" class="p-2 rounded-xl bg-textMain/10 hover:bg-textMain/20 transition-colors">
              <svg class="w-6 h-6 text-textMain" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="space-y-8 flex-grow overflow-y-auto pr-2">
            <div>
              <label class="text-[10px] font-black text-textMain/60 uppercase tracking-widest block mb-3">Precio máx / persona</label>
              <div class="relative">
                <input type="number" [(ngModel)]="filtros.precioMax" placeholder="Ej: 450"
                       class="w-full bg-white border-none rounded-2xl p-4 font-black text-textMain outline-none shadow-inner focus:ring-4 ring-textMain/10 transition-all">
                <span class="absolute right-4 top-4 font-black text-textMain/30">€</span>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black text-textMain/60 uppercase tracking-widest block mb-4">Comodidades</label>
              <div class="space-y-4">
                <label class="flex items-center justify-between p-4 bg-white/50 rounded-2xl cursor-pointer hover:bg-white transition-colors group">
                  <span class="font-bold text-textMain uppercase text-xs tracking-wide">WiFi Alta Velocidad</span>
                  <input type="checkbox" [(ngModel)]="filtros.wifi" class="w-6 h-6 rounded-lg accent-textMain border-none shadow-sm">
                </label>
                <label class="flex items-center justify-between p-4 bg-white/50 rounded-2xl cursor-pointer hover:bg-white transition-colors group">
                  <span class="font-bold text-textMain uppercase text-xs tracking-wide">Mascotas permitidas</span>
                  <input type="checkbox" [(ngModel)]="filtros.animales" class="w-6 h-6 rounded-lg accent-textMain border-none shadow-sm">
                </label>
                <label class="flex items-center justify-between p-4 bg-white/50 rounded-2xl cursor-pointer hover:bg-white transition-colors group">
                  <span class="font-bold text-textMain uppercase text-xs tracking-wide">Plaza de Garaje</span>
                  <input type="checkbox" [(ngModel)]="filtros.garaje" class="w-6 h-6 rounded-lg accent-textMain border-none shadow-sm">
                </label>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black text-textMain/60 uppercase tracking-widest block mb-4">Hábito de fumador</label>
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 cursor-pointer">
                  <input type="radio" name="tabaco" [value]="null" [(ngModel)]="filtros.tabaco" class="w-5 h-5 accent-textMain">
                  <span class="text-xs font-bold text-textMain uppercase">Cualquiera</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 cursor-pointer">
                  <input type="radio" name="tabaco" [value]="true" [(ngModel)]="filtros.tabaco" class="w-5 h-5 accent-textMain">
                  <span class="text-xs font-bold text-textMain uppercase">Permitido fumar</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/30 cursor-pointer">
                  <input type="radio" name="tabaco" [value]="false" [(ngModel)]="filtros.tabaco" class="w-5 h-5 accent-textMain">
                  <span class="text-xs font-bold text-textMain uppercase">Espacio sin humos</span>
                </label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-10">
            <button (click)="resetFiltros()" 
                    class="py-5 bg-textMain/10 text-textMain rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-textMain/20 transition-all">
              Limpiar
            </button>
            <button (click)="aplicarFiltros()" 
                    class="py-5 bg-textMain text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all">
              Ver Resultados
            </button>
          </div>
        </aside>
      }

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        @if (isLoading()) {
          <div class="flex flex-col items-center py-40">
            <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-6">Buscando tu hogar...</p>
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
  private pisoService = inject(PisoService);
  private favoritoService = inject(FavoritoService);
  private authService = inject(AuthService);
  public searchService = inject(SearchService);

  pisos = signal<PisoDTO[]>([]);
  isLoading = signal<boolean>(true);
  showFiltros = signal<boolean>(false);
  favoritosIds = signal<number[]>([]);

  filtros = {
    precioMin: null,
    precioMax: null,
    wifi: null,
    animales: null,
    garaje: null,
    tabaco: null as boolean | null
  };

  // Filtrado reactivo combinado (Search + Precio Local)
  pisosFiltrados = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();
    return this.pisos().filter(piso => {
      const matchSearch = !term ||
        piso.direccion.toLowerCase().includes(term);

      // El filtro de precio máximo por persona se aplica localmente sobre los resultados cargados
      const precioPersona = piso.precioMes / (piso.numOcupantesActual + 1);
      const matchPrecio = !this.filtros.precioMax || precioPersona <= this.filtros.precioMax;

      return matchSearch && matchPrecio;
    });
  });

  ngOnInit() {
    this.cargarPisos();
    this.cargarFavoritos();
  }

  cargarPisos() {
    this.isLoading.set(true);
    this.pisoService.getLibres().subscribe({
      next: (data) => { this.pisos.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  cargarFavoritos() {
    const userId = this.authService.userId();
    if (userId) {
      this.favoritoService.getFavoritosByUsuario(userId).subscribe({
        next: (favs) => this.favoritosIds.set(favs.map((f: any) => f.piso.id))
      });
    }
  }

  toggleFiltros() { this.showFiltros.update(v => !v); }

  aplicarFiltros() {
    this.showFiltros.set(false);
    this.isLoading.set(true);
    // Llamada al endpoint de filtrado del backend (sin precioMax porque se hace local para precisión)
    const { precioMax, ...params } = this.filtros;
    this.pisoService.filtrar(params).subscribe({
      next: (data) => {
        this.pisos.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
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