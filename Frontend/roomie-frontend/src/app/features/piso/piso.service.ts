import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PisoDTO } from '../../core/models/piso.dto';

@Injectable({
  providedIn: 'root'
})
export class PisoService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/piso'; // Ajusta la ruta si en tu Controller es diferente

  // ==========================================
  // LECTURA DE PISOS (Buscador y Feed)
  // ==========================================

  getAllPisos(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(this.baseUrl);
  }

  getLibres(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.baseUrl}/libres`);
  }

  filtrar(filtros: any): Observable<PisoDTO[]> {
    let params = new HttpParams();

    if (filtros.precioMin !== null && filtros.precioMin !== undefined) {
      params = params.set('precioMin', filtros.precioMin);
    }
    if (filtros.precioMax !== null && filtros.precioMax !== undefined) {
      params = params.set('precioMax', filtros.precioMax);
    }
    if (filtros.garaje !== null && filtros.garaje !== undefined) {
      params = params.set('garaje', filtros.garaje);
    }
    if (filtros.animales !== null && filtros.animales !== undefined) {
      params = params.set('animales', filtros.animales);
    }
    if (filtros.wifi !== null && filtros.wifi !== undefined) {
      params = params.set('wifi', filtros.wifi);
    }
    if (filtros.tabaco !== null && filtros.tabaco !== undefined) {
      params = params.set('tabaco', filtros.tabaco);
    }

    return this.http.get<PisoDTO[]>(`${this.baseUrl}/filtrar`, { params });
  }

  // ==========================================
  // DETALLES DEL PISO Y DEPENDENCIAS
  // ==========================================

  getPisoById(idPiso: number): Observable<PisoDTO> {
    return this.http.get<PisoDTO>(`${this.baseUrl}/${idPiso}`);
  }

  getPisoResidenteById(idPiso: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idPiso}/residente`);
  }

  getUsuariosInPiso(idPiso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idPiso}/usuarios`);
  }

  // ==========================================
  // GESTIÓN EXCLUSIVA DEL PROPIETARIO (OWNER)
  // ==========================================

  // Obtiene el piso del que es dueño el usuario
  getPisoMio(idOwner: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mio/${idOwner}`);
  }

  crearPiso(idUsuario: number, pisoData: any): Observable<PisoDTO> {
    return this.http.post<PisoDTO>(`${this.baseUrl}?idUsuario=${idUsuario}`, pisoData);
  }

  actualizarPiso(idPiso: number, pisoData: any): Observable<PisoDTO> {
    return this.http.put<PisoDTO>(`${this.baseUrl}/${idPiso}`, pisoData);
  }

  cederPiso(idPiso: number, datosCeder: { idOwnerActual: number; idNuevoOwner: number }): Observable<PisoDTO> {
    return this.http.put<PisoDTO>(`${this.baseUrl}/${idPiso}/ceder`, datosCeder);
  }

  eliminarPiso(idPiso: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idPiso}`);
  }

  // ==========================================
  // GESTIÓN EXCLUSIVA DE ADMINISTRADOR
  // ==========================================

  deletePiso(idPiso: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idPiso}`);
  }
}