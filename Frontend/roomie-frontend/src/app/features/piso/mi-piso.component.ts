import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PisoService } from './piso.service';
import { AlquilerService } from '../../core/services/alquiler.service';
import { FotoService } from '../../shared/services/foto.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { FeedbackService } from '../../shared/services/feedback.service';

type Tab = 'INFO' | 'SOLICITUDES' | 'INQUILINOS' | 'AVANZADA';

@Component({
  selector: 'app-mi-piso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain py-12 px-4 lg:px-8 font-sans">
      <div class="max-w-7xl mx-auto">
        
        <div class="mb-12 flex justify-between items-end">
          <div>
            <h1 class="text-4xl font-black text-textMain uppercase tracking-tighter italic">Gestión de Mi Piso</h1>
            <p class="text-primary font-bold text-xs uppercase tracking-[0.2em] mt-2">Panel de Propietario</p>
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-32">
            <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        } @else if (!piso()) {
          <div class="bg-white p-12 rounded-[3rem] text-center shadow-sm border border-gray-50">
            <div class="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h2 class="text-2xl font-black uppercase tracking-tighter mb-4">No se encontró tu piso</h2>
            <p class="text-gray-500 font-medium">Parece que no eres propietario de ningún piso actualmente.</p>
          </div>
        } @else {
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <div class="lg:col-span-4">
              <div class="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-50 lg:sticky lg:top-8 flex flex-col">
                <div class="h-48 bg-gray-200 relative">
                  <img [src]="fotos()[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'" class="w-full h-full object-cover">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 class="absolute bottom-4 left-6 right-6 text-white font-black text-xl uppercase tracking-tighter leading-tight">
                    {{ piso().direccion }}
                  </h3>
                </div>
                <div class="p-6 bg-white space-y-4">
                  <div class="flex justify-between items-center p-4 bg-bgMain rounded-2xl">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</span>
                    <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Activo</span>
                  </div>
                  <div class="flex justify-between items-center p-4 bg-bgMain rounded-2xl">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Viviendo</span>
                    <span class="font-black text-textMain">{{ piso().numOcupantesActual }} / {{ piso().numTotalHabitaciones }}</span>
                  </div>
                  <div class="flex justify-between items-center p-4 bg-bgMain rounded-2xl">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plazas Libres</span>
                    <span class="font-black text-primary">{{ piso().numTotalHabitaciones - piso().numOcupantesActual }}</span>
                  </div>
                  <div class="flex justify-between items-center p-4 bg-bgMain rounded-2xl">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingresos Est.</span>
                    <span class="font-black text-textMain">{{ piso().precioMes | currency:'EUR':'symbol':'1.0-0' }} / mes</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-8">
              
              <div class="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-3xl shadow-sm border border-gray-50">
                @for (tab of tabs; track tab.id) {
                  <button (click)="activeTab.set(tab.id)"
                          class="flex-1 min-w-[120px] px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all relative"
                          [ngClass]="activeTab() === tab.id ? 'bg-textMain text-white shadow-lg' : 'bg-transparent text-gray-400 hover:bg-gray-50'">
                    {{ tab.label }}
                    @if (tab.id === 'SOLICITUDES' && solicitudes().length > 0) {
                      <span class="absolute top-2 right-2 bg-red-500 text-white w-2 h-2 rounded-full animate-pulse"></span>
                    }
                  </button>
                }
              </div>

              <div class="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-50">

                @if (activeTab() === 'INFO') {
                  <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Editar Información</h2>
                  
                  <form (ngSubmit)="guardarCambiosPiso()" class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="md:col-span-2">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dirección Completa</label>
                        <input [(ngModel)]="pisoForm.direccion" name="dir" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                      </div>
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Población / Ciudad</label>
                        <input [(ngModel)]="pisoForm.poblacion" name="pob" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                      </div>
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tamaño (m²)</label>
                        <input type="number" [(ngModel)]="pisoForm.tamanio" name="tam" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                      </div>
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio Total (Mes)</label>
                        <input type="number" [(ngModel)]="pisoForm.precioMes" name="precio" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                      </div>
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Número de Habitaciones</label>
                        <input type="number" [(ngModel)]="pisoForm.numTotalHabitaciones" name="hab" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary">
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
                        <textarea [(ngModel)]="pisoForm.descripcion" name="desc" rows="4" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                      </div>
                    </div>

                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Comodidades Permitidas</label>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label class="flex items-center justify-between p-4 bg-bgMain rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <span class="font-bold text-xs uppercase tracking-widest">WiFi</span>
                          <input type="checkbox" [(ngModel)]="pisoForm.wifi" name="wifi" class="w-5 h-5 accent-textMain">
                        </label>
                        <label class="flex items-center justify-between p-4 bg-bgMain rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <span class="font-bold text-xs uppercase tracking-widest">Mascotas</span>
                          <input type="checkbox" [(ngModel)]="pisoForm.animales" name="anim" class="w-5 h-5 accent-textMain">
                        </label>
                        <label class="flex items-center justify-between p-4 bg-bgMain rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <span class="font-bold text-xs uppercase tracking-widest">Garaje</span>
                          <input type="checkbox" [(ngModel)]="pisoForm.garaje" name="garaje" class="w-5 h-5 accent-textMain">
                        </label>
                        <label class="flex items-center justify-between p-4 bg-bgMain rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <span class="font-bold text-xs uppercase tracking-widest">Fumar</span>
                          <input type="checkbox" [(ngModel)]="pisoForm.tabaco" name="tab" class="w-5 h-5 accent-textMain">
                        </label>
                      </div>
                    </div>

                    <button type="submit" class="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95">
                      Guardar Cambios del Piso
                    </button>
                  </form>

                  <div class="mt-12 pt-12 border-t border-gray-100">
                    <h3 class="text-lg font-black text-textMain mb-6 uppercase tracking-tighter">Galería de Fotos</h3>
                    
                    <div class="flex gap-4 mb-6">
                      <input [(ngModel)]="nuevaFotoUrl" placeholder="URL de la nueva foto (https://...)" class="flex-grow bg-bgMain border border-gray-100 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary text-sm">
                      <button (click)="anadirFoto()" class="bg-textMain text-white px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all">Añadir</button>
                    </div>

                    @if (fotos().length === 0) {
                      <p class="text-gray-400 font-bold text-xs">Aún no has añadido fotos a tu piso.</p>
                    } @else {
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        @for (f of fotos(); track f.id) {
                          <div class="relative group rounded-2xl overflow-hidden aspect-video">
                            <img [src]="f.url" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button (click)="eliminarFoto(f.id)" class="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors active:scale-90">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                @if (activeTab() === 'SOLICITUDES') {
                  <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Solicitudes Pendientes</h2>
                  @if (solicitudes().length === 0) {
                    <div class="text-center py-16 bg-bgMain rounded-3xl border border-gray-100 border-dashed">
                      <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay solicitudes pendientes.</p>
                    </div>
                  } @else {
                    <div class="space-y-4">
                      @for (sol of solicitudes(); track sol.id) {
                        <div class="bg-bgMain p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          
                          <div class="flex items-center gap-4">
                            <img [src]="sol.usuario?.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + sol.usuario?.nombreUsuario" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm">
                            <div>
                              <button (click)="abrirPerfilModal(sol.usuario)" class="font-black text-lg text-textMain uppercase hover:text-primary transition-colors text-left">
                                {{ sol.usuario?.nombre }} {{ sol.usuario?.apellido1 }}
                              </button>
                              <div class="flex items-center gap-3 mt-1">
                                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">&#64;{{ sol.usuario?.nombreUsuario }}</span>
                                <span class="flex items-center gap-1 text-alert text-[10px] font-black">
                                  <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                  {{ sol.usuario?.calificacionMedia || 'N/A' }}
                                </span>
                              </div>
                              <p class="text-[10px] font-bold text-primary mt-2 uppercase tracking-widest bg-primary/10 inline-block px-3 py-1 rounded-full">
                                Solicita entrar el: {{ sol.fechaInicio || sol.fInicio }}
                              </p>
                            </div>
                          </div>

                          <div class="flex gap-2 w-full md:w-auto">
                            <button (click)="resolver(sol.id, false)" class="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors">
                              Rechazar
                            </button>
                            <button (click)="resolver(sol.id, true)" class="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/30 hover:bg-hover transition-colors">
                              Aceptar
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }

                @if (activeTab() === 'INQUILINOS') {
                  <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Inquilinos Actuales</h2>
                  @if (inquilinos().length === 0) {
                    <p class="text-gray-400 font-bold text-sm bg-bgMain py-12 text-center rounded-3xl border border-gray-100 border-dashed">No hay nadie viviendo en el piso.</p>
                  } @else {
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      @for (inq of inquilinos(); track inq.id) {
                        <div class="p-6 bg-bgMain rounded-[2rem] border border-gray-100 flex flex-col items-center text-center relative group">
                          <img [src]="inq.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + inq.nombreUsuario" class="w-20 h-20 rounded-full object-cover mb-4 border-2 border-white shadow-sm">
                          <h4 class="font-black text-textMain uppercase">{{ inq.nombreUsuario }}</h4>
                          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 mb-4 flex items-center gap-1">
                            <svg class="w-3 h-3 text-alert fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            {{ inq.calificacionMedia || 'N/A' }}
                          </span>
                          
                          <div class="flex gap-2 w-full mt-auto">
                            <button (click)="abrirPerfilModal(inq)" class="flex-1 py-2 bg-white text-textMain rounded-lg font-black uppercase text-[9px] tracking-widest shadow-sm hover:bg-gray-50 border border-gray-100">
                              Perfil
                            </button>
                            @if (inq.id !== myId()) {
                              <button (click)="prepararExpulsion(inq)" class="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-red-100 flex items-center justify-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Expulsar
                              </button>
                            } @else {
                              <span class="flex-1 py-2 bg-primary/10 text-primary rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center justify-center">Tú</span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                }

                @if (activeTab() === 'AVANZADA') {
                  <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Gestión Avanzada</h2>
                  
                  <div class="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 text-amber-200/50">
                      <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    </div>
                    <div class="relative z-10">
                      <h3 class="text-amber-800 font-black uppercase tracking-widest text-sm mb-2">Ceder Propiedad</h3>
                      <p class="text-amber-700/80 font-medium text-sm mb-6 max-w-md">Traspasa los derechos de propietario a otro inquilino actual. Una vez cedido, pasarás a ser un usuario estándar.</p>
                      
                      <div class="flex flex-col sm:flex-row gap-4">
                        <select [(ngModel)]="nuevoOwnerId" class="flex-grow bg-white border border-amber-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 cursor-pointer">
                          <option [ngValue]="null">Selecciona un inquilino...</option>
                          @for (inq of inquilinos(); track inq.id) {
                            @if (inq.id !== myId()) {
                              <option [value]="inq.id">{{ inq.nombre }} {{ inq.apellido1 }} (&#64;{{ inq.nombreUsuario }})</option>
                            }
                          }
                        </select>
                        <button (click)="confirmarCeder()" [disabled]="!nuevoOwnerId" 
                                class="px-8 py-4 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          Ceder Piso
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="bg-bgMain border border-gray-100 rounded-[2.5rem] p-8 relative">
                    <h3 class="text-gray-800 font-black uppercase tracking-widest text-sm mb-2">Abandonar Piso</h3>
                    <p class="text-gray-500 font-medium text-sm mb-4 max-w-md">Para abandonar el piso primero debes cederlo a otro inquilino.</p>
                    <button disabled class="px-8 py-4 bg-gray-200 text-gray-400 rounded-xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed">
                      Abandonar Piso
                    </button>
                  </div>
                }

              </div>
            </div>
          </div>
        }
      </div>
    </div>

    @if (showUserModal() && selectedUser()) {
      <div class="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-[3rem] w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
          <div class="p-8 pb-6 bg-bgMain border-b border-gray-100 relative shrink-0">
            <button (click)="cerrarModalUsuario()" class="absolute top-6 right-6 p-2 bg-white rounded-full text-gray-400 hover:text-textMain shadow-sm transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="flex items-center gap-5">
              <img [src]="selectedUser()!.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + selectedUser()!.nombreUsuario" 
                   class="w-24 h-24 rounded-[1.5rem] object-cover border-4 border-white shadow-md">
              <div>
                <h3 class="text-2xl font-black text-textMain tracking-tight">&#64;{{ selectedUser()!.nombreUsuario }}</h3>
                <div class="flex items-center gap-1 text-alert mt-1">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span class="font-bold text-sm text-textMain">{{ selectedUser()!.calificacionMedia || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div class="mt-6 flex flex-col gap-1">
              <p class="font-bold text-gray-800 text-sm">{{ selectedUser()!.nombre }} {{ selectedUser()!.apellido1 }}</p>
            </div>
            @if (selectedUser()!.mensajePresentacion) {
              <div class="mt-4 p-4 bg-white rounded-2xl border border-gray-100">
                <p class="text-sm text-gray-600 font-medium italic">"{{ selectedUser()!.mensajePresentacion }}"</p>
              </div>
            }
          </div>
          <div class="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Valoraciones Recibidas</h4>
            <div class="space-y-4">
              @if (userFeedbacks().length === 0) {
                <p class="text-sm font-medium text-gray-400 text-center py-6 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">Aún no tiene valoraciones.</p>
              } @else {
                @for (fb of userFeedbacks(); track fb.id) {
                  <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p class="text-xs text-gray-600 font-medium leading-relaxed">"{{ fb.descripcion }}"</p>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    }

    @if (showExpulsarModal() && userToExpulsar()) {
      <div class="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </div>
          <h3 class="text-2xl font-black text-textMain uppercase tracking-tighter mb-4">¿Expulsar Inquilino?</h3>
          <p class="text-gray-500 font-medium mb-8 leading-relaxed">
            Estás a punto de expulsar a <span class="font-black text-textMain">&#64;{{ userToExpulsar()!.nombreUsuario }}</span> del piso. Esta acción es inmediata y no se puede deshacer.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button (click)="showExpulsarModal.set(false)" class="flex-1 py-4 bg-bgMain text-textMain rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancelar</button>
            <button (click)="ejecutarExpulsion()" class="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-red-600 transition-all active:scale-95">Sí, Expulsar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class MiPisoComponent implements OnInit {
  private pisoService = inject(PisoService);
  private alquilerService = inject(AlquilerService);
  private fotoService = inject(FotoService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private feedbackService = inject(FeedbackService);
  private router = inject(Router);

  tabs = [
    { id: 'INFO' as Tab, label: 'Información' },
    { id: 'SOLICITUDES' as Tab, label: 'Solicitudes' },
    { id: 'INQUILINOS' as Tab, label: 'Inquilinos' },
    { id: 'AVANZADA' as Tab, label: 'Gestión' }
  ];

  activeTab = signal<Tab>('INFO');
  isLoading = signal(true);
  myId = signal<number | null>(null);

  piso = signal<any>(null);
  inquilinos = signal<any[]>([]);
  solicitudes = signal<any[]>([]);
  fotos = signal<any[]>([]);

  // Formularios
  pisoForm: any = {};
  nuevaFotoUrl = '';
  nuevoOwnerId: number | null = null;

  // Modales
  showUserModal = signal(false);
  selectedUser = signal<any>(null);
  userFeedbacks = signal<any[]>([]);

  showExpulsarModal = signal(false);
  userToExpulsar = signal<any>(null);

  ngOnInit() {
    const userId = this.authService.userId();
    if (!userId || this.authService.role() !== 'OWNER') {
      this.router.navigate(['/']);
      return;
    }
    this.myId.set(userId);
    this.cargarDatosPropietario(userId);
  }

  cargarDatosPropietario(idOwner: number) {
    this.pisoService.getPisoMio(idOwner).subscribe({
      next: (p) => {
        this.piso.set(p);
        // Inicializar formulario
        this.pisoForm = {
          direccion: p.direccion,
          poblacion: p.poblacion || '',
          descripcion: p.descripcion || '',
          tamanio: p.tamanio,
          precioMes: p.precioMes,
          numTotalHabitaciones: p.numTotalHabitaciones,
          wifi: p.wifi,
          animales: p.animales,
          garaje: p.garaje,
          tabaco: p.tabaco
        };
        this.cargarDependencias(p.id);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.showInfo('No eres propietario de ningún piso.');
      }
    });
  }

  cargarDependencias(idPiso: number) {
    // Cargar Inquilinos
    this.pisoService.getUsuariosInPiso(idPiso).subscribe({
      next: (users) => this.inquilinos.set(users)
    });

    // Cargar Solicitudes
    this.alquilerService.solicitudesPendientes(idPiso).subscribe({
      next: (sols) => this.solicitudes.set(sols)
    });

    // Cargar Fotos
    this.fotoService.getFotosByPiso(idPiso).subscribe({
      next: (f) => this.fotos.set(f),
      complete: () => this.isLoading.set(false)
    });
  }

  // --- TAB 1: INFORMACIÓN Y FOTOS ---
  guardarCambiosPiso() {
    const pId = this.piso()?.id;
    if (!pId) return;
    this.pisoService.actualizarPiso(pId, this.pisoForm).subscribe({
      next: (pUpdated) => {
        this.piso.set(pUpdated);
        this.notificationService.showSuccess('Información del piso actualizada.');
      },
      error: () => this.notificationService.showError('Error al guardar los cambios.')
    });
  }

  anadirFoto() {
    const pId = this.piso()?.id;
    const myId = this.myId(); // El ID del Owner logueado
    if (!pId || !myId || !this.nuevaFotoUrl.trim()) return;

    this.fotoService.anadirFoto(this.nuevaFotoUrl, pId, myId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Foto añadida.');
        this.nuevaFotoUrl = '';
        this.cargarDependencias(pId);
      },
      error: () => this.notificationService.showError('Error al añadir la foto.')
    });
  }

  eliminarFoto(idFoto: number) {
    const pId = this.piso()?.id;
    const myId = this.myId(); // El ID del Owner logueado
    if (!pId || !myId) return;

    if (confirm('¿Eliminar esta foto?')) {
      this.fotoService.eliminarFoto(idFoto, pId, myId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Foto eliminada.');
          this.cargarDependencias(pId);
        },
        error: () => this.notificationService.showError('Error al eliminar la foto.')
      });
    }
  }

  // --- TAB 2: SOLICITUDES ---
  resolver(idAlquiler: number, aceptar: boolean) {
    const ownerId = this.myId();
    if (!ownerId) return;
    this.alquilerService.resolverSolicitud(idAlquiler, ownerId, aceptar).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Solicitud ${aceptar ? 'aceptada' : 'rechazada'}.`);
        this.solicitudes.update(list => list.filter(s => s.id !== idAlquiler));
        // Si acepta, la lista de inquilinos cambiará, recargamos dependencias
        if (aceptar) this.cargarDependencias(this.piso().id);
      },
      error: () => this.notificationService.showError('Error al procesar la solicitud.')
    });
  }

  // --- TAB 3: INQUILINOS (EXPULSAR) ---
  prepararExpulsion(user: any) {
    this.userToExpulsar.set(user);
    this.showExpulsarModal.set(true);
  }

  ejecutarExpulsion() {
    const pId = this.piso()?.id;
    const ownerId = this.myId();
    const userId = this.userToExpulsar()?.id;

    if (!pId || !ownerId || !userId) return;

    this.alquilerService.expulsarInquilino(pId, userId, ownerId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Inquilino expulsado del piso.');
        this.showExpulsarModal.set(false);
        this.cargarDependencias(pId); // Recargar lista
      },
      error: () => {
        this.notificationService.showError('Error al intentar expulsar al inquilino.');
        this.showExpulsarModal.set(false);
      }
    });
  }

  // --- TAB 4: GESTIÓN AVANZADA (CEDER) ---
  confirmarCeder() {
    const pId = this.piso()?.id;
    const ownerId = this.myId();
    if (!pId || !ownerId || !this.nuevoOwnerId) return;

    if (confirm('ATENCIÓN: Si cedes la propiedad, perderás tus privilegios de Owner. ¿Confirmas?')) {
      const dto = { idOwnerActual: ownerId, idNuevoOwner: this.nuevoOwnerId };
      this.pisoService.cederPiso(pId, dto).subscribe({
        next: () => {
          this.notificationService.showSuccess('Piso cedido correctamente. Ya no eres propietario.');
          // Según requisito, el rol baja, así que debe volver a iniciar sesión o ir a mis-alquileres
          this.router.navigate(['/mis-alquileres']);
          // Idealmente aquí forzarías logout o actualizarías el token local
        },
        error: () => this.notificationService.showError('Error al ceder el piso.')
      });
    }
  }

  // --- HELPERS PARA MODAL ---
  abrirPerfilModal(usuario: any) {
    this.selectedUser.set(usuario);
    this.showUserModal.set(true);
    this.feedbackService.getFeedbacksByUsuario(usuario.id).subscribe({
      next: (fbs) => this.userFeedbacks.set(fbs.filter((f: any) => f.estadoFeedback !== 'PENDIENTE'))
    });
  }

  cerrarModalUsuario() {
    this.showUserModal.set(false);
  }
}