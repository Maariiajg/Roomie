import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-seleccion-registro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 md:p-12 text-center">
        <h2 class="text-3xl font-bold text-textMain mb-2">Únete a Roomie</h2>
        <p class="text-gray-600 mb-10 text-lg">¿Cómo deseas registrarte?</p>
        
        <div class="flex flex-col gap-6 w-full">
          <!-- Botón Usuario -->
          <a routerLink="/registro/usuario" class="w-full relative group bg-secondary hover:bg-hover active:bg-alert text-white font-bold py-6 px-8 rounded-2xl shadow-md transition-all duration-300 transform hover:-translate-y-1 block ring-2 ring-transparent focus:ring-primary focus:outline-none overflow-hidden">
            <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span class="text-2xl pb-1 block">Como Usuario</span>
            <span class="text-sm font-normal opacity-90">Para buscar u ofrecer pisos compartidos</span>
          </a>

          <!-- Botón Administrador -->
          <a routerLink="/registro/admin" class="w-full relative group bg-secondary hover:bg-hover active:bg-alert text-white font-bold py-6 px-8 rounded-2xl shadow-md transition-all duration-300 transform hover:-translate-y-1 block ring-2 ring-transparent focus:ring-primary focus:outline-none overflow-hidden">
             <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span class="text-2xl pb-1 block">Como Administrador</span>
            <span class="text-sm font-normal opacity-90">Gestión de la plataforma y soporte</span>
          </a>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100">
          <a href="#" class="text-primary hover:text-hover hover:underline text-sm font-medium">¿Cuáles son las diferencias entre estos roles?</a>
        </div>
      </div>
    </div>
  `
})
export class SeleccionRegistroComponent {}
