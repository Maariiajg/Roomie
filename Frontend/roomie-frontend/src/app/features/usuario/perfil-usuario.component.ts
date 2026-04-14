import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/auth/auth.service';
import { PerfilUsuarioDTO } from '../../core/models/piso.dto';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain pt-24 pb-20 px-6">
      <div class="max-w-3xl mx-auto">
        
        @if (usuario()) {
          <!-- Cabecera de Perfil -->
          <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-50 flex flex-col items-center text-center relative overflow-hidden">
             <!-- Status Badge -->
             @if (usuario()?.mensajePresentacion === 'BANEADO') {
                <div class="absolute top-8 right-8 bg-red-100 text-red-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-red-200">Baneado</div>
             }

             <img [src]="usuario()!.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + usuario()!.nombreUsuario" class="w-32 h-32 rounded-full border-8 border-bgMain shadow-xl mb-6">
             <h1 class="text-3xl font-black text-textMain tracking-tight mb-1">{{ usuario()!.nombre }} {{ usuario()!.apellido1 }}</h1>
             <p class="text-primary font-bold uppercase tracking-widest text-xs mb-6">&#64;{{ usuario()!.nombreUsuario }}</p>

             <div class="flex gap-4 w-full justify-center">
                <div class="bg-bgMain px-6 py-4 rounded-3xl flex flex-col items-center">
                   <span class="text-textMain font-black text-xl">★ 4.8</span>
                   <span class="text-[8px] text-gray-400 font-bold uppercase">Calificación</span>
                </div>
                <div class="bg-bgMain px-6 py-4 rounded-3xl flex flex-col items-center">
                   <span class="text-textMain font-black text-xl">12</span>
                   <span class="text-[8px] text-gray-400 font-bold uppercase">Feedbacks</span>
                </div>
             </div>
          </div>

          <!-- Información Detallada -->
          <div class="mt-8 space-y-6">
             <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Información de contacto</h3>
                <div class="space-y-4">
                   <div class="flex items-center gap-4 text-textMain font-bold">
                      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      {{ usuario()!.email }}
                   </div>
                   <div class="flex items-center gap-4 text-textMain font-bold">
                      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {{ usuario()!.telefono }}
                   </div>
                </div>
             </div>

             <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Presentación</h3>
                <p class="text-gray-600 font-medium leading-relaxed italic">
                   "{{ usuario()!.mensajePresentacion || 'Sin mensaje de presentación.' }}"
                </p>
             </div>

             <!-- Acciones de Administrador -->
             @if (isAdmin()) {
               <div class="pt-10 flex flex-col gap-4">
                  <h3 class="text-xs font-black text-red-500 uppercase tracking-widest text-center mb-2">Zona de Gestión Administrador</h3>
                  <button (click)="toggleBloqueo()" 
                    class="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95"
                    [ngClass]="usuario()?.mensajePresentacion === 'BANEADO' ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'"
                  >
                    {{ usuario()?.mensajePresentacion === 'BANEADO' ? 'Desbloquear Usuario' : 'Baneaer Usuario' }}
                  </button>
               </div>
             }
          </div>
        } @else {
          <div class="flex flex-col items-center py-20">
             <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
             <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cargando perfil...</p>
          </div>
        }

      </div>
    </div>
  `,
  styles: ``
})
export class PerfilUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  usuario = signal<PerfilUsuarioDTO | null>(null);
  isAdmin = computed(() => this.authService.role() === 'ADMINISTRADOR');

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Ruta /usuario/:id  → carga ese perfil
      this.cargarUsuario(Number(idParam));
    } else {
      // Ruta /mi-perfil → carga el perfil del usuario autenticado
      const myId = this.authService.userId();
      if (myId) {
        this.cargarUsuario(myId);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  cargarUsuario(id: number) {
    this.usuarioService.getUsuarioById(id).subscribe({
      next: (u) => this.usuario.set(u),
      error: () => this.notificationService.showError('Error al cargar el usuario')
    });
  }

  toggleBloqueo() {
    const u = this.usuario();
    if (!u) return;

    const isBanned = u.mensajePresentacion === 'BANEADO';
    const action = isBanned ? 'desbloquear' : 'bloquear';
    
    if (confirm(`¿Estás seguro de que deseas ${action} a ${u.nombreUsuario}?`)) {
      const obs = isBanned ? this.usuarioService.desbloquearUsuario(u.id) : this.usuarioService.bloquearUsuario(u.id);
      
      obs.subscribe({
        next: (updated) => {
          this.usuario.set(updated);
          this.notificationService.showSuccess(`Usuario ${action === 'bloquear' ? 'baneado' : 'desbloqueado'} con éxito`);
        },
        error: () => this.notificationService.showError(`Error al ${action} al usuario`)
      });
    }
  }
}
