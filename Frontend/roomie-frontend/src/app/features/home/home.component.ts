import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain">
      <!-- Hero Section -->
      <section class="relative w-full h-[70vh] min-h-[600px] flex items-center justify-center bg-cover bg-center" style="background-image: url('imagenes/home_hero.png');">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        
        <div class="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 class="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight drop-shadow-2xl">
            Vivir acompañado <br>
            <span class="text-primary italic">nunca fue tan fácil.</span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-medium drop-shadow-lg">
            La plataforma líder para conectar con los compañeros de piso ideales y gestionar estancias sin complicaciones.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-2xl mx-auto">
            <a routerLink="/seleccion-registro" class="w-full sm:w-auto bg-secondary hover:bg-alert hover:text-textMain text-white font-black py-5 px-12 rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-xl uppercase tracking-wider">
              Registrar
            </a>
            <a routerLink="/login" class="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white font-black py-5 px-12 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-xl uppercase tracking-wider">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </section>

      <!-- Secciones Informativas -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        
        <!-- Explicación Roomie -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div class="space-y-6">
            <span class="text-primary font-black uppercase tracking-widest text-sm">Nuestro Propósito</span>
            <h2 class="text-4xl font-black text-textMain leading-tight">¿Qué es Roomie y cuál es nuestro objetivo?</h2>
            <div class="h-2 w-20 bg-primary rounded-full"></div>
            <p class="text-lg text-gray-600 leading-relaxed">
              Roomie nace como una solución integral para el creciente mercado de vivienda compartida. Nuestro objetivo es eliminar la fricción en la búsqueda de compañeros, asegurando que encuentres personas con estilos de vida compatibles con el tuyo. 
              <br><br>
              Gestionamos no solo el listado de habitaciones, sino también la convivencia, facilitando la comunicación entre propietarios y residentes mediante un sistema transparente y seguro.
            </p>
          </div>
          <div class="bg-gray-100 rounded-[3rem] p-12 aspect-square flex items-center justify-center border-2 border-dashed border-gray-200">
             <div class="text-center">
               <svg class="w-32 h-32 text-primary/30 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
               <p class="mt-4 text-gray-400 font-medium">[Ilustración conceptual Home]</p>
             </div>
          </div>
        </div>

        <!-- Recomendaciones Conviviencia -->
        <div class="bg-primary/5 rounded-[4rem] p-12 md:p-24 border border-primary/10">
          <div class="max-w-4xl mx-auto text-center space-y-8">
            <span class="text-secondary font-black uppercase tracking-widest text-sm">Comunidad Saludable</span>
            <h2 class="text-4xl font-black text-textMain">Recomendaciones para una mejor convivencia</h2>
            <div class="h-2 w-20 bg-alert mx-auto rounded-full"></div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
              <div class="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div class="text-alert text-3xl mb-4 font-black">01.</div>
                <h3 class="font-bold text-xl mb-3">Comunicación Abierta</h3>
                <p class="text-gray-500 text-sm">Hablar de las normas de limpieza y ruido desde el primer día evita conflictos futuros.</p>
              </div>
              <div class="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div class="text-alert text-3xl mb-4 font-black">02.</div>
                <h3 class="font-bold text-xl mb-3">Respeto al Espacio</h3>
                <p class="text-gray-500 text-sm">El orden en las zonas comunes es la base de un hogar equilibrado y feliz.</p>
              </div>
              <div class="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div class="text-alert text-3xl mb-4 font-black">03.</div>
                <h3 class="font-bold text-xl mb-3">Gestión de Gastos</h3>
                <p class="text-gray-500 text-sm">Utiliza Roomie para mantener las cuentas claras y los pagos siempre al día.</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  `
})
export class HomeComponent {}
