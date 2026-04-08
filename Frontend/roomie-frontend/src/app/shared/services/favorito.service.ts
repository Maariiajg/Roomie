import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:8081/favorito';

  // Obtener favoritos de un usuario
  getFavoritosByUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}`, {
      params: { idUsuario: idUsuario.toString() }
    });
  }

  // Añadir a favoritos
  anadirFavorito(idUsuario: number, idPiso: number): Observable<any> {
    return this.http.post(`${this.backendUrl}`, null, {
      params: { 
        idUsuario: idUsuario.toString(),
        idPiso: idPiso.toString()
      }
    });
  }

  // Eliminar de favoritos
  eliminarFavorito(idUsuario: number, idPiso: number): Observable<void> {
    return this.http.delete<void>(`${this.backendUrl}`, {
      params: { 
        idUsuario: idUsuario.toString(),
        idPiso: idPiso.toString()
      }
    });
  }
}
