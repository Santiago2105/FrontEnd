// src/app/services/anuncio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anuncio } from '../model/anuncio.model';

@Injectable({
  providedIn: 'root',
})
export class AnuncioService {
  private baseUrl = 'http://localhost:8080/upc/anuncios';

  constructor(private http: HttpClient) {}

  // ============================
  // CRUD BÁSICO
  // ============================

  listAll(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.baseUrl);
  }

  getById(id: number): Observable<Anuncio> {
    return this.http.get<Anuncio>(`${this.baseUrl}/${id}`);
  }

  create(anuncio: Anuncio): Observable<Anuncio> {
    return this.http.post<Anuncio>(this.baseUrl, anuncio);
  }

  update(id: number, anuncio: Anuncio): Observable<Anuncio> {
    return this.http.put<Anuncio>(`${this.baseUrl}/${id}`, anuncio);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ============================
  // CONSULTAS ESPECÍFICAS
  // ============================

  /**
   * Obtener anuncios por restauranteId
   * Ruta esperada en backend:
   *     GET /upc/anuncios/restaurante/{id}
   */
  getByRestaurante(restauranteId: number): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.baseUrl}/restaurante/${restauranteId}`);
  }

  /**
   * Obtener anuncios por artistaId (si lo usas)
   * Ruta esperada:
   *     GET /upc/anuncios/artista/{id}
   */
  getByArtista(artistaId: number): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.baseUrl}/artista/${artistaId}`);
  }
}
