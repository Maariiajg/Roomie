import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/components/toast/notification.service';
import { InicioSesionDTO } from '../../../core/models/inicio-sesion.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-bgMain p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <h2 class="text-3xl font-bold text-center text-textMain mb-6">Iniciar Sesión</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-textMain mb-1">Usuario</label>
            <input 
              type="text" 
              formControlName="nombreUsuario"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Tu nombre de usuario"
            >
            @if (loginForm.get('nombreUsuario')?.touched && loginForm.get('nombreUsuario')?.hasError('required')) {
              <p class="text-red-500 text-sm mt-1">El nombre de usuario es requerido</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-textMain mb-1">Contraseña</label>
            <input 
              type="password" 
              formControlName="password"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            >
             @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) {
              <p class="text-red-500 text-sm mt-1">La contraseña es requerida</p>
            }
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-primary hover:bg-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Cargando...' : 'Entrar' }}
          </button>
        </form>

        <p class="text-center text-gray-600 mt-6 font-medium">
          ¿No tienes una cuenta? 
          <a routerLink="/registro" class="text-secondary hover:underline">Regístrate aquí</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = false;

  loginForm: FormGroup = this.fb.group({
    nombreUsuario: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const dto: InicioSesionDTO = this.loginForm.value;

    this.authService.login(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Error al iniciar sesión. Revisa tus credenciales.';
        this.notificationService.showError(msg);
      }
    });
  }
}
