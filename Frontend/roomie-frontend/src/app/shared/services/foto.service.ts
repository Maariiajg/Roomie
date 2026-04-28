import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FotoDTO {
  id: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class FotoService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8081/foto';

  getFotosByPiso(idPiso: number): Observable<FotoDTO[]> {
    return this.http.get<FotoDTO[]>(`${this.backendUrl}/${idPiso}/fotos`);
  }

  anadirFoto(url: string, idPiso: number, idOwner: number): Observable<any> {
    return this.http.post(`${this.backendUrl}?url=${url}&idPiso=${idPiso}&idOwner=${idOwner}`, {});
  }

  eliminarFoto(idFoto: number, idPiso: number, idOwner: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${idFoto}?idPiso=${idPiso}&idOwner=${idOwner}`);
  }
}