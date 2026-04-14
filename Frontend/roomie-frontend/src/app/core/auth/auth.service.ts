import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { InicioSesionDTO } from '../models/inicio-sesion.dto';
import { AuthResponseDTO } from '../models/auth-response.dto';
import { UsuarioRegistroDTO } from '../models/usuario-registro.dto';
import { environment } from '../../../environments/environment';

export type UserRole = 'USUARIO' | 'OWNER' | 'ADMINISTRADOR' | null;

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  rol: UserRole;
  isLoggedIn: boolean;
  nombreUsuario: string | null;
  idUsuario: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private backendUrl = environment.apiUrl;

  private initialState: AuthState = {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    rol: localStorage.getItem('rol') as UserRole,
    isLoggedIn: !!localStorage.getItem('accessToken'),
    nombreUsuario: localStorage.getItem('nombreUsuario'),
    idUsuario: localStorage.getItem('idUsuario') ? Number(localStorage.getItem('idUsuario')) : null
  };

  private state = signal<AuthState>(this.initialState);

  // Señales expuestas
  readonly accessToken = computed(() => this.state().accessToken);
  readonly refreshToken = computed(() => this.state().refreshToken);
  readonly getUserRole = computed(() => this.state().rol);
  // Alias de backward compatibility para no romper Header/Guards inmediatamente si ya lo usaban
  readonly role = computed(() => this.state().rol); 
  readonly isLoggedIn = computed(() => this.state().isLoggedIn);
  readonly username = computed(() => this.state().nombreUsuario);
  readonly userId = computed(() => this.state().idUsuario);

  constructor() {}

  login(dto: InicioSesionDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.backendUrl}/auth/login`, dto, {
      headers: { 'Content-Type': 'application/json' }
    })
      .pipe(
        tap(response => {
          this.setAuthState(
            response.accessToken, 
            response.refreshToken,
            response.rol as UserRole, 
            response.nombreUsuario, 
            response.idUsuario
          );
        })
      );
  }

  loginAdmin(dto: InicioSesionDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.backendUrl}/auth/login`, dto, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(response => {
        this.setAuthState(
            response.accessToken, 
            response.refreshToken,
            response.rol as UserRole, 
            response.nombreUsuario, 
            response.idUsuario
          );
      })
    );
  }

  register(dto: UsuarioRegistroDTO): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/auth/register`, dto).pipe(
      tap(response => {
        if(response.accessToken) {
          this.setAuthState(
            response.accessToken, 
            response.refreshToken,
            response.rol as UserRole, 
            response.nombreUsuario, 
            response.idUsuario
          );
        }
      })
    );
  }

  registerAdmin(dto: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/auth/register-admin`, dto);
  }

  setAuthState(accessToken: string, refreshToken: string, rol: UserRole, nombreUsuario: string, idUsuario: number) {
    localStorage.setItem('accessToken', accessToken);
    if(refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('rol', rol || '');
    localStorage.setItem('nombreUsuario', nombreUsuario);
    
    if (idUsuario !== undefined && idUsuario !== null) {
      localStorage.setItem('idUsuario', idUsuario.toString());
    }
    
    this.state.set({
      accessToken,
      refreshToken: refreshToken || null,
      rol,
      nombreUsuario,
      idUsuario,
      isLoggedIn: true
    });
  }

  updateTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.state.update(current => ({
      ...current,
      accessToken,
      refreshToken
    }));
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('idUsuario');

    // Backward compatibility cleaning
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');

    this.state.set({
      accessToken: null,
      refreshToken: null,
      rol: null,
      nombreUsuario: null,
      idUsuario: null,
      isLoggedIn: false
    });

    this.router.navigate(['/home']);
  }
}
