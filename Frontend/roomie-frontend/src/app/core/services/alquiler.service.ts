import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlquilerDTO } from '../models/alquiler.dto';

@Injectable({ providedIn: 'root' })
export class AlquilerService {
  private http    = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/alquiler';

  historialDeUsuario(idUsuario: number): Observable<AlquilerDTO[]> {
    return this.http.get<AlquilerDTO[]>(`${this.baseUrl}/usuario/${idUsuario}/historial`);
  }

  alquilerActual(idUsuario: number): Observable<AlquilerDTO> {
    return this.http.get<AlquilerDTO>(`${this.baseUrl}/usuario/${idUsuario}/actual`);
  }

  solicitudesPendientes(idPiso: number): Observable<AlquilerDTO[]> {
    return this.http.get<AlquilerDTO[]>(`${this.baseUrl}/piso/${idPiso}/solicitudes`);
  }

  resolverSolicitud(idAlquiler: number, idDueno: number, aceptar: boolean): Observable<AlquilerDTO> {
    return this.http.put<AlquilerDTO>(
      `${this.baseUrl}/${idAlquiler}/resolver?idDueno=${idDueno}&aceptar=${aceptar}`, {}
    );
  }

  cancelarSolicitud(idAlquiler: number, idUsuario: number): Observable<AlquilerDTO> {
    return this.http.put<AlquilerDTO>(`${this.baseUrl}/${idAlquiler}/cancelar?idUsuario=${idUsuario}`, {});
  }

  solicitar(idUsuario: number, idPiso: number, fInicio: string): Observable<AlquilerDTO> {
    return this.http.post<AlquilerDTO>(
      `${this.baseUrl}/solicitar?idUsuario=${idUsuario}&idPiso=${idPiso}&fInicio=${fInicio}`, {}
    );
  }

  // Admin: obtener todos los alquileres globales
  getAllAlquileres(): Observable<AlquilerDTO[]> {
    return this.http.get<AlquilerDTO[]>(this.baseUrl);
  }
}
