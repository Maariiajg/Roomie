import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SearchService } from '../../../shared/services/search.service';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../../shared/components/toast/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-50 w-full bg-primary shadow-lg border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 lg:px-10">
        <div class="flex items-center justify-between h-20 gap-8">
          
          <!-- Logo BLOQUE IZQUIERDO -->
          <div class="flex-shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105" (click)="onLogoClick()">
            <img src="/imagenes/logo.svg" alt="Roomie Logo" class="h-10 w-auto">
          </div>

          <!-- Buscador BLOQUE CENTRAL -->
          <div class="flex-1 max-w-xl relative hidden md:block">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              (input)="onSearch($event)"
              (keydown.enter)="handleAdminSearch($event)"
              placeholder="Busca tu zona, ciudad o compañero..." 
              class="w-full pl-12 pr-6 py-3 rounded-full border-none focus:ring-4 focus:ring-hover/30 focus:outline-none text-textMain font-bold placeholder:text-gray-300 shadow-inner bg-white"
            >
          </div>

          <!-- Iconos / Acciones BLOQUE DERECHO -->
          <div class="flex items-center gap-6">
            
            <button (click)="checkSession()" class="text-white hover:text-red-200 transition-all active:scale-90" title="Favoritos">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>

            <button (click)="checkSession()" class="text-white hover:text-gray-200 transition-all active:scale-90" title="Mi Perfil">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>

            @if (authService.isLoggedIn()) {
               <div class="h-8 w-[2px] bg-white/20 hidden sm:block mx-1"></div>
               <div class="flex flex-col items-end hidden lg:flex">
                  <span class="text-xs font-black text-white uppercase tracking-widest leading-none">{{ authService.username() }}</span>
                  <div class="flex gap-2 items-center mt-1">
                    @if (authService.role() === 'ADMINISTRADOR') {
                      <span class="text-[8px] bg-alert text-textMain px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Modo Admin</span>
                    }
                    <a routerLink="/mis-alquileres" class="text-[8px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter cursor-pointer transition-colors">Mis Alquileres</a>
                  </div>
               </div>

               <button (click)="onLogout()" class="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl text-white transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               </button>
            } @else {
               <button routerLink="/login" class="bg-white text-primary font-black px-6 py-2.5 rounded-2xl shadow-xl hover:bg-gray-50 transition-all text-sm uppercase tracking-widest hidden sm:block">Entrar</button>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: ``
})
export class HeaderComponent {
  authService = inject(AuthService);
  searchService = inject(SearchService);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private notificationService = inject(NotificationService);

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  onLogoClick() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/resultados']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  checkSession() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showInfo('Debes iniciar sesión primero para acceder a esta sección.');
    } else {
      // Futuro: navegar a favs o perfil
      if (this.authService.role() === 'ADMINISTRADOR') {
          // Si es admin, perfil lleva a su gestión o algo? 
          // Por ahora solo mostramos que está logueado
      }
    }
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.setSearchTerm(term);
    
    if(term.trim().length > 0 && !this.router.url.includes('/resultados')) {
      this.router.navigate(['/resultados']);
    }
  }

  handleAdminSearch(event: any) {
    const term = event.target.value;
    if (this.authService.role() === 'ADMINISTRADOR' && term.trim().length > 0) {
       const isNumeric = /^\d+$/.test(term);
       if (isNumeric) {
         this.router.navigate(['/usuario', term]);
       } else {
         this.usuarioService.getUsuarios().subscribe(users => {
           const user = users.find(u => u.nombreUsuario.toLowerCase() === term.toLowerCase());
           if (user) {
             this.router.navigate(['/usuario', user.id]);
           }
         });
       }
    }
  }
}
