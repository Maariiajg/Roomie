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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8091';

  private initialState: AuthState = {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role') as UserRole,
    isLoggedIn: !!localStorage.getItem('token'),
    username: localStorage.getItem('username')
  };

  private state = signal<AuthState>(this.initialState);

  readonly token = computed(() => this.state().token);
  readonly role = computed(() => this.state().role);
  readonly isLoggedIn = computed(() => this.state().isLoggedIn);
  readonly username = computed(() => this.state().username);

  constructor() {}

  login(dto: InicioSesionDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.backendUrl}/auth/login/usuario`, dto)
      .pipe(
        tap(response => {
          this.setAuthState(response.accessToken, response.rol as UserRole, response.nombreUsuario);
        })
      );
  }

  register(dto: UsuarioRegistroDTO): Observable<any> {
    return this.http.post(`${this.backendUrl}/usuario/registrar`, dto);
  }

  registerAdmin(dto: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/administrador/registrar`, dto);
  }

  setAuthState(token: string, role: UserRole, username: string) {
    localStorage.setItem('token', token);
    if (role) localStorage.setItem('role', role);
    if (username) localStorage.setItem('username', username);
    
    this.state.set({
      token,
      role,
      username,
      isLoggedIn: true
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    this.state.set({
      token: null,
      role: null,
      username: null,
      isLoggedIn: false
    });
  }
}
