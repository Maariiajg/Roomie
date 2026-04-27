import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Modelos y Servicios
import { PisoDTO, PerfilUsuarioDTO } from '../../core/models/piso.dto';
import { PisoService } from '../piso/piso.service';
import { AuthService } from '../../core/auth/auth.service';
import { FavoritoService } from '../../shared/services/favorito.service';
import { AlquilerService } from '../../core/services/alquiler.service';
import { FeedbackService } from '../../shared/services/feedback.service';

@Component({
  selector: 'app-piso-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (piso()) {
      <div class="relative min-h-screen bg-black">
        
        <div class="sticky top-0 h-[60vh] w-full z-0">
          <img [src]="currentImage()" alt="Foto Piso" class="w-full h-full object-cover transition-opacity duration-700 ease-in-out">
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/30"></div>

          <button (click)="goBack()" class="absolute top-8 left-8 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/30 hover:scale-105 transition-all shadow-lg border border-white/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button (click)="toggleFavorito()" class="absolute top-8 right-8 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/30 hover:scale-105 transition-all shadow-lg border border-white/20">
            <svg class="w-6 h-6 transition-colors" [ngClass]="isFav() ? 'text-red-500 fill-current' : 'text-white stroke-current fill-none'" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button (click)="prevImage()" class="absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md z-10 transition-all border border-white/10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button (click)="nextImage()" class="absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md z-10 transition-all border border-white/10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>

          <div class="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            @for (foto of getFotosSeguras(); track $index) {
              <div class="w-2.5 h-2.5 rounded-full transition-all duration-300" [ngClass]="$index === currentImageIndex() ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40 hover:bg-white/70 cursor-pointer'"></div>
            }
          </div>
        </div>

        <div class="relative z-10 w-full bg-bgMain mt-[-6vh] rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] min-h-[60vh] pb-32">
          
          <div class="max-w-6xl mx-auto px-6 sm:px-12 py-14">
            
            <div class="mb-14">
              <h1 class="text-4xl sm:text-5xl font-black text-textMain uppercase tracking-tighter leading-none mb-8">
                {{ piso()!.direccion }}
              </h1>
              <div class="flex flex-wrap gap-4 sm:gap-6">
                <div class="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[150px]">
                  <div class="p-3 bg-primary/10 rounded-2xl text-primary">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div class="flex flex-col"><span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ubicación</span><span class="font-black text-textMain text-base">{{ piso()!.poblacion }}</span></div>
                </div>
                <div class="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[150px]">
                  <div class="p-3 bg-primary/10 rounded-2xl text-primary">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                  </div>
                  <div class="flex flex-col"><span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Superficie</span><span class="font-black text-textMain text-base">{{ piso()!.tamanio }} m²</span></div>
                </div>
                <div class="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[150px]">
                  <div class="p-3 bg-primary/10 rounded-2xl text-primary">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  </div>
                  <div class="flex flex-col"><span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Plazas</span><span class="font-black text-textMain text-base">{{ piso()!.numTotalHabitaciones }}</span></div>
                </div>
                <div class="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[150px]">
                  <div class="p-3 bg-primary/10 rounded-2xl text-primary">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  </div>
                  <div class="flex flex-col"><span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Viviendo</span><span class="font-black text-textMain text-base">{{ piso()!.numOcupantesActual }} Personas</span></div>
                </div>
              </div>
            </div>

            @if (integrantes().length > 0) {
              <div class="mb-14">
                <h2 class="text-sm font-black text-textMain/50 uppercase tracking-[0.2em] mb-6 pl-2">Tus futuros Roomies</h2>
                <div class="flex gap-4 overflow-x-auto pb-6 hide-scrollbar">
                  @for (user of integrantes(); track user.id) {
                    <div (click)="abrirModalUsuario(user)" class="min-w-[140px] bg-white rounded-[2rem] p-5 flex flex-col items-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex-shrink-0 group">
                      <div class="relative mb-3">
                        <img [src]="user.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.nombreUsuario" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:border-primary/20 transition-colors">
                      </div>
                      <span class="font-black text-textMain text-sm text-center truncate w-full">{{ user.nombreUsuario }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="mb-14 bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-gray-50 relative overflow-hidden">
              <div class="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <h2 class="text-sm font-black text-textMain/50 uppercase tracking-[0.2em] mb-4">Sobre el piso</h2>
              <p class="text-textMain/80 italic leading-loose text-lg font-medium">"{{ piso()!.descripcion || 'Sin descripción disponible.' }}"</p>
            </div>

            <div class="mb-14">
              <h2 class="text-sm font-black text-textMain/50 uppercase tracking-[0.2em] mb-6 pl-2">Comodidades</h2>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="py-6 px-4 rounded-[2rem] flex flex-col items-center gap-3 transition-all border" [ngClass]="piso()!.wifi ? 'bg-white shadow-sm border-gray-100' : 'bg-gray-50 border-transparent opacity-50 grayscale'">
                  <div [ngClass]="piso()!.wifi ? 'text-primary' : 'text-gray-400'">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                  </div>
                  <span class="text-xs font-black text-textMain uppercase tracking-wider">WiFi</span>
                </div>
                <div class="py-6 px-4 rounded-[2rem] flex flex-col items-center gap-3 transition-all border" [ngClass]="piso()!.animales ? 'bg-white shadow-sm border-gray-100' : 'bg-gray-50 border-transparent opacity-50 grayscale'">
                  <div [ngClass]="piso()!.animales ? 'text-primary' : 'text-gray-400'">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  </div>
                  <span class="text-xs font-black text-textMain uppercase tracking-wider">Mascotas</span>
                </div>
                <div class="py-6 px-4 rounded-[2rem] flex flex-col items-center gap-3 transition-all border" [ngClass]="piso()!.garaje ? 'bg-white shadow-sm border-gray-100' : 'bg-gray-50 border-transparent opacity-50 grayscale'">
                  <div [ngClass]="piso()!.garaje ? 'text-primary' : 'text-gray-400'">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H12c-.6 0-1.2.3-1.6.8L8.3 10c0 0-2.7.6-4.5 1.1-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM8 17a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <span class="text-xs font-black text-textMain uppercase tracking-wider">Garaje</span>
                </div>
                <div class="py-6 px-4 rounded-[2rem] flex flex-col items-center gap-3 transition-all border" [ngClass]="piso()!.tabaco ? 'bg-white shadow-sm border-gray-100' : 'bg-gray-50 border-transparent opacity-50 grayscale'">
                  <div [ngClass]="piso()!.tabaco ? 'text-primary' : 'text-gray-400'">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16h12M4 12h16M8 8V6m4 2V6m4 2V6" /></svg>
                  </div>
                  <span class="text-xs font-black text-textMain uppercase tracking-wider">{{ piso()!.tabaco ? 'Fumadores' : 'Sin Humos' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-[2rem] p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
              <div>
                <p class="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">Tu cuota estimada</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-6xl font-black text-textMain tracking-tighter">{{ precioCalculado() | number:'1.0-0' }}€</span>
                  <span class="text-lg font-bold text-gray-500">/mes</span>
                </div>
              </div>
              @if (isResidente()) {
                <span class="bg-primary text-white text-xs px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-md">Residente Actual</span>
              }
            </div>

          </div>
        </div>

        <div class="fixed bottom-8 right-8 z-40">
          @if (isOwner()) {
            <button (click)="gestionarPiso()" class="bg-textMain text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Gestionar Piso
            </button>
          } @else if (!isResidente() && !hasActiveRent()) {
            <button (click)="intentarSolicitar()" class="bg-primary text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(63,182,168,0.4)] hover:bg-hover hover:-translate-y-1 transition-all flex items-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Solicitar Alquiler
            </button>
          }
        </div>

        @if (showCalendarModal()) {
          <div class="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div class="bg-bgMain w-full sm:w-[450px] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 sm:p-10 flex flex-col max-h-[85vh] shadow-2xl border border-white/20 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
              <div class="flex justify-between items-center mb-8">
                <h3 class="text-2xl font-black text-textMain uppercase tracking-tighter">¿Cuándo te mudas?</h3>
                <button (click)="showCalendarModal.set(false)" class="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div class="grid grid-cols-4 gap-3 overflow-y-auto pr-2 pb-6 custom-scrollbar flex-grow">
                @for (dia of diasDisponibles(); track dia.fecha) {
                  <button (click)="selectedDate.set(dia.fechaISO)"
                          class="py-4 px-2 rounded-2xl flex flex-col items-center justify-center border-2 transition-all"
                          [ngClass]="selectedDate() === dia.fechaISO ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-gray-200 bg-white hover:border-primary/40 text-textMain'">
                    <span class="text-[10px] font-black uppercase tracking-wider">{{ dia.diaSemana }}</span>
                    <span class="text-2xl font-black leading-none mt-2">{{ dia.numero }}</span>
                    <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-2">{{ dia.mes }}</span>
                  </button>
                }
              </div>

              <button (click)="confirmarSolicitud()" [disabled]="!selectedDate() || isSubmitting()" 
                      class="mt-6 w-full py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-2"
                      [ngClass]="selectedDate() && !isSubmitting() ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-hover hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
                {{ isSubmitting() ? 'Enviando...' : 'Confirmar Solicitud' }}
              </button>
            </div>
          </div>
        }

        @if (showUserModal() && selectedUser()) {
          <div class="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div class="bg-bgMain w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20">
              <div class="bg-textMain p-8 relative">
                <button (click)="showUserModal.set(false)" class="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div class="flex flex-col items-center pt-6">
                  <img [src]="selectedUser()!.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedUser()!.nombreUsuario" class="w-28 h-28 rounded-full border-4 border-primary object-cover shadow-xl mb-4">
                  <h3 class="text-white font-black text-2xl uppercase tracking-tighter">{{ selectedUser()!.nombreUsuario }}</h3>
                  <p class="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">{{ selectedUser()!.nombre }} {{ selectedUser()!.apellido1 }}</p>
                </div>
              </div>
              
              <div class="p-8 overflow-y-auto bg-bgMain flex-grow custom-scrollbar">
                @if (selectedUser()!.mensajePresentacion) {
                  <div class="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative">
                    <div class="absolute -top-3 left-6 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Sobre mí</div>
                    <p class="text-sm italic text-gray-600 text-center leading-relaxed font-medium mt-2">"{{ selectedUser()!.mensajePresentacion }}"</p>
                  </div>
                }

                <h4 class="text-xs font-black text-textMain/50 uppercase tracking-[0.2em] mb-4 pl-2">Valoraciones como Roomie</h4>
                <div class="space-y-4">
                  @if (userFeedbacks().length === 0) {
                    <p class="text-sm font-medium text-gray-400 text-center py-6 bg-white rounded-3xl border border-gray-100">Aún no tiene valoraciones.</p>
                  } @else {
                    @for (fb of userFeedbacks(); track fb.id) {
                      <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
                        <img [src]="fb.emisor?.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=rand'" class="w-12 h-12 rounded-full object-cover">
                        <div>
                          <div class="flex text-alert mb-2">
                            @for (star of [1,2,3,4,5]; track star) {
                              <svg class="w-4 h-4" [ngClass]="star <= fb.puntuacion ? 'fill-current' : 'text-gray-200'" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            }
                          </div>
                          <p class="text-sm text-textMain/80 font-medium leading-snug">{{ fb.descripcion }}</p>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="min-h-screen bg-bgMain flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p class="mt-6 text-xs font-black text-gray-400 uppercase tracking-widest">Cargando detalles...</p>
      </div>
    }
  `
})
export class PisoDetalleComponent implements OnInit, OnDestroy {
  // Inyecciones
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private pisoService = inject(PisoService);
  private authService = inject(AuthService);
  private favoritoService = inject(FavoritoService);
  private alquilerService = inject(AlquilerService);
  private feedbackService = inject(FeedbackService);

  // Estados
  piso = signal<PisoDTO | null>(null);
  integrantes = signal<PerfilUsuarioDTO[]>([]);
  isFav = signal<boolean>(false);
  currentImageIndex = signal<number>(0);

  // Modales
  showCalendarModal = signal<boolean>(false);
  showUserModal = signal<boolean>(false);
  selectedUser = signal<PerfilUsuarioDTO | null>(null);
  userFeedbacks = signal<any[]>([]);

  // Reserva
  selectedDate = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  hasActiveRent = signal<boolean>(false);

  // Computados
  isOwner = computed(() => {
    const p = this.piso();
    const userId = this.authService.userId();
    return p && userId ? p.owner.id === userId : false;
  });

  isResidente = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return false;
    return this.integrantes().some(u => u.id === userId);
  });

  precioCalculado = computed(() => {
    const p = this.piso();
    if (!p) return 0;
    // Si es residente, asume que 'precioMesPersona' ya viene del backend (o hacemos la división entre los actuales)
    if (this.isResidente() && p.precioMesPersona) {
      return p.precioMesPersona;
    }
    // Fórmula para visitantes/nuevos inquilinos:
    return p.precioMes / (p.numOcupantesActual + 1);
  });

  currentImage = computed(() => {
    const fotos = this.getFotosSeguras();
    return fotos[this.currentImageIndex()];
  });

  diasDisponibles = computed(() => {
    // Genera array de 60 días desde mañana
    const dias = [];
    const hoy = new Date();
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 1; i <= 60; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      dias.push({
        fechaISO: fecha.toISOString().split('T')[0],
        diaSemana: diasSemana[fecha.getDay()],
        numero: fecha.getDate(),
        mes: meses[fecha.getMonth()],
        fecha: fecha
      });
    }
    return dias;
  });

  ngOnInit() {
    // 1. Ocultar Layout Global
    document.body.classList.add('hide-layout');

    // 2. Cargar Datos
    const idPiso = Number(this.route.snapshot.paramMap.get('id'));
    if (idPiso) {
      this.cargarPiso(idPiso);
      this.cargarIntegrantes(idPiso);
      this.verificarFavorito(idPiso);
      this.verificarAlquilerActivo();
    }
  }

  ngOnDestroy() {
    // Restaurar Layout Global al salir
    document.body.classList.remove('hide-layout');
  }

  // --- CARGA DE DATOS ---

  cargarPiso(id: number) {
    this.pisoService.getPisoById(id).subscribe({
      next: (data) => this.piso.set(data),
      error: () => this.router.navigate(['/resultados'])
    });
  }

  cargarIntegrantes(id: number) {
    this.pisoService.getUsuariosInPiso(id).subscribe({
      next: (users) => this.integrantes.set(users)
    });
  }

  verificarFavorito(idPiso: number) {
    const userId = this.authService.userId();
    if (userId) {
      this.favoritoService.getFavoritosByUsuario(userId).subscribe({
        next: (favs) => {
          const isFavorito = favs.some((f: any) => f.piso.id === idPiso);
          this.isFav.set(isFavorito);
        }
      });
    }
  }

  verificarAlquilerActivo() {
    const userId = this.authService.userId();
    if (userId) {
      this.alquilerService.alquilerActual(userId).subscribe({
        next: (alquiler) => this.hasActiveRent.set(!!alquiler),
        error: () => this.hasActiveRent.set(false) // Si da 404, no tiene alquiler activo
      });
    }
  }

  // --- NAVEGACIÓN Y ACCIONES CARRUSEL ---

  goBack() {
    this.location.back();
  }

  getFotosSeguras(): string[] {
    // Placeholders reales hasta que uses el endpoint GET /piso/{id}/fotos
    return [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'
    ];
  }

  nextImage() {
    const len = this.getFotosSeguras().length;
    this.currentImageIndex.update(i => (i + 1) % len);
  }

  prevImage() {
    const len = this.getFotosSeguras().length;
    this.currentImageIndex.update(i => (i - 1 + len) % len);
  }

  toggleFavorito() {
    const userId = this.authService.userId();
    const currentPiso = this.piso();

    if (!userId || !currentPiso) {
      alert('Inicia sesión para añadir a favoritos.');
      return;
    }

    const estadoActual = this.isFav();
    this.isFav.set(!estadoActual);

    if (estadoActual) {
      this.favoritoService.eliminarFavorito(userId, currentPiso.id).subscribe({
        error: () => this.isFav.set(true)
      });
    } else {
      this.favoritoService.anadirFavorito(userId, currentPiso.id).subscribe({
        error: () => this.isFav.set(false)
      });
    }
  }

  // --- BOTÓN OWNER ---
  gestionarPiso() {
    this.router.navigate(['/mi-piso']);
  }

  // --- FLUJO DE SOLICITUD ---

  intentarSolicitar() {
    if (!this.authService.userId()) {
      alert('Inicia sesión para poder solicitar alquilar este piso.');
      this.router.navigate(['/login']);
      return;
    }
    this.showCalendarModal.set(true);
  }

  confirmarSolicitud() {
    const userId = this.authService.userId();
    const currentPiso = this.piso();
    const fecha = this.selectedDate();

    if (!userId || !currentPiso || !fecha) return;

    this.isSubmitting.set(true);

    this.alquilerService.solicitar(userId, currentPiso.id, fecha).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showCalendarModal.set(false);
        alert('¡Solicitud de alquiler enviada con éxito al propietario!');
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Hubo un error al enviar la solicitud. Inténtalo de nuevo.');
      }
    });
  }

  // --- MODAL DE USUARIO (INTEGRANTE) ---

  abrirModalUsuario(user: PerfilUsuarioDTO) {
    this.selectedUser.set(user);
    this.userFeedbacks.set([]); // Limpiamos anteriores
    this.showUserModal.set(true);

    // Cargar feedbacks de este usuario
    this.feedbackService.getFeedbacksByUsuario(user.id).subscribe({
      next: (feedbacks) => this.userFeedbacks.set(feedbacks)
    });
  }
}