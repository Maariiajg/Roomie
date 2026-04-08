import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilUsuarioDTO } from '../models/piso.dto';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8081/usuario';

  // Listar todos los usuarios y owners (Solo Admin)
  getUsuarios(): Observable<PerfilUsuarioDTO[]> {
    return this.http.get<PerfilUsuarioDTO[]>(this.backendUrl);
  }

  // Obtener perfil detallado
  getUsuarioById(id: number): Observable<PerfilUsuarioDTO> {
    return this.http.get<PerfilUsuarioDTO>(`${this.backendUrl}/${id}`);
  }

  // Bloquear usuario (Banear)
  bloquearUsuario(id: number): Observable<PerfilUsuarioDTO> {
    return this.http.put<PerfilUsuarioDTO>(`${this.backendUrl}/${id}/bloquear`, {});
  }

  // Desbloquear usuario
  desbloquearUsuario(id: number): Observable<PerfilUsuarioDTO> {
    return this.http.put<PerfilUsuarioDTO>(`${this.backendUrl}/${id}/desbloquear`, {});
  }
}
