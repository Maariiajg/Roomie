import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PisoService } from '../piso/piso.service';
import { PisoDTO } from '../../core/models/piso.dto';
import { SearchService } from '../../shared/services/search.service';

@Component({
  selector: 'app-pisos-feed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain pb-12 pt-8">
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-alert bg-opacity-10 p-6 rounded-2xl border border-alert border-opacity-30">
        <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 class="text-3xl font-bold text-textMain">Pisos Disponibles</h2>
            <p class="text-gray-600 mt-2 text-lg">Explora los resultados de tu búsqueda en Roomie.</p>
          </div>
          @if (searchService.searchTerm()) {
            <div class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>Viendo resultados para: "{{ searchService.searchTerm() }}"</span>
            </div>
          }
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        } @else if (pisosFiltrados().length === 0) {
          <div class="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-textMain">No encontramos lo que buscas</h3>
            <p class="text-gray-500 mt-2 text-lg">Prueba con otros términos o limpia tu búsqueda en el menú superior.</p>
            <button (click)="limpiarBusqueda()" class="mt-6 text-primary font-bold hover:underline">Ver todos los pisos</button>
          </div>
        } @else {
          <!-- Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (piso of pisosFiltrados(); track piso.id) {
              <div class="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
                <!-- Foto Placeholder -->
                <div class="h-56 bg-gray-100 relative overflow-hidden">
                  <div class="absolute inset-0 bg-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div class="absolute inset-0 flex items-center justify-center text-primary opacity-20 transform group-hover:scale-110 transition-transform">
                    <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                  </div>
                  <!-- Badge ID -->
                  <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                    Ref: {{ piso.id }}
                  </div>
                  <!-- Price Badge Mobile -->
                  <div class="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg md:hidden">
                    <p class="text-primary font-black text-xl">
                      {{ piso.precioMesPersona | currency:'EUR':'symbol':'1.0-0' }}<span class="text-xs font-medium text-gray-500 ml-1">/mes</span>
                    </p>
                  </div>
                </div>

                <div class="p-6 flex-grow flex flex-col">
                  <div class="mb-4">
                    <h3 class="font-bold text-xl text-textMain line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors" [title]="piso.direccion">
                      {{ piso.direccion }}
                    </h3>
                    <p class="text-sm text-gray-400 flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Castellón, España
                    </p>
                  </div>

                  <div class="hidden md:block mb-6">
                    <p class="text-primary font-black text-3xl">
                      {{ piso.precioMesPersona | currency:'EUR':'symbol':'1.0-0' }}<span class="text-sm font-normal text-gray-500 ml-1">/mes/pers.</span>
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-700 mt-auto pt-6 border-t border-gray-50">
                    <div class="flex items-center gap-2">
                       <div class="bg-primary/10 p-1.5 rounded-lg">
                        <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                       </div>
                      <span>{{ piso.numTotalHabitaciones }} Habs.</span>
                    </div>
                    <div class="flex items-center gap-2 text-secondary">
                       <div class="bg-secondary/10 p-1.5 rounded-lg">
                        <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                       </div>
                      <span>{{ piso.plazasLibres }} Libres</span>
                    </div>
                  </div>
                  
                  <div class="mt-4 flex items-center justify-between">
                     <div class="flex items-center gap-2">
                        <span class="flex h-2 w-2 relative">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2 bg-alert border border-white"></span>
                        </span>
                        <span class="text-xs font-bold text-gray-500 uppercase">{{ piso.numOcupantesActual }} Habitantes</span>
                     </div>
                     <button class="text-primary hover:text-hover text-sm font-black uppercase tracking-wider transition-colors">Ver Detalles</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `
})
export class PisosFeedComponent implements OnInit {
  private pisoService = inject(PisoService);
  searchService = inject(SearchService);

  private pisos = signal<PisoDTO[]>([]);
  isLoading = signal<boolean>(true);

  pisosFiltrados = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();
    const todos = this.pisos();
    
    if (!term) return todos;

    return todos.filter(piso => 
      piso.direccion.toLowerCase().includes(term) || 
      piso.descripcion?.toLowerCase().includes(term) ||
      piso.id.toString().includes(term)
    );
  });

  ngOnInit() {
    this.cargarPisos();
  }

  cargarPisos() {
    this.pisoService.getLibres().subscribe({
      next: (data: PisoDTO[]) => {
        this.pisos.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching pisos', err);
        this.isLoading.set(false);
      }
    });
  }

  limpiarBusqueda() {
    this.searchService.setSearchTerm('');
  }
}
