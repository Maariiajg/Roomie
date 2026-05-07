import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritoService } from '../../shared/services/favorito.service';
import { AuthService } from '../../core/auth/auth.service';
import { PisoCardComponent } from '../pisos/components/piso-card.component';
import { PisoService } from '../piso/piso.service';
import { forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-mis-favoritos',
    standalone: true,
    imports: [CommonModule, RouterModule, PisoCardComponent],
    template: `
    <div class="min-h-screen bg-bgMain pb-12 pt-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="mb-12">
          <h2 class="text-3xl font-black text-textMain tracking-tighter uppercase italic">Mis Favoritos</h2>
          <p class="text-primary font-bold text-xs uppercase tracking-[0.2em] mt-1">Pisos que te han gustado</p>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center py-40">
            <div class="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            <p class="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-6">Cargando favoritos...</p>
          </div>
        } @else if (favoritos().length === 0) {
          <div class="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center">
            <div class="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 border border-red-100">
              <svg class="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 class="text-3xl font-black text-textMain tracking-tight uppercase mb-4">No tienes pisos guardados</h3>
            <p class="text-gray-500 font-medium mb-8">Explora los pisos disponibles y guarda los que más te gusten haciendo clic en el corazón.</p>
            <a routerLink="/resultados" 
               class="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:bg-hover hover:-translate-y-1 transition-all active:scale-95">
              Explorar Pisos &rarr;
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (fav of favoritos(); track fav.id) {
              <app-piso-card [piso]="fav.piso" [isFavoritoInit]="true"></app-piso-card>
            }
          </div>
        }

      </div>
    </div>
  `
})
export class MisFavoritosComponent implements OnInit {
    private favoritoService = inject(FavoritoService);
    private authService = inject(AuthService);
    private pisoService = inject(PisoService);

    favoritos = signal<any[]>([]);
    isLoading = signal(true);

    ngOnInit() {
        const userId = this.authService.userId();
        if (userId) {
            this.favoritoService.getFavoritosByUsuario(userId).pipe(
                switchMap(favs => {
                    if (favs.length === 0) return of([]);
                    // Dado que el backend devuelve un PisoResumenDTO, pedimos el PisoDTO completo por ID
                    const requests = favs.map(fav => 
                        this.pisoService.getPisoById(fav.piso.id).pipe(
                            map(fullPiso => ({ ...fav, piso: fullPiso })),
                            catchError(() => of(fav)) // Fallback si falla la petición individual
                        )
                    );
                    return forkJoin(requests);
                })
            ).subscribe({
                next: (favsCompletos) => {
                    this.favoritos.set(favsCompletos);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                }
            });
        } else {
            this.isLoading.set(false);
        }
    }
}