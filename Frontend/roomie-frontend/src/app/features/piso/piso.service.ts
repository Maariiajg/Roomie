import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PisoDTO } from '../../core/models/piso.dto';

@Injectable({
  providedIn: 'root'
})
export class PisoService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8091/piso';

  getAllPisos(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(this.backendUrl);
  }

  getLibres(): Observable<PisoDTO[]> {
    return this.http.get<PisoDTO[]>(`${this.backendUrl}/libres`);
  }
}
