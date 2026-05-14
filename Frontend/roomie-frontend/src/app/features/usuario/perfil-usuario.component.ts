import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/components/toast/notification.service';
import { FeedbackService } from '../../shared/services/feedback.service';
import { AlquilerService } from '../../core/services/alquiler.service';
import { PisoService } from '../piso/piso.service';
import { PisoDTO } from '../../core/models/piso.dto';

type Tab = 'INFO' | 'SEGURIDAD' | 'FEEDBACKS' | 'ALQUILERES' | 'NOTIFICACIONES';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain py-12 px-4 lg:px-8 font-sans">
      <div class="max-w-7xl mx-auto">

        @if (usuario()) {
          @if (isAdmin() && !isMyProfile()) {
            <button (click)="goBack()" class="mb-6 bg-white border border-gray-100 hover:bg-gray-50 text-textMain px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 w-fit transition-all shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Volver
            </button>
          }
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <div class="lg:col-span-4">
              <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 flex flex-col items-center text-center lg:sticky lg:top-8">
                <div class="relative mb-6">
                  <img [src]="usuario()!.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + usuario()!.nombreUsuario"
                       class="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-bgMain shadow-lg" alt="Avatar">
                  <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                    {{ usuario()!.rol === 'OWNER' ? 'PROPIETARIO' : (usuario()!.rol === 'ADMINISTRADOR' ? 'ADMIN' : 'USUARIO') }}
                  </div>
                </div>

                <h1 class="text-2xl font-black text-textMain uppercase tracking-tight mt-4">
                  {{ usuario()!.nombre }} {{ usuario()!.apellido1 }}
                </h1>
                <p class="text-primary font-black uppercase tracking-widest text-xs mt-1">&#64;{{ usuario()!.nombreUsuario }}</p>
                
                <div class="flex items-center gap-1 text-alert mt-4 bg-alert/10 px-4 py-2 rounded-2xl">
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span class="font-black text-lg text-alert">
                    {{ usuario()!.calificacionMedia ? (usuario()!.calificacionMedia | number:'1.1-1') : 'N/A' }}
                  </span>
                </div>

                @if (usuario()!.mensajePresentacion) {
                  <p class="text-gray-500 font-medium mt-6 italic text-sm">"{{ usuario()!.mensajePresentacion }}"</p>
                }
              </div>
            </div>

            <div class="lg:col-span-8">
              @if (isMyProfile()) {
                
                <div class="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-3xl shadow-sm border border-gray-50">
                  @for (tab of tabs; track tab.id) {
                    <button (click)="activeTab.set(tab.id)"
                            class="flex-1 min-w-[120px] px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all relative"
                            [ngClass]="activeTab() === tab.id ? 'bg-textMain text-white shadow-lg' : 'bg-transparent text-gray-400 hover:bg-gray-50'">
                      {{ tab.label }}
                      @if (tab.id === 'NOTIFICACIONES' && notificacionesNoLeidas() > 0) {
                        <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] animate-pulse">
                          {{ notificacionesNoLeidas() }}
                        </span>
                      }
                    </button>
                  }
                </div>

                <div class="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-50">

                  @if (activeTab() === 'INFO') {
                    <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Información Personal</h2>
                    <form (ngSubmit)="guardarPerfil()" class="space-y-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">DNI / NIE</label>
                          <input [(ngModel)]="perfilForm.dni" name="dni" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>
                        
                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre</label>
                          <input [(ngModel)]="perfilForm.nombre" name="nombre" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primer Apellido</label>
                          <input [(ngModel)]="perfilForm.apellido1" name="apellido1" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Segundo Apellido</label>
                          <input [(ngModel)]="perfilForm.apellido2" name="apellido2" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha de Nacimiento</label>
                          <input type="date" [(ngModel)]="perfilForm.anioNacimiento" name="anioNacimiento" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Género</label>
                          <select [(ngModel)]="perfilForm.genero" name="genero" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none cursor-pointer">
                            <option value="MUJER">Mujer</option>
                            <option value="HOMBRE">Hombre</option>
                          </select>
                        </div>

                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Teléfono</label>
                          <input [(ngModel)]="perfilForm.telefono" name="telefono" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                          <input [(ngModel)]="perfilForm.email" name="email" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div class="md:col-span-2">
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">URL Foto de Perfil</label>
                          <input [(ngModel)]="perfilForm.foto" name="foto" placeholder="https://..." class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all">
                        </div>

                        <div class="md:col-span-2">
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Presentación (se muestra en tu perfil)</label>
                          <textarea [(ngModel)]="perfilForm.mensajePresentacion" name="msg" rows="3" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"></textarea>
                        </div>
                      </div>

                      <button type="submit" class="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm mt-4 hover:bg-hover shadow-xl shadow-primary/30 transition-all active:scale-95">
                        Guardar Cambios
                      </button>
                    </form>
                  }

                  @if (activeTab() === 'SEGURIDAD') {
                    <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Seguridad</h2>
                    <form (ngSubmit)="cambiarPassword()" class="space-y-6">
                      
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de Usuario (Opcional)</label>
                        <input type="text" [(ngModel)]="passwordForm.nombreUsuario" name="nombreUsuario" placeholder="Si quieres cambiar tu @usuario" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary transition-all">
                      </div>
                      
                      <div class="border-t border-gray-100 pt-6">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña Actual</label>
                        <input type="password" [(ngModel)]="passwordForm.passwordActual" name="old" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary transition-all">
                      </div>

                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nueva Contraseña</label>
                        <input type="password" [(ngModel)]="passwordForm.passwordNueva" name="new" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary transition-all">
                      </div>

                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Repetir Nueva Contraseña</label>
                        <input type="password" [(ngModel)]="passwordForm.repetirPasswordNueva" name="confirm" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary transition-all">
                      </div>

                      <button type="submit" class="w-full py-5 bg-textMain text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black shadow-xl transition-all active:scale-95 mt-4">
                        Cambiar Credenciales
                      </button>
                    </form>
                  }

                  @if (activeTab() === 'FEEDBACKS') {
                    <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Mis Feedbacks</h2>
                   
                    <!-- 1. POR VALORAR (Los que YO tengo que escribir) -->
                    @if (feedbacksPorValorar().length > 0) {
                      <h3 class="text-xs font-black text-alert uppercase tracking-widest mb-4 mt-8">Por Valorar</h3>
                      <div class="space-y-4 mb-8">
                        @for (fb of feedbacksPorValorar(); track fb.id) {
                          <div class="bg-white p-6 rounded-[2rem] border border-alert/40 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-2 h-full bg-alert"></div>
                           
                            <div class="flex items-center gap-4 mb-4">
                              <img [src]="'https://api.dicebear.com/7.x/initials/svg?seed=' + fb.nombreUsuarioRecibe" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm">
                              <div>
                                <span class="font-black uppercase text-sm tracking-widest text-textMain">Valora a {{ fb.nombreUsuarioRecibe }}</span>
                                <p class="text-[10px] font-bold text-gray-400 mt-0.5">Compañero de piso</p>
                              </div>
                            </div>

                            <div class="flex flex-col gap-3">
                              <input type="number" min="1" max="5" [(ngModel)]="fb.tempCalificacion" placeholder="Puntuación (1-5 Estrellas)" class="p-4 bg-bgMain rounded-xl font-bold outline-none focus:ring-2 focus:ring-alert transition-all">
                              <textarea [(ngModel)]="fb.tempDescripcion" placeholder="Escribe tu reseña sobre la convivencia..." rows="2" class="p-4 bg-bgMain rounded-xl font-bold outline-none focus:ring-2 focus:ring-alert resize-none transition-all"></textarea>
                              <button (click)="enviarValoracion(fb)" class="bg-alert text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-lg hover:bg-amber-400 mt-2">
                                Enviar Valoración
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- 2. RECIBIDOS Y ESPERANDO (Los que me han escrito o me van a escribir) -->
                    <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-4 mt-8">Valoraciones Recibidas</h3>
                    @if (feedbacksRecibidos().length === 0 && feedbacksEsperando().length === 0) {
                      <div class="text-center py-10 bg-bgMain rounded-3xl border border-gray-100 border-dashed mb-8">
                        <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Nadie te ha valorado aún.</p>
                      </div>
                    } @else {
                      <div class="space-y-4 mb-8">
                        <!-- Recibidos (Ya valorados) -->
                        @for (fb of feedbacksRecibidos(); track fb.id) {
                          <div class="bg-bgMain p-6 rounded-[2rem] border border-gray-100">
                            <div class="flex justify-between items-start mb-4">
                              <div class="flex items-center gap-3">
                                <img [src]="fb.fotoUsuarioPone || 'https://api.dicebear.com/7.x/initials/svg?seed=' + fb.nombreUsuarioPone" class="w-10 h-10 rounded-full object-cover shadow-sm border border-white">
                                <div>
                                  <span class="font-black uppercase text-xs tracking-widest text-textMain">{{ fb.nombreUsuarioPone }}</span>
                                  <p class="text-[10px] font-bold text-gray-400 mt-0.5">{{ fb.fecha }}</p>
                                </div>
                              </div>
                            </div>
                            <div class="flex text-alert mb-3">
                              @for (s of [1,2,3,4,5]; track s) {
                                <svg class="w-4 h-4" [attr.fill]="s <= fb.calificacion ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              }
                            </div>
                            <p class="text-gray-600 font-medium italic text-sm">"{{ fb.descripcion }}"</p>
                          </div>
                        }
                       
                        <!-- Esperando (Pendientes de que el otro escriba) -->
                        @for (fb of feedbacksEsperando(); track fb.id) {
                          <div class="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 border-dashed flex items-center gap-4 opacity-70">
                            <img [src]="fb.fotoUsuarioPone || 'https://api.dicebear.com/7.x/initials/svg?seed=' + fb.nombreUsuarioPone" class="w-10 h-10 rounded-full object-cover grayscale opacity-50">
                            <div>
                              <span class="font-black uppercase text-xs tracking-widest text-gray-500">{{ fb.nombreUsuarioPone }}</span>
                              <p class="text-[10px] font-bold text-gray-400 mt-0.5 italic">Esperando a que escriba su valoración...</p>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- 3. ENVIADOS (Histórico de los que YO he escrito) -->
                    @if (feedbacksEnviados().length > 0) {
                      <h3 class="text-xs font-black text-secondary uppercase tracking-widest mb-4 mt-8">Valoraciones que has escrito</h3>
                      <div class="space-y-4">
                        @for (fb of feedbacksEnviados(); track fb.id) {
                          <div class="bg-bgMain p-6 rounded-[2rem] border border-gray-100 opacity-80">
                            <div class="flex justify-between items-start mb-4">
                              <div class="flex items-center gap-3">
                                <span class="font-black uppercase text-xs tracking-widest text-textMain">A: {{ fb.nombreUsuarioRecibe }}</span>
                                <span class="text-[10px] font-bold text-gray-400">{{ fb.fecha }}</span>
                              </div>
                            </div>
                            <div class="flex text-alert mb-3">
                              @for (s of [1,2,3,4,5]; track s) {
                                <svg class="w-3 h-3" [attr.fill]="s <= fb.calificacion ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              }
                            </div>
                            <p class="text-gray-500 font-medium italic text-sm">"{{ fb.descripcion }}"</p>
                          </div>
                        }
                      </div>
                    }

                  }

                  @if (activeTab() === 'ALQUILERES') {
                    <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Mis Alquileres</h2>

                    <div class="mb-12">
                      <h3 class="text-xs font-black uppercase tracking-widest mb-4 text-primary">Mi Piso Actual</h3>
                      @if (miEstancia() && pisoEstancia()) {
                        <div class="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-md flex flex-col md:flex-row items-center gap-6">
                          
                          <!-- AÑADIDA LÓGICA DE FOTO DINÁMICA AQUÍ -->
                          <a [routerLink]="['/piso', pisoEstancia()!.id]" class="shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                            <img [src]="pisoEstancia()!.fotos?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80'" class="w-full md:w-32 h-32 object-cover rounded-2xl">
                          </a>
                          
                          <div class="flex-grow text-center md:text-left">
                            <a [routerLink]="['/piso', pisoEstancia()!.id]" class="font-black text-lg text-textMain uppercase hover:text-primary transition-colors cursor-pointer">
                              {{ pisoEstancia()!.direccion }}
                            </a>
                            <p class="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest">Madrid</p>
                            
                            <!-- Tira unificada de comodidades -->
                            <div class="flex items-center justify-center md:justify-start gap-3 mt-3">
                              <div [ngClass]="pisoEstancia()!.wifi ? 'text-primary' : 'text-gray-200'" title="WiFi">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                              </div>
                              <div [ngClass]="pisoEstancia()!.animales ? 'text-secondary' : 'text-gray-200'" title="Mascotas">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a2 2 0 100-4 2 2 0 000 4zm4.5 1.5a2 2 0 100-4 2 2 0 000 4zm-9 0a2 2 0 100-4 2 2 0 000 4zM2 9a2 2 0 100-4 2 2 0 000 4zm16 0a2 2 0 100-4 2 2 0 000 4zm-4.7 2.3c-.6-.4-1.3-.3-1.8.2l-1.5 1.5-1.5-1.5c-.5-.5-1.2-.6-1.8-.2-1.3.8-1.7 2.5-1 3.8.7 1.3 2.1 2.2 3.6 2.2h1.4c1.5 0 2.9-.9 3.6-2.2.7-1.3.3-3-1-3.8z"/></svg>
                              </div>
                              <div [ngClass]="pisoEstancia()!.garaje ? 'text-alert' : 'text-gray-200'" title="Garaje">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM8 17a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              </div>
                              <div [ngClass]="pisoEstancia()!.tabaco ? 'text-orange-400' : 'text-green-500'" title="Tabaco">
                                <div class="relative w-5 h-5">
                                  <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2 14h13m-13 3h13m2-3v4m0-4h3v4h-3m1-10c.5-.5 1-1.5.5-2.5a3 3 0 013-3" /></svg>
                                  @if (!pisoEstancia()!.tabaco) {
                                    <svg class="w-full h-full absolute inset-0 text-red-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  }
                                </div>
                              </div>
                            </div>
                            
                            <!-- CORREGIDO EL NOMBRE DE LA VARIABLE PRECIO -->
                            <p class="text-primary font-black mt-3 text-xl">{{ precioEstanciaCalculado() | currency:'EUR':'symbol':'1.0-0' }}<span class="text-xs text-gray-400">/mes</span></p>
                          </div>
                          
                          <button (click)="showAbandonarModal.set(true)" class="w-full md:w-auto bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                            Abandonar Piso
                          </button>
                        </div>
                      } @else {
                        <div class="bg-bgMain p-8 rounded-3xl text-center border border-gray-100 border-dashed">
                          <p class="text-gray-500 font-bold text-sm mb-5">No estás viviendo en ningún piso actualmente.</p>
                          
                          @if (!isOwner()) {
                            <button (click)="abrirModalCrearPiso()" class="bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 hover:bg-hover transition-all active:scale-95">
                              + Crear un nuevo piso
                            </button>
                          }
                        </div>
                      }
                    </div>

                    <div>
                      <h3 class="text-xs font-black uppercase tracking-widest mb-4 text-secondary">Solicitudes Enviadas</h3>
                      @if (misSolicitudesEnviadas().length === 0) {
                        <div class="bg-bgMain p-8 rounded-3xl text-center border border-gray-100 border-dashed">
                          <p class="text-gray-500 font-bold text-sm">No has enviado ninguna solicitud de alquiler.</p>
                        </div>
                      } @else {
                        <div class="space-y-4">
                          @for (sol of misSolicitudesEnviadas(); track sol.id) {
                            <div class="bg-bgMain p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100">
                              <div>
                                <p class="font-black text-sm uppercase text-textMain">{{ sol.piso?.direccion || 'Piso Solicitado' }}</p>
                                <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Solicitado para: {{ sol.fechaInicio || sol.fInicio }}</p>
                              </div>
                              <span class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-full md:w-auto text-center"
                                    [ngClass]="{
                                      'bg-amber-100 text-amber-600': sol.estadoSolicitud === 'PENDIENTE',
                                      'bg-green-100 text-green-600': sol.estadoSolicitud === 'ACEPTADA',
                                      'bg-red-100 text-red-600': sol.estadoSolicitud === 'RECHAZADA' || sol.estadoSolicitud === 'CANCELADA'
                                    }">
                                {{ sol.estadoSolicitud }}
                              </span>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }

                  @if (activeTab() === 'NOTIFICACIONES') {
                    <h2 class="text-2xl font-black text-textMain mb-8 uppercase tracking-tighter">Actividad Reciente</h2>

                    <div class="mb-10">
                      <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-textMain/50">
                        Solicitudes para {{ isOwner() ? 'tus pisos' : 'tu piso actual' }}
                      </h3>
                      @if (solicitudesRecibidas().length === 0) {
                        <p class="text-gray-400 font-bold text-sm bg-bgMain p-6 rounded-2xl">No hay solicitudes pendientes.</p>
                      } @else {
                        <div class="space-y-4">
                          @for (sol of solicitudesRecibidas(); track sol.id) {
                            <div class="bg-white border-l-4 border-primary p-5 rounded-r-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-y border-r border-gray-100">
                              
                              <div class="flex items-center gap-4">
                                <a [routerLink]="['/perfil', sol.usuario?.id]" class="shrink-0 hover:opacity-80 transition-opacity">
                                  <img [src]="sol.usuario?.foto || 'https://api.dicebear.com/7.x/initials/svg?seed=' + sol.usuario?.nombreUsuario" class="w-12 h-12 rounded-full object-cover border-2 border-bgMain shadow-sm">
                                </a>
                                <div>
                                  <p class="text-sm font-medium text-gray-700">
                                    <a [routerLink]="['/perfil', sol.usuario?.id]" class="font-black text-textMain uppercase hover:text-primary transition-colors cursor-pointer">
                                      {{ sol.usuario?.nombre || sol.usuario?.nombreUsuario || 'Alguien' }}
                                    </a> 
                                    quiere unirse al piso.
                                  </p>
                                  <p class="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Entrada: {{ sol.fechaInicio || sol.fInicio }}</p>
                                </div>
                              </div>
                              
                              @if (isOwner()) {
                                <div class="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                  <button (click)="resolverSolicitud(sol.id, false)"
                                          class="flex-1 sm:flex-none bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all hover:bg-red-100">
                                    Rechazar
                                  </button>
                                  <button (click)="resolverSolicitud(sol.id, true)"
                                          class="flex-1 sm:flex-none bg-primary text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/30 active:scale-95 transition-all hover:bg-hover">
                                    Aceptar
                                  </button>
                                </div>
                              } @else {
                                <span class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest w-full sm:w-auto text-center mt-2 sm:mt-0">
                                  Pendiente de revisión
                                </span>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <div>
                      <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-textMain/50">Nuevas Valoraciones</h3>
                      @if (feedbacksRecibidos().length === 0) {
                        <p class="text-gray-400 font-bold text-sm bg-bgMain p-6 rounded-2xl">Nadie te ha valorado recientemente.</p>
                      } @else {
                        <div class="space-y-3">
                          @for (fb of feedbacksRecibidos().slice(0, 5); track fb.id) {
                            <div class="bg-white border-l-4 border-alert p-5 rounded-r-2xl shadow-sm flex justify-between items-center border-y border-r border-gray-100">
                              <div>
                                <p class="text-sm font-medium text-gray-700">
                                  <span class="font-black text-textMain uppercase">{{ fb.nombreUsuarioPone || 'Un compañero' }}</span> te ha valorado con <span class="font-black">{{ fb.calificacion }} estrellas</span>.
                                </p>
                              </div>
                              <button (click)="activeTab.set('FEEDBACKS')" class="text-alert font-black uppercase text-[10px] tracking-widest hover:underline ml-4">Ver</button>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else {
                <!-- VISTA DE PERFIL AJENO -->
                <div class="space-y-6">
                  
                  @if (usuario()!.bloqueado) {
                    <div class="bg-red-100 border border-red-200 text-red-600 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                      <div class="flex items-center gap-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        <div>
                          <h4 class="font-black uppercase tracking-widest text-sm">Usuario Bloqueado</h4>
                          <p class="font-bold text-xs mt-1">Este perfil ha sido suspendido por un administrador.</p>
                        </div>
                      </div>
                    </div>
                  }

                  @if (isAdmin()) {
                    <div class="bg-gray-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                      <span class="text-white font-black uppercase tracking-widest text-[10px]">Panel de Administración</span>
                      <button (click)="toggleBloqueoUsuario()" 
                              class="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                              [ngClass]="usuario()!.bloqueado ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'">
                        {{ usuario()!.bloqueado ? 'Desbloquear Usuario' : 'Bloquear Usuario' }}
                      </button>
                    </div>
                  }

                  <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Información de contacto</h3>
                    <div class="space-y-4">
                      @if (usuario()!.email) {
                        <div class="flex items-center gap-4 text-textMain font-bold">
                          <svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {{ usuario()!.email }}
                        </div>
                      }
                      @if (usuario()!.telefono) {
                        <div class="flex items-center gap-4 text-textMain font-bold">
                          <svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {{ usuario()!.telefono }}
                        </div>
                      }
                    </div>
                  </div>

                  <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Valoraciones Recibidas</h3>
                    @if (perfilAjenoFeedbacks().length === 0) {
                      <p class="text-gray-400 font-bold text-sm text-center py-6 border border-dashed border-gray-200 rounded-3xl">Aún no tiene valoraciones visibles.</p>
                    } @else {
                      <div class="space-y-4">
                        @for (fb of perfilAjenoFeedbacks(); track fb.id) {
                          <div class="p-5 bg-bgMain rounded-[2rem] border border-gray-100 flex gap-4">
                            <img [src]="fb.fotoUsuarioPone || 'https://api.dicebear.com/7.x/initials/svg?seed=' + fb.nombreUsuarioPone" class="w-12 h-12 rounded-full object-cover border border-white shadow-sm">
                            <div class="flex-1">
                              <div class="flex justify-between items-start mb-2">
                                <span class="font-black uppercase text-xs tracking-widest text-textMain">{{ fb.nombreUsuarioPone }}</span>
                                <div class="flex text-alert">
                                  @for (s of [1,2,3,4,5]; track s) {
                                    <svg class="w-3 h-3" [attr.fill]="s <= fb.calificacion ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                  }
                                </div>
                              </div>
                              <p class="text-gray-600 font-medium italic text-sm">"{{ fb.descripcion }}"</p>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="flex flex-col items-center py-32">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cargando perfil...</p>
          </div>
        }

      </div>
    </div>

    @if (showAbandonarModal()) {
      <div class="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 class="text-2xl font-black text-textMain uppercase tracking-tighter mb-4">¿Abandonar Piso?</h3>
          <p class="text-gray-500 font-medium mb-8 leading-relaxed">
            Estás a punto de cancelar tu estancia actual en este piso. Esta acción finalizará tu contrato y notificará al propietario. ¿Estás completamente seguro?
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button (click)="showAbandonarModal.set(false)" class="flex-1 py-4 bg-bgMain text-textMain rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">
              Cancelar
            </button>
            <button (click)="confirmarAbandonarPiso()" class="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-red-600 transition-all active:scale-95">
              Sí, Abandonar
            </button>
          </div>
        </div>
      </div>
    }

    @if (showCrearPisoModal()) {
      <div class="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-[3rem] w-full max-w-2xl p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-2xl font-black text-textMain uppercase tracking-tighter">Crear Nuevo Piso</h3>
            <button (click)="showCrearPisoModal.set(false)" class="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-textMain transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <form (ngSubmit)="crearPiso()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dirección *</label>
                <input [(ngModel)]="pisoCrearForm.direccion" name="dir" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary" required>
              </div>
              <div class="md:col-span-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
                <textarea [(ngModel)]="pisoCrearForm.descripcion" name="desc" rows="2" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tamaño (m²) *</label>
                <input type="number" [(ngModel)]="pisoCrearForm.tamanio" name="tam" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary" required>
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio Total/Mes *</label>
                <input type="number" [(ngModel)]="pisoCrearForm.precioMes" name="precio" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary" required>
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Habitaciones *</label>
                <input type="number" [(ngModel)]="pisoCrearForm.numTotalHabitaciones" name="hab" class="w-full bg-bgMain border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-primary" required>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 mt-4">Comodidades</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label class="flex items-center gap-2 p-3 bg-bgMain rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" [(ngModel)]="pisoCrearForm.wifi" name="wifi" class="w-4 h-4 accent-primary">
                  <span class="font-bold text-[10px] uppercase tracking-widest">WiFi</span>
                </label>
                <label class="flex items-center gap-2 p-3 bg-bgMain rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" [(ngModel)]="pisoCrearForm.animales" name="anim" class="w-4 h-4 accent-primary">
                  <span class="font-bold text-[10px] uppercase tracking-widest">Mascotas</span>
                </label>
                <label class="flex items-center gap-2 p-3 bg-bgMain rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" [(ngModel)]="pisoCrearForm.garaje" name="garaje" class="w-4 h-4 accent-primary">
                  <span class="font-bold text-[10px] uppercase tracking-widest">Garaje</span>
                </label>
                <label class="flex items-center gap-2 p-3 bg-bgMain rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" [(ngModel)]="pisoCrearForm.tabaco" name="tab" class="w-4 h-4 accent-primary">
                  <span class="font-bold text-[10px] uppercase tracking-widest">Fumar</span>
                </label>
              </div>
            </div>

            <button type="submit" class="w-full py-4 mt-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 hover:bg-hover transition-all active:scale-95">
              Publicar Piso
            </button>
          </form>
        </div>
      </div>
    }
  `
})
export class PerfilUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private feedbackService = inject(FeedbackService);
  private alquilerService = inject(AlquilerService);
  private pisoService = inject(PisoService);
  private location = inject(Location);

  currentUserId = computed(() => this.authService.userId());

  usuario = signal<any | null>(null);
  activeTab = signal<Tab>('INFO');

  isMyProfile = computed(() => {
    const currentId = this.authService.userId();
    const pId = this.usuario()?.id;
    return currentId !== null && pId !== undefined && currentId === pId;
  });

  isOwner = computed(() => this.authService.role() === 'OWNER');
  isAdmin = computed(() => this.authService.role() === 'ADMINISTRADOR');

  tabs = [
    { id: 'INFO' as Tab, label: 'Información' },
    { id: 'SEGURIDAD' as Tab, label: 'Seguridad' },
    { id: 'FEEDBACKS' as Tab, label: 'Feedbacks' },
    { id: 'ALQUILERES' as Tab, label: 'Alquileres' },
    { id: 'NOTIFICACIONES' as Tab, label: 'Notificaciones' }
  ];

  perfilForm = { dni: '', nombre: '', apellido1: '', apellido2: '', anioNacimiento: null as string | null, genero: '', telefono: '', email: '', foto: '', mensajePresentacion: '' };
  passwordForm = { nombreUsuario: '', passwordActual: '', passwordNueva: '', repetirPasswordNueva: '' };

  feedbacks = signal<any[]>([]);

  feedbacksPorValorar = computed(() =>
    this.feedbacks().filter(fb => fb.estadoFeedback === 'PENDIENTE' && fb.idUsuarioPone === this.currentUserId())
  );

  feedbacksRecibidos = computed(() =>
    this.feedbacks().filter(fb => fb.estadoFeedback === 'VALORADO' && fb.idUsuarioRecibe === this.currentUserId())
  );

  feedbacksEsperando = computed(() =>
    this.feedbacks().filter(fb => fb.estadoFeedback === 'PENDIENTE' && fb.idUsuarioRecibe === this.currentUserId())
  );

  feedbacksEnviados = computed(() =>
    this.feedbacks().filter(fb => fb.estadoFeedback === 'VALORADO' && fb.idUsuarioPone === this.currentUserId())
  );

  perfilAjenoFeedbacks = computed(() => {
    const uId = this.usuario()?.id;
    if (!uId) return [];
    return this.feedbacks().filter(fb => fb.idUsuarioRecibe === uId && fb.estadoFeedback === 'VALORADO');
  });

  misSolicitudesEnviadas = signal<any[]>([]);
  solicitudesRecibidas = signal<any[]>([]);
  miEstancia = signal<any>(null);
  pisoEstancia = signal<PisoDTO | null>(null);

  // LA VARIABLE CORREGIDA PARA ARREGLAR LA MATEMÁTICA Y EL ERROR DE COMPILACIÓN
  precioEstanciaCalculado = computed(() => {
    const p = this.pisoEstancia();
    if (!p) return 0;
    return p.precioMes / p.numOcupantesActual;
  });

  showAbandonarModal = signal<boolean>(false);

  showCrearPisoModal = signal<boolean>(false);
  pisoCrearForm: any = {
    direccion: '', descripcion: '', tamanio: null, precioMes: null,
    numTotalHabitaciones: null, wifi: false, animales: false, garaje: false, tabaco: false
  };

  notificacionesNoLeidas = computed(() => this.solicitudesRecibidas().length);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarUsuario(Number(idParam));
    } else {
      const myId = this.authService.userId();
      myId ? this.cargarUsuario(myId) : this.router.navigate(['/login']);
    }
  }

  cargarUsuario(id: number) {
    this.usuarioService.getUsuarioById(id).subscribe({
      next: (u: any) => {
        this.usuario.set(u);

        this.cargarFeedbacks(u.id);

        if (this.isMyProfile()) {
          this.perfilForm = {
            dni: u.dni || '',
            nombre: u.nombre || '',
            apellido1: u.apellido1 || '',
            apellido2: u.apellido2 || '',
            anioNacimiento: u.anioNacimiento ? u.anioNacimiento.toString().split('T')[0] : null,
            genero: u.genero || 'PREFIERO_NO_DECIRLO',
            telefono: u.telefono || '',
            email: u.email || '',
            foto: u.foto || '',
            mensajePresentacion: u.mensajePresentacion || ''
          };
          this.passwordForm.nombreUsuario = u.nombreUsuario || '';
          this.cargarDatosExtra(u.id);
        }
      },
      error: () => this.notificationService.showError('Error al cargar el usuario')
    });
  }

  cargarFeedbacks(idUsuario: number) {
    this.feedbackService.getFeedbacksByUsuario(idUsuario).subscribe({
      next: (fbs) => {
        const visibles = fbs.filter((fb: any) => fb.estadoFeedback !== 'NO_DISPONIBLE' && fb.visible !== false);
        this.feedbacks.set(visibles);
      },
      error: (err) => console.error('Error al cargar feedbacks', err)
    });
  }

  cargarDatosExtra(myId: number) {
    // 1. Historial de solicitudes enviadas a otros pisos
    this.alquilerService.historialDeUsuario(myId).subscribe({
      next: (als) => this.misSolicitudesEnviadas.set(als)
    });

    // 2. Piso donde resido actualmente (Inquilino o Dueño)
    this.alquilerService.alquilerActual(myId).subscribe({
      next: (alq) => {
        if (alq?.id) {
          this.miEstancia.set(alq);
          const pisoId = alq.piso?.id || alq.pisoId || (typeof alq.piso === 'number' ? alq.piso : null);
          if (pisoId) {
            this.pisoService.getPisoById(pisoId).subscribe(p => this.pisoEstancia.set(p));

            // ✅ AQUÍ ESTABA BIEN (tiene pisoId y myId)
            this.alquilerService.solicitudesPendientes(pisoId, myId).subscribe(sols => {
              const marcadas = sols.map((s: any) => ({ ...s, _isMyResidence: true }));
              this.solicitudesRecibidas.update(curr => {
                const nuevos = marcadas.filter(m => !curr.some(c => c.id === m.id));
                return [...curr, ...nuevos];
              });
            });
          }
        }
      },
      error: () => { }
    });

    // 3. Pisos que son míos en PROPIEDAD (Owner o Admin)
    if (this.isOwner() || this.isAdmin()) {
      this.pisoService.getLibres().subscribe(pisos => {
        const misPisos = pisos.filter((p: any) => p.owner?.id === myId || p.idOwner === myId);

        misPisos.forEach((p: any) => {
          // ❌ AQUÍ ESTABA EL ERROR: Le faltaba el ", myId"
          this.alquilerService.solicitudesPendientes(p.id, myId).subscribe(sols => {
            const marcadas = sols.map((s: any) => ({ ...s, _isMyProperty: true }));
            this.solicitudesRecibidas.update(curr => {
              let updated = curr.map(c => {
                const found = marcadas.find(m => m.id === c.id);
                return found ? { ...c, _isMyProperty: true } : c;
              });
              const nuevos = marcadas.filter(m => !updated.some(u => u.id === m.id));
              return [...updated, ...nuevos];
            });
          });
        });
      });
    }
  }

  guardarPerfil() {
    const myId = this.usuario()?.id;
    if (!myId) return;
    this.usuarioService.actualizarPerfil(myId, this.perfilForm).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.notificationService.showSuccess('Perfil actualizado con éxito');
      },
      error: () => this.notificationService.showError('Error al actualizar el perfil')
    });
  }

  cambiarPassword() {
    const myId = this.usuario()?.id;
    if (!myId) return;

    if (this.passwordForm.passwordNueva && this.passwordForm.passwordNueva !== this.passwordForm.repetirPasswordNueva) {
      this.notificationService.showError('Las nuevas contraseñas no coinciden');
      return;
    }

    const payload: any = {};
    const nuevoUsername = this.passwordForm.nombreUsuario?.trim();
    const usernameActual = this.usuario()?.nombreUsuario;

    if (nuevoUsername && nuevoUsername !== usernameActual) {
      payload.nombreUsuario = nuevoUsername;
    }

    if (this.passwordForm.passwordNueva?.trim()) {
      payload.passwordActual = this.passwordForm.passwordActual;
      payload.passwordNueva = this.passwordForm.passwordNueva;
      payload.repetirPassword = this.passwordForm.repetirPasswordNueva;
    }

    if (Object.keys(payload).length === 0) {
      this.notificationService.showInfo('No has cambiado ningún dato');
      return;
    }

    this.usuarioService.cambiarCredenciales(myId, payload).subscribe({
      next: () => {
        this.notificationService.showSuccess('Credenciales actualizadas con éxito');
        if (payload.nombreUsuario) {
          this.usuario.update(u => ({ ...u, nombreUsuario: payload.nombreUsuario }));
        }
        this.passwordForm.passwordActual = '';
        this.passwordForm.passwordNueva = '';
        this.passwordForm.repetirPasswordNueva = '';
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.error?.error || 'Contraseña actual incorrecta o usuario en uso.';
        this.notificationService.showError(errorMsg);
      }
    });
  }

  enviarValoracion(fb: any) {
    const myId = this.authService.userId();
    const companeroId = fb.idUsuarioRecibe;

    if (!myId || !companeroId) {
      this.notificationService.showError('No se pudo identificar al usuario a valorar');
      return;
    }
    if (!fb.tempCalificacion || !fb.tempDescripcion) {
      this.notificationService.showError('Falta puntuación o comentario');
      return;
    }

    const dto = { calificacion: fb.tempCalificacion, descripcion: fb.tempDescripcion };

    this.feedbackService.valorar(myId, companeroId, dto).subscribe({
      next: () => {
        this.notificationService.showSuccess('¡Valoración enviada!');
        this.cargarFeedbacks(this.usuario().id);
      },
      error: () => this.notificationService.showError('Error al enviar la valoración')
    });
  }

  confirmarAbandonarPiso() {
    const myId = this.authService.userId();
    const idPiso = this.pisoEstancia()?.id;
    if (!myId || !idPiso) return;

    this.alquilerService.abandonarPiso(idPiso, myId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Has abandonado el piso correctamente.');
        this.showAbandonarModal.set(false);
        this.miEstancia.set(null);
        this.pisoEstancia.set(null);
        this.solicitudesRecibidas.set([]);
        this.activeTab.set('INFO');
      },
      error: (err) => {
        let errorMsg = 'Hubo un error al abandonar el piso.';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          } else if (err.error.error) {
            errorMsg = err.error.error;
          }
        }
        this.notificationService.showError(errorMsg);
        this.showAbandonarModal.set(false);
      }
    });
  }

  resolverSolicitud(idAlquiler: number, aceptar: boolean) {
    const myId = this.authService.userId();
    if (!myId) return;
    this.alquilerService.resolverSolicitud(idAlquiler, myId, aceptar).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Solicitud ${aceptar ? 'aceptada' : 'rechazada'}`);
        this.solicitudesRecibidas.update(list => list.filter(a => a.id !== idAlquiler));
      },
      error: () => this.notificationService.showError('Error al resolver la solicitud')
    });
  }

  toggleBloqueoUsuario() {
    const targetUser = this.usuario();
    if (!targetUser) return;

    // Usamos las funciones correctas del servicio, igual que en el panel de admin
    const accion$ = targetUser.bloqueado
      ? this.usuarioService.desbloquearUsuario(targetUser.id)
      : this.usuarioService.bloquearUsuario(targetUser.id);

    accion$.subscribe({
      next: () => {
        // Actualizamos el estado visual en Angular al instante
        this.usuario.update(u => ({ ...u, bloqueado: !targetUser.bloqueado }));
        this.notificationService.showSuccess(
          `Usuario ${targetUser.bloqueado ? 'desbloqueado' : 'bloqueado'} con éxito`
        );
      },
      error: (err) => {
        // Atrapamos el error de Java (ej: "No puedes bloquear al owner...")
        let errorMsg = 'Error al cambiar el estado del usuario.';
        if (err.error) {
          if (typeof err.error === 'string') errorMsg = err.error;
          else if (err.error.message) errorMsg = err.error.message;
          else if (err.error.error) errorMsg = err.error.error;
        }
        this.notificationService.showError(errorMsg);
      }
    });
  }

  abrirModalCrearPiso() {
    this.pisoCrearForm = {
      direccion: '', descripcion: '', tamanio: null, precioMes: null,
      numTotalHabitaciones: null, wifi: false, animales: false, garaje: false, tabaco: false
    };
    this.showCrearPisoModal.set(true);
  }

  crearPiso() {
    const myId = this.authService.userId();
    if (!myId) return;

    if (!this.pisoCrearForm.direccion || !this.pisoCrearForm.tamanio || !this.pisoCrearForm.precioMes || !this.pisoCrearForm.numTotalHabitaciones) {
      this.notificationService.showError('Por favor, rellena todos los campos marcados con *');
      return;
    }

    this.pisoService.crearPiso(myId, this.pisoCrearForm).subscribe({
      next: (respuestaBackend: any) => {
        this.notificationService.showSuccess('¡Piso creado con éxito! Ahora eres el propietario.');
        this.showCrearPisoModal.set(false);

        this.router.navigate(['/mi-perfil']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        console.error("Error completo del backend:", err);
        const errorMsg = err?.error?.message || err?.error?.error || 'Error al intentar crear el piso.';
        this.notificationService.showError(errorMsg);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}