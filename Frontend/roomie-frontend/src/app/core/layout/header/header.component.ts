import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SearchService } from '../../../shared/services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-40 w-full bg-primary shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center cursor-pointer" routerLink="/home">
            <h1 class="text-2xl font-bold text-white tracking-tight">Roomie</h1>
          </div>

          <!-- Search Bar -->
          <div class="flex-1 max-w-lg relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              (input)="onSearch($event)"
              placeholder="Buscar ciudad, zona o piso..." 
              class="w-full pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-hover focus:outline-none text-textMain"
            >
          </div>

          <!-- Desktop Navigation / User Actions -->
          <div class="flex items-center gap-4">
            
            @if (!authService.isLoggedIn()) {
              <a 
                routerLink="/login" 
                class="text-white hover:text-gray-200 font-medium px-3 py-2 transition-colors hidden sm:block">
                Entrar
              </a>
              <a 
                routerLink="/registro" 
                class="bg-white text-primary hover:bg-gray-100 px-5 py-2 rounded-full font-bold transition-colors shadow-sm hidden sm:block">
                Registrarse
              </a>
            } @else {
              <!-- Fav/Profile Icons (White) -->
              <div class="flex items-center gap-4">
                
                <button class="text-white hover:text-alert transition-colors" title="Favoritos">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>

                <div class="flex flex-col items-end hidden sm:flex">
                  <span class="text-sm font-semibold text-white">
                    {{ authService.username() }}
                  </span>
                  @if (authService.role() === 'ADMINISTRADOR') {
                    <span class="bg-alert text-textMain text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">
                      Admin
                    </span>
                  }
                </div>
                
                <button 
                  (click)="onLogout()"
                  class="text-white hover:text-red-200 transition-colors flex items-center"
                  title="Cerrar sesión">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  searchService = inject(SearchService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.setSearchTerm(term);
    if(term.trim().length > 0) {
      this.router.navigate(['/resultados']);
    }
  }
}
