import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FotoDTO {
  id: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class FotoService {
  private http = inject(HttpClient);
  private backendUrl = `${environment.apiUrl}/foto`;

  getFotosByPiso(idPiso: number): Observable<FotoDTO[]> {
    return this.http.get<FotoDTO[]>(`${this.backendUrl}/${idPiso}/fotos`);
  }

  anadirFoto(url: string, idPiso: number, idOwner: number): Observable<any> {
    const urlSegura = encodeURIComponent(url);
    return this.http.post(`${this.backendUrl}?url=${urlSegura}&idPiso=${idPiso}&idOwner=${idOwner}`, {});
  }

  eliminarFoto(idFoto: number, idPiso: number, idOwner: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${idFoto}?idPiso=${idPiso}&idOwner=${idOwner}`);
  }
}