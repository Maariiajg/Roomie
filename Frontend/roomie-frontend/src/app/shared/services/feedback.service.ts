import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8081/feedback';

  getFeedbacksByUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/usuario/${idUsuario}/todos`);
  }

  valorar(idUsuarioPone: number, idUsuarioRecibe: number, dto: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/${idUsuarioPone}/${idUsuarioRecibe}`, dto);
  }
}
