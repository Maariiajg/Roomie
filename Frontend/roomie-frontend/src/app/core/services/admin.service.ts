import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PisoDTO } from '../models/piso.dto';

export interface AdminSolicitudDTO {
  id: number;
  usuario?: { id: number; nombreUsuario: string; email: string };
  estado?: string;
  fechaSolicitud?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8081';

  getTodosPisos(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.baseUrl}/piso`);
  }

  getPisosLibres(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.baseUrl}/piso/libres`);
  }

  getSolicitudesAdmin(): Observable<AdminSolicitudDTO[]> {
    return this.http.get<AdminSolicitudDTO[]>(`${this.baseUrl}/administrador/solicitudes`);
  }

  deletePiso(idPiso: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/piso/${idPiso}`);
  }
}
