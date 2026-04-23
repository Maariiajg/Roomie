import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PisoDTO } from '../../core/models/piso.dto';

@Injectable({
  providedIn: 'root'
})
export class PisoService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8081/piso';

  getAllPisos(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(this.backendUrl);
  }

  getPisoById(id: number): Observable<PisoDTO> {
    return this.http.get<PisoDTO>(`${this.backendUrl}/${id}`);
  }

  getPisoResidenteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/${id}/residente`);
  }

  getUsuariosInPiso(idPiso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/${idPiso}/usuarios`);
  }

  filtrar(filtros: any): Observable<PisoDTO[]> {
    let params = new HttpParams();
    
    if (filtros.precioMin !== null && filtros.precioMin !== undefined) 
      params = params.set('precioMin', filtros.precioMin.toString());
      
    if (filtros.precioMax !== null && filtros.precioMax !== undefined) 
      params = params.set('precioMax', filtros.precioMax.toString());
    
    if (filtros.garaje !== null && filtros.garaje !== undefined) 
      params = params.set('garaje', filtros.garaje.toString());
    
    if (filtros.animales !== null && filtros.animales !== undefined) 
      params = params.set('animales', filtros.animales.toString());
    
    if (filtros.wifi !== null && filtros.wifi !== undefined) 
      params = params.set('wifi', filtros.wifi.toString());
    
    if (filtros.tabaco !== null && filtros.tabaco !== undefined) 
      params = params.set('tabaco', filtros.tabaco.toString());

    return this.http.get<PisoDTO[]>(`${this.backendUrl}/filtrar`, { params });
  }

  getLibres(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.backendUrl}/libres`);
  }

  getAlquileresDePiso(idPiso: number): Observable<any[]> {
    // El backend no expone un endpoint público para ver los alquileres aceptados de un piso.
    // Devolvemos un array vacío para evitar el error 403 AnyRequest DenyAll.
    return new Observable(obs => {
      obs.next([]);
      obs.complete();
    });
  }

  deletePiso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.backendUrl}/${id}`);
  }
}
