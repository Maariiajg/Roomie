import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private backendUrl = `${environment.apiUrl}/feedback`;

  getFeedbacksByUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/usuario/${idUsuario}/todos`);
  }

  valorar(idUsuarioPone: number, idUsuarioRecibe: number, dto: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/${idUsuarioPone}/${idUsuarioRecibe}`, dto);
  }

  toggleVisibilidad(idFeedback: number) {
    return this.http.put(`${this.backendUrl}/${idFeedback}/toggle`, {});
  }
}
