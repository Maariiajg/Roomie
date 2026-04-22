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
}
