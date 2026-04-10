import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { InicioSesionDTO } from '../models/inicio-sesion.dto';
import { AuthResponseDTO } from '../models/auth-response.dto';
import { UsuarioRegistroDTO } from '../models/usuario-registro.dto';

export type UserRole = 'USUARIO' | 'OWNER' | 'ADMINISTRADOR' | null;

interface AuthState {
  token: string | null;
  role: UserRole;
  isLoggedIn: boolean;
  username: string | null;
  idUsuario: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8081';

  private initialState: AuthState = {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role') as UserRole,
    isLoggedIn: !!localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    idUsuario: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  };

  private state = signal<AuthState>(this.initialState);

  readonly token = computed(() => this.state().token);
  readonly role = computed(() => this.state().role);
  readonly isLoggedIn = computed(() => this.state().isLoggedIn);
  readonly username = computed(() => this.state().username);
  readonly userId = computed(() => this.state().idUsuario);

  constructor() {}

  login(dto: InicioSesionDTO): Observable<AuthResponseDTO> {
    // Intentamos login de usuario normal por defecto
    return this.http.post<AuthResponseDTO>(`${this.backendUrl}/auth/login/usuario`, dto)
      .pipe(
        tap(response => {
          this.setAuthState(response.accessToken, response.rol as UserRole, response.nombreUsuario, response.idUsuario);
        })
      );
  }

  // Método específico para admin si se requiere
  loginAdmin(dto: InicioSesionDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.backendUrl}/auth/login/administrador`, null, {
      params: { 
        nombreUsuario: dto.nombreUsuario || '', 
        password: dto.password || '' 
      }
    }).pipe(
      tap(response => {
        this.setAuthState(response.accessToken, response.rol as UserRole, response.nombreUsuario, response.idUsuario);
      })
    );
  }

  register(dto: UsuarioRegistroDTO): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/usuario/registrar`, dto);
  }

  registerAdmin(dto: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/administrador/registrar`, dto);
  }

  setAuthState(token: string, role: UserRole, username: string, idUsuario: number) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role || '');
    localStorage.setItem('username', username);
    
    if (idUsuario !== undefined && idUsuario !== null) {
      localStorage.setItem('userId', idUsuario.toString());
    }
    
    this.state.set({
      token,
      role,
      username,
      idUsuario,
      isLoggedIn: true
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');

    this.state.set({
      token: null,
      role: null,
      username: null,
      idUsuario: null,
      isLoggedIn: false
    });
  }
}
