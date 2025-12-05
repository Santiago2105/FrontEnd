// src/app/components/restaurante-postulaciones/restaurante-postulaciones.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Postulacion } from '../../model/postulacion.model';
import { Restaurante } from '../../model/restaurante.model';
import { Anuncio } from '../../model/anuncio.model';

import { PostulacionService } from '../../services/postulacion.service';
import { RestauranteService } from '../../services/restaurante.service';
import { AnuncioService } from '../../services/anuncio.service';

@Component({
  selector: 'app-restaurante-postulaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurante-postulaciones.html',
  styleUrl: './restaurante-postulaciones.css',
})
export class RestaurantePostulaciones implements OnInit {

  postulaciones: Postulacion[] = [];

  loading = true;
  error = '';
  mensaje = '';

  restaurante!: Restaurante;

  constructor(
    private postulacionService: PostulacionService,
    private restauranteService: RestauranteService,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit(): void {
    this.cargarPostulaciones();
  }

  private cargarPostulaciones(): void {
    this.loading = true;
    this.error = '';
    this.mensaje = '';
    this.postulaciones = [];

    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      this.error = 'No se encontró el usuario. Inicia sesión nuevamente.';
      this.loading = false;
      return;
    }

    const usuarioId = Number(storedUserId);

    // 1️⃣ Obtener el restaurante del usuario
    this.restauranteService.findByUsuario(usuarioId).subscribe({
      next: (rest) => {
        if (!rest || !rest.id) {
          this.mensaje =
            'Aún no has registrado el perfil de tu restaurante.';
          this.loading = false;
          return;
        }

        this.restaurante = rest;

        // 2️⃣ Obtener los anuncios del restaurante
        this.anuncioService.getByRestaurante(rest.id).subscribe({
          next: (anuncios: Anuncio[]) => {
            if (!anuncios || anuncios.length === 0) {
              this.mensaje =
                'Aún no has publicado anuncios, por lo que no tienes postulaciones.';
              this.loading = false;
              return;
            }

            // 3️⃣ Para cada anuncio obtener sus postulaciones
            let pendientes = anuncios.length;

            anuncios.forEach((a) => {
              this.postulacionService.getByAnuncio(a.id!).subscribe({
                next: (posts) => {
                  if (posts && posts.length > 0) {
                    this.postulaciones.push(...posts);
                  }

                  pendientes--;
                  if (pendientes === 0) {
                    if (this.postulaciones.length === 0) {
                      this.mensaje =
                        'No se han recibido postulaciones en tus anuncios.';
                    }

                    // Ordenar por fecha más reciente
                    this.postulaciones.sort(
                      (x, y) =>
                        new Date(y.fechaPostulacion).getTime() -
                        new Date(x.fechaPostulacion).getTime()
                    );

                    this.loading = false;
                  }
                },
                error: () => {
                  pendientes--;
                  if (pendientes === 0) {
                    this.loading = false;
                  }
                },
              });
            });
          },
          error: () => {
            this.error = 'No se pudieron cargar los anuncios.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error =
          'No se pudo obtener el restaurante asociado al usuario.';
        this.loading = false;
      },
    });
  }

  // 4️⃣ Cambiar estado de la postulación
  cambiarEstado(p: Postulacion, accepted: boolean): void {
    const nuevaPostulacion: Postulacion = {
      ...p,
      aceptada: accepted,
    };

    this.postulacionService
      .update(p.id!, nuevaPostulacion)
      .subscribe({
        next: () => {
          p.aceptada = accepted;
          this.mensaje = accepted
            ? 'Postulación aceptada.'
            : 'Postulación marcada como no aceptada.';
        },
        error: () => {
          this.error = 'No se pudo actualizar el estado de la postulación.';
        },
      });
  }
}
