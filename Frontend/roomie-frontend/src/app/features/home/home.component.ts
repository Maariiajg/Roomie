import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bgMain">
      <section class="relative w-full h-[75vh] min-h-[600px] flex items-center justify-center bg-cover bg-center" style="background-image: url('imagenes/home_hero.png');">
        <div class="absolute inset-0 bg-black/65 backdrop-blur-[2px]"></div>
       
        <div class="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 class="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter drop-shadow-2xl">
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

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div class="space-y-8">
            <div>
              <span class="text-primary font-black uppercase tracking-[0.3em] text-xs">Nuestro Propósito</span>
              <h2 class="text-5xl font-black text-textMain leading-none mt-2 tracking-tighter uppercase italic">
                ¿Qué es Roomie y cuál es nuestro objetivo?
              </h2>
              <div class="h-2 w-32 bg-primary rounded-full mt-6"></div>
            </div>
            
            <div class="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
              <p>
                Roomie nace como una solución integral para el creciente mercado de vivienda compartida. Nuestro objetivo es eliminar la fricción en la búsqueda de compañeros, asegurando que encuentres personas con estilos de vida compatibles con el tuyo.
              </p>
              <p>
                Gestionamos no solo el listado de habitaciones, sino también la convivencia, facilitando la comunicación entre propietarios y residentes mediante un sistema transparente y seguro.
              </p>
              <p class="bg-primary/5 p-6 rounded-3xl border-l-8 border-primary italic">
                Comienza como usuario para encontrar tu piso ideal o si ya tienes un piso que necesites compartir conviértete en propietario creando un piso y aceptando las solicitudes.
              </p>
              <div class="flex items-center gap-4">
                <a routerLink="/manual" class="inline-flex items-center gap-2 text-textMain font-black uppercase tracking-widest text-sm hover:text-primary transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  Consultar manual de usuario
                </a>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="absolute -inset-4 bg-primary/10 rounded-[4rem] rotate-3 -z-10"></div>
            <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=1200" 
                 alt="Convivencia Roomie" 
                 class="rounded-[3rem] shadow-2xl w-full aspect-[4/5] object-cover border-8 border-white">
            <div class="absolute -bottom-10 -left-10 bg-alert p-8 rounded-3xl shadow-xl hidden md:block max-w-[200px]">
                <p class="text-textMain font-black uppercase text-xs tracking-widest">Comunidad Segura</p>
                <p class="text-textMain/70 text-xs mt-2 font-bold">Mediación de conflictos garantizada.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-textMain py-32">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-20">
            <span class="text-alert font-black uppercase tracking-[0.4em] text-xs">Vivir Mejor</span>
            <h2 class="text-5xl md:text-6xl font-black text-white mt-4 tracking-tighter uppercase italic">Tips de Convivencia</h2>
            <div class="h-1.5 w-24 bg-alert mx-auto mt-6 rounded-full"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <div class="text-alert text-5xl font-black mb-6 opacity-50 group-hover:opacity-100 transition-opacity">01</div>
              <h3 class="text-white text-2xl font-black uppercase mb-4 tracking-tight">La charla del "Día 1"</h3>
              <p class="text-gray-400 leading-relaxed font-medium">
                El primer día que un nuevo integrante llegue al piso, intentad reuniros para darle la bienvenida, presentaros y explicar cómo funciona la convivencia. Esto ayuda a romper el hielo y evita malentendidos.
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <div class="text-alert text-5xl font-black mb-6 opacity-50 group-hover:opacity-100 transition-opacity">02</div>
              <h3 class="text-white text-2xl font-black uppercase mb-4 tracking-tight">Comunicación Oficial</h3>
              <p class="text-gray-400 leading-relaxed font-medium">
                Cread un grupo de mensajería para avisos rápidos. <strong class="text-white">Consejo de oro:</strong> no discutáis por ahí. Los roces es mejor hablarlos en persona para evitar malas interpretaciones.
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <div class="text-alert text-5xl font-black mb-6 opacity-50 group-hover:opacity-100 transition-opacity">03</div>
              <h3 class="text-white text-2xl font-black uppercase mb-4 tracking-tight">Recoge lo que uses</h3>
              <p class="text-gray-400 leading-relaxed font-medium">
                La limpieza es la clave. No dejes rastro en zonas comunes: friega tus platos, limpia el baño tras usarlo y mantén el orden. Un calendario rotativo para limpieza a fondo es lo ideal.
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group lg:col-span-1">
              <div class="text-alert text-5xl font-black mb-6 opacity-50 group-hover:opacity-100 transition-opacity">04</div>
              <h3 class="text-white text-2xl font-black uppercase mb-4 tracking-tight">Pagos y Cuentas</h3>
              <p class="text-gray-400 leading-relaxed font-medium">
                El primer mes es proporcional al día de entrada. Después, habrá un día fijo. <strong class="text-white">Importante:</strong> si decides irte, avisa con la antelación acordada (normalmente 30 días).
              </p>
            </div>

            <div class="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group lg:col-span-2">
              <div class="text-alert text-5xl font-black mb-6 opacity-50 group-hover:opacity-100 transition-opacity">05</div>
              <h3 class="text-white text-2xl font-black uppercase mb-4 tracking-tight">Visitas y Parejas</h3>
              <p class="text-gray-400 leading-relaxed font-medium">
                Acordad cuántos días puede quedarse un invitado y las reglas sobre fiestas o silencio. Recomendamos a los propietarios detallar esto en la descripción del piso para que todo esté claro desde el inicio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-4xl mx-auto px-4 py-24 text-center">
        <div class="bg-bgMain p-12 rounded-[3rem] border-2 border-dashed border-gray-200">
            <svg class="w-16 h-16 text-primary mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <p class="text-xl text-textMain font-bold leading-relaxed">
                Los administradores nos encargaremos de mediar en los conflictos en la app. Si consideras que algún usuario atenta contra las reglas puedes contactar con nosotros. 
                Lo más importante es crear entre todos una comunidad segura.
            </p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .mi-clase-ajuste {
      margin-top: -80px; /* Ajusta los píxeles exactos del alto de tu franja blanca */
      position: relative;
      z-index: 0;
    }
  `]
})
export class HomeComponent { }