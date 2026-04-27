import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
// import { FeedbackService } from '../../core/services/feedback.service'; // Asegúrate de tenerlo

@Component({
    selector: 'app-admin-feedbacks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-8 min-h-screen bg-bgMain">

      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Administración
            </span>
          </div>
          <h1 class="text-3xl font-black text-textMain tracking-tight">Moderar Feedbacks</h1>
          <p class="text-gray-400 text-sm mt-1 font-medium">Gestiona la visibilidad de las valoraciones de los usuarios</p>
        </div>

        <div class="relative w-full lg:w-96">
          <div class="relative">
            <input type="text"
                   [ngModel]="searchTerm()"
                   (ngModelChange)="buscarUsuario($event)"
                   (focus)="mostrarDropdown.set(true)"
                   placeholder="Busca un @usuario..." 
                   class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all text-sm font-medium">
            <svg class="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            
            @if (searchTerm() && mostrarDropdown()) {
              <div class="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                @if (filteredUsuarios().length === 0) {
                  <div class="p-4 text-center text-sm text-gray-400 font-medium">No se encontraron usuarios</div>
                }
                @for (user of filteredUsuarios(); track user.id) {
                  <div (click)="seleccionarUsuario(user)" 
                       class="flex items-center gap-3 p-3 hover:bg-bgMain cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                    <img [src]="user.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.nombreUsuario" class="w-8 h-8 rounded-full border border-gray-200 object-cover">
                    <div>
                      <div class="font-bold text-sm text-textMain">&#64;{{ user.nombreUsuario }}</div>
                      <div class="text-[10px] text-gray-400 uppercase tracking-wider">{{ user.nombre }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      @if (usuarioSeleccionado()) {
        <div class="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
             <span class="font-black text-primary text-xl uppercase">{{ usuarioSeleccionado().nombreUsuario.charAt(0) }}</span>
          </div>
          <div>
            <div class="text-sm font-bold text-textMain">Modificando feedbacks de</div>
            <div class="text-xl font-black text-primary">&#64;{{ usuarioSeleccionado().nombreUsuario }}</div>
          </div>
          <button (click)="limpiarSeleccion()" class="ml-auto text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Cerrar</button>
        </div>

        <div class="flex gap-4 border-b border-gray-200 mb-6">
          <button (click)="tabActiva.set('recibidos')" 
                  [class.text-primary]="tabActiva() === 'recibidos'"
                  [class.border-primary]="tabActiva() === 'recibidos'"
                  [class.border-transparent]="tabActiva() !== 'recibidos'"
                  class="pb-3 px-4 font-black text-sm border-b-2 transition-colors text-gray-400 hover:text-textMain">
            Feedbacks Recibidos
          </button>
          <button (click)="tabActiva.set('puestos')" 
                  [class.text-primary]="tabActiva() === 'puestos'"
                  [class.border-primary]="tabActiva() === 'puestos'"
                  [class.border-transparent]="tabActiva() !== 'puestos'"
                  class="pb-3 px-4 font-black text-sm border-b-2 transition-colors text-gray-400 hover:text-textMain">
            Feedbacks Puestos
          </button>
        </div>

        @if (cargandoFeedbacks()) {
          <div class="flex justify-center py-12"><div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        } @else {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="bg-gray-50/50 border-b border-gray-100">
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Usuarios</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Calificación</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                    <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Visibilidad</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (fb of feedbacksMostrados(); track fb.id) {
                    <tr class="hover:bg-bgMain/40 transition-colors" [class.opacity-50]="!fb.visible">
                      
                      <td class="px-6 py-4">
                        <div class="flex flex-col gap-1">
                          <div class="text-[10px] font-black uppercase tracking-widest text-gray-400">Emisor: <span class="text-primary">&#64;{{ fb.emisor?.nombreUsuario || 'usuario' }}</span></div>
                          <div class="text-[10px] font-black uppercase tracking-widest text-gray-400">Receptor: <span class="text-secondary">&#64;{{ fb.receptor?.nombreUsuario || 'usuario' }}</span></div>
                          <div class="text-[10px] text-gray-400 font-mono mt-1">{{ fb.fecha | date:'dd/MM/yyyy' }}</div>
                        </div>
                      </td>

                      <td class="px-6 py-4">
                        <div class="flex text-alert text-lg">
                          @for (star of [1,2,3,4,5]; track star) {
                            <span [class.text-alert]="star <= fb.calificacion" [class.text-gray-200]="star > fb.calificacion">★</span>
                          }
                        </div>
                      </td>

                      <td class="px-6 py-4 w-1/3">
                        <p class="text-xs text-gray-500 line-clamp-2 italic">"{{ fb.descripcion || 'Sin comentario' }}"</p>
                      </td>

                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
                          {{ fb.estado || 'VALORADO' }}
                        </span>
                      </td>

                      <td class="px-6 py-4 text-center">
                        <button (click)="toggleVisible(fb)"
                                [disabled]="procesandoId() === fb.id"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                                [ngClass]="fb.visible ? 'bg-primary' : 'bg-gray-300'">
                          <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                [ngClass]="fb.visible ? 'translate-x-6' : 'translate-x-1'"></span>
                        </button>
                        <div class="text-[10px] font-bold mt-1" [ngClass]="fb.visible ? 'text-primary' : 'text-gray-400'">
                          {{ fb.visible ? 'MOSTRAR' : 'OCULTAR' }}
                        </div>
                      </td>

                    </tr>
                  }
                  @if (feedbacksMostrados().length === 0) {
                    <tr><td colspan="5" class="py-12 text-center text-gray-400 font-medium text-sm">No hay feedbacks en esta sección.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      } @else {
        <div class="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          <p class="text-gray-400 font-medium">Busca y selecciona un usuario arriba para ver y moderar sus valoraciones.</p>
        </div>
      }

    </div>
  `
})
export class AdminFeedbacksComponent implements OnInit {
    private usuarioService = inject(UsuarioService);
    // private feedbackService = inject(FeedbackService);
    // private notificationService = inject(NotificationService);

    // Users Autocomplete State
    usuariosDb = signal<any[]>([]);
    searchTerm = signal('');
    mostrarDropdown = signal(false);

    filteredUsuarios = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return [];
        return this.usuariosDb().filter(u => u.nombreUsuario?.toLowerCase().includes(term));
    });

    // Selected User State
    usuarioSeleccionado = signal<any | null>(null);
    tabActiva = signal<'recibidos' | 'puestos'>('recibidos');

    // Feedbacks State
    feedbacksRaw = signal<any[]>([]); // Todos los del endpoint GET /todos [cite: 427]
    cargandoFeedbacks = signal(false);
    procesandoId = signal<number | null>(null);

    feedbacksMostrados = computed(() => {
        const userId = this.usuarioSeleccionado()?.id;
        const tab = this.tabActiva();
        if (!userId) return [];

        // Filtrado condicional según la pestaña (Suponemos la estructura de tu DTO)
        return this.feedbacksRaw().filter(fb => {
            // Ajusta 'receptorId' y 'emisorId' según los nombres exactos que te devuelva el backend
            return tab === 'recibidos' ? fb.receptorId === userId : fb.emisorId === userId;
        });
    });

    ngOnInit() {
        // Precargar usuarios para el autocompletado [cite: 426]
        this.usuarioService.getUsuarios().subscribe(data => this.usuariosDb.set(data));
    }

    buscarUsuario(term: string) {
        this.searchTerm.set(term);
        this.mostrarDropdown.set(true);
    }

    seleccionarUsuario(user: any) {
        this.usuarioSeleccionado.set(user);
        this.searchTerm.set('');
        this.mostrarDropdown.set(false);
        this.cargarFeedbacks(user.id);
    }

    limpiarSeleccion() {
        this.usuarioSeleccionado.set(null);
        this.feedbacksRaw.set([]);
    }

    cargarFeedbacks(userId: number) {
        this.cargandoFeedbacks.set(true);
        // TODO: Usar el FeedbackService real
        // this.feedbackService.getTodosFeedbacksAdmin(userId).subscribe({ ... })

        // MOCK SIMULADO TEMPORAL para poder ver la UI mientras conectas:
        setTimeout(() => {
            this.feedbacksRaw.set([
                { id: 1, emisorId: userId, receptorId: 99, emisor: { nombreUsuario: 'esteUsuario' }, receptor: { nombreUsuario: 'alguien_mas' }, calificacion: 4, descripcion: 'Buen compi de piso', estado: 'VALORADO', visible: true, fecha: '2023-10-15' },
                { id: 2, emisorId: 88, receptorId: userId, emisor: { nombreUsuario: 'dueño_piso' }, receptor: { nombreUsuario: 'esteUsuario' }, calificacion: 2, descripcion: 'Mucho ruido por las noches', estado: 'VALORADO', visible: true, fecha: '2023-11-20' },
                { id: 3, emisorId: 77, receptorId: userId, emisor: { nombreUsuario: 'hater' }, receptor: { nombreUsuario: 'esteUsuario' }, calificacion: 1, descripcion: 'Me robó leche de la nevera. Insultos aleatorios...', estado: 'VALORADO', visible: false, fecha: '2023-12-01' }
            ]);
            this.cargandoFeedbacks.set(false);
        }, 500);
    }

    toggleVisible(fb: any) {
        this.procesandoId.set(fb.id);

        // LLamada al endpoint PUT /feedback/{id}/toggle [cite: 446]
        // this.feedbackService.toggleVisibilidad(fb.id).subscribe({
        //   next: () => {
        //     Actualiza el array local [cite: 447]
        //     this.feedbacksRaw.update(current => 
        //       current.map(item => item.id === fb.id ? { ...item, visible: !item.visible } : item)
        //     );
        //     this.notificationService.showInfo('Visibilidad actualizada. La media del usuario se recalculará.'); [cite: 448]
        //     this.procesandoId.set(null);
        //   },
        //   error: () => this.procesandoId.set(null)
        // });

        // Lógica Mock temporal
        setTimeout(() => {
            this.feedbacksRaw.update(current =>
                current.map(item => item.id === fb.id ? { ...item, visible: !item.visible } : item)
            );
            // this.notificationService.showInfo('Visibilidad actualizada. La media del usuario se recalculará.');
            this.procesandoId.set(null);
        }, 400);
    }
}