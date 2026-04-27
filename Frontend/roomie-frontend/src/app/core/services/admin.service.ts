import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { PisoDTO } from '../models/piso.dto';

export interface AdminSolicitudDTO {
  id: number;
  nombre?: string;
  apellido1?: string;
  apellido2?: string;
  nombreUsuario?: string;
  email?: string;
  telefono?: string;
  foto?: string;
  aceptado?: boolean;
  usuario?: { id: number; nombreUsuario: string; email: string };
  estado?: string;
  fechaSolicitud?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8081';

  // 🌟 ESTADO COMPARTIDO: Contador global para el Badge
  public pendingAdminsCount = signal<number>(0);

  getTodosPisos(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.baseUrl}/piso`);
  }

  getPisosLibres(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.baseUrl}/piso/libres`);
  }

  deletePiso(idPiso: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/piso/${idPiso}`);
  }

  getAdministradores(): Observable<AdminSolicitudDTO[]> {
    return this.http.get<AdminSolicitudDTO[]>(`${this.baseUrl}/administrador`);
  }

  // 🌟 MODIFICADO: Filtra los rechazados locales y actualiza el contador global
  getSolicitudesAdmin(): Observable<AdminSolicitudDTO[]> {
    return this.http.get<AdminSolicitudDTO[]>(`${this.baseUrl}/administrador/solicitudes`).pipe(
      map(solicitudes => {
        // Leemos la memoria del navegador para saber a quién ignorar
        const rechazados = JSON.parse(localStorage.getItem('admins_rechazados') || '[]');
        const filtradas = solicitudes.filter(s => !rechazados.includes(s.id));

        // Actualizamos el badge global automáticamente
        this.pendingAdminsCount.set(filtradas.length);
        return filtradas;
      })
    );
  }

  // 🌟 MODIFICADO: Resta del contador al aceptar
  aceptarAdministrador(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/administrador/${id}/aceptar`, {}).pipe(
      tap(() => {
        this.pendingAdminsCount.update(count => Math.max(0, count - 1));
      })
    );
  }

  // 🌟 NUEVO: Finge el rechazo en el frontend hasta que exista el endpoint
  rechazarAdministradorLocal(id: number): void {
    const rechazados = JSON.parse(localStorage.getItem('admins_rechazados') || '[]');
    if (!rechazados.includes(id)) {
      rechazados.push(id);
      localStorage.setItem('admins_rechazados', JSON.stringify(rechazados));
    }
    // Restamos del contador global
    this.pendingAdminsCount.update(count => Math.max(0, count - 1));
  }
}