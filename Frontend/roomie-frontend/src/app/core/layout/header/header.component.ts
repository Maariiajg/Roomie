import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { SearchService } from '../../../shared/services/search.service';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../../shared/components/toast/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="sticky top-0 z-50 w-full bg-primary shadow-lg border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div class="flex items-center justify-between h-20 gap-4 lg:gap-8">

          <!-- ═══════════════════════════════════════
               BLOQUE IZQUIERDO — Logo
          ═══════════════════════════════════════ -->
          <div
            class="flex-shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            (click)="onLogoClick()"
            title="Ir al inicio">
            <img src="/imagenes/logo.svg" alt="Roomie Logo" class="h-10 w-auto">
          </div>

          <!-- ═══════════════════════════════════════
               BLOQUE CENTRAL — Buscador
               Visible solo en /resultados o navega allí al escribir
          ═══════════════════════════════════════ -->
          <div class="flex-1 max-w-xl relative hidden md:block">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              id="header-search-input"
              type="text"
              [value]="searchService.searchTerm()"
              (input)="onSearch($event)"
              (keydown.enter)="onEnterSearch($event)"
              placeholder="Busca tu zona, ciudad o compañero..."
              class="w-full pl-12 pr-6 py-3 rounded-full border-none focus:ring-4 focus:ring-hover/30
                     focus:outline-none text-textMain font-bold placeholder:text-gray-300
                     shadow-inner bg-white transition-shadow"
            >
          </div>

          <!-- ═══════════════════════════════════════
               BLOQUE DERECHO — Acciones / Usuario
          ═══════════════════════════════════════ -->
          <div class="flex items-center gap-3 sm:gap-5">

            <!-- Buscador móvil (solo en < md) -->
            <button
              id="header-search-mobile-btn"
              (click)="toggleMobileSearch()"
              class="md:hidden text-white hover:text-white/80 transition-all active:scale-90"
              title="Buscar">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <!-- Favoritos -->
            <button
              id="header-favorites-btn"
              (click)="goToFavorites()"
              class="text-white hover:text-red-200 transition-all active:scale-90"
              title="Favoritos">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5
                     4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>

            <!-- Perfil -->
            <button
              id="header-profile-btn"
              (click)="goToProfile()"
              class="text-white hover:text-white/70 transition-all active:scale-90"
              title="Mi Perfil">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>

            <!-- ─── ZONA AUTENTICADA ─── -->
            @if (authService.isLoggedIn()) {

              <!-- Separador vertical -->
              <div class="h-8 w-[2px] bg-white/20 hidden sm:block"></div>

              <!-- Info de usuario + badges (solo >= lg) -->
              <div class="flex-col items-end hidden lg:flex">
                <span class="text-xs font-black text-white uppercase tracking-widest leading-none">
                  {{ authService.username() }}
                </span>
                <div class="flex gap-1.5 items-center mt-1.5 flex-wrap justify-end">

                  @if (authService.role() === 'ADMINISTRADOR') {
                    <!-- Badge Modo Admin -->
                    <span class="text-[8px] bg-alert text-textMain px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                      Modo Admin
                    </span>
                    <!-- Enlace Panel Admin -->
                    <a
                      id="header-admin-panel-link"
                      routerLink="/admin"
                      class="text-[8px] bg-secondary/30 hover:bg-secondary/50 text-white px-2 py-0.5
                             rounded-full font-black uppercase tracking-tighter cursor-pointer transition-colors">
                      Panel Admin
                    </a>
                  }

                  <!-- Mis Alquileres -->
                  <a
                    id="header-mis-alquileres-link"
                    routerLink="/mis-alquileres"
                    class="text-[8px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5
                           rounded-full font-black uppercase tracking-tighter cursor-pointer transition-colors">
                    Mis Alquileres
                  </a>

                </div>
              </div>

              <!-- Botón Logout -->
              <button
                id="header-logout-btn"
                (click)="onLogout()"
                class="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl text-white transition-all active:scale-90"
                title="Cerrar sesión">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>

            } @else {
              <!-- ─── ZONA PÚBLICA ─── -->
              <button
                id="header-entrar-btn"
                routerLink="/login"
                class="bg-white text-primary font-black px-5 sm:px-6 py-2.5 rounded-2xl shadow-xl
                       hover:bg-gray-50 transition-all text-sm uppercase tracking-widest hidden sm:block active:scale-95">
                Entrar
              </button>
            }

          </div>
        </div>

        <!-- ═══════════════════════════════════════
             BARRA DE BÚSQUEDA MÓVIL (expandible)
        ═══════════════════════════════════════ -->
        @if (mobileSearchOpen()) {
          <div class="md:hidden pb-4 px-1 animate-[fadeInDown_0.2s_ease-out]">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                id="header-search-mobile-input"
                type="text"
                [value]="searchService.searchTerm()"
                (input)="onSearch($event)"
                (keydown.enter)="onEnterSearch($event)"
                placeholder="Busca zona, ciudad..."
                autofocus
                class="w-full pl-12 pr-6 py-3 rounded-full border-none focus:ring-4 focus:ring-hover/30
                       focus:outline-none text-textMain font-bold placeholder:text-gray-300
                       shadow-inner bg-white"
              >
            </div>
          </div>
        }

      </div>
    </header>
  `,
  styles: `
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `
})
export class HeaderComponent {
  authService  = inject(AuthService);
  searchService = inject(SearchService);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private notificationService = inject(NotificationService);

  /** Controla si el buscador móvil está expandido */
  mobileSearchOpen = signal(false);

  toggleMobileSearch() {
    this.mobileSearchOpen.update(v => !v);
  }

  // ─── Navegación desde logo ───────────────────────────────
  onLogoClick() {
    this.router.navigate(this.authService.isLoggedIn() ? ['/resultados'] : ['/home']);
  }

  // ─── Favoritos ───────────────────────────────────────────
  goToFavorites() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showInfo('Inicia sesión para acceder a tus favoritos.');
    }
    // TODO: navegar a /mis-favoritos cuando el módulo esté listo
  }

  // ─── Perfil ──────────────────────────────────────────────
  goToProfile() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showInfo('Debes iniciar sesión para ver tu perfil.');
      return;
    }
    this.router.navigate(['/mi-perfil']);
  }

  // ─── Logout ──────────────────────────────────────────────
  onLogout() {
    this.authService.logout();
    this.notificationService.showSuccess('Sesión cerrada correctamente.');
    this.router.navigate(['/home']);
  }

  // ─── Búsqueda ────────────────────────────────────────────
  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.setSearchTerm(term);

    // Navegar a /resultados automáticamente al empezar a buscar
    if (term.trim().length > 0 && !this.router.url.includes('/resultados')) {
      this.router.navigate(['/resultados']);
    }
  }

  /**
   * Al pulsar Enter:
   * - Admin + número → navega al perfil de ese usuario por ID
   * - Admin + texto  → busca usuario por nombreUsuario
   * - Resto          → confirma búsqueda en /resultados
   */
  onEnterSearch(event: any) {
    const term: string = event.target.value?.trim();
    if (!term) return;

    if (this.authService.role() === 'ADMINISTRADOR') {
      const isNumeric = /^\d+$/.test(term);
      if (isNumeric) {
        this.router.navigate(['/usuario', term]);
        return;
      }
      this.usuarioService.getUsuarios().subscribe(users => {
        const found = users.find(u => u.nombreUsuario.toLowerCase() === term.toLowerCase());
        if (found) {
          this.router.navigate(['/usuario', found.id]);
        } else {
          this.notificationService.showInfo(`No se encontró el usuario "${term}".`);
        }
      });
    } else {
      // Para usuarios normales: asegura que estén en /resultados
      if (!this.router.url.includes('/resultados')) {
        this.router.navigate(['/resultados']);
      }
    }
    // Cerrar buscador móvil si estaba abierto
    this.mobileSearchOpen.set(false);
  }
}
