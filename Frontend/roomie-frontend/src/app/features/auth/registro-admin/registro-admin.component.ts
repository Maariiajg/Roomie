import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/components/toast/notification.service';
import { Genero } from '../../../core/models/usuario-registro.dto';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const repetirPassword = control.get('repetirPassword');
  if (password && repetirPassword && password.value !== repetirPassword.value) {
    repetirPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro-admin.component.html'
})
export class RegistroAdminComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = false;
  generos = Object.values(Genero);

  registroForm: FormGroup = this.fb.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    repetirPassword: ['', Validators.required],
    nombre: ['', Validators.required],
    apellido1: ['', Validators.required],
    apellido2: [''],
    dni: ['', Validators.required],
    anioNacimiento: ['', Validators.required],
    genero: ['', Validators.required],
    telefono: ['', Validators.required],
    foto: ['']
  }, { validators: passwordMatchValidator });

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const dto = this.registroForm.value;

    this.authService.registerAdmin(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.showSuccess('Cuenta de Administrador creada correctamente. ¡Inicia sesión!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Error al registrar administrador. Revisa los datos.';
        this.notificationService.showError(msg);
      }
    });
  }

  get f() { return this.registroForm.controls; }
}
