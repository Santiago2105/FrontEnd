// src/app/components/restaurante-mensajes/restaurante-mensajes.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Mensaje } from '../../model/mensaje.model';
import { Restaurante } from '../../model/restaurante.model';
import { Anuncio } from '../../model/anuncio.model';

import { MensajeService } from '../../services/mensaje.service';
import { RestauranteService } from '../../services/restaurante.service';
import { AnuncioService } from '../../services/anuncio.service';

@Component({
  selector: 'app-restaurante-mensajes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurante-mensajes.html',
  styleUrl: './restaurante-mensajes.css',
})
export class RestauranteMensajes implements OnInit {
  mensajes: Mensaje[] = [];

  loading = true;
  error = '';
  mensajeInfo = '';

  restaurante!: Restaurante;

  constructor(
    private mensajeService: MensajeService,
    private restauranteService: RestauranteService,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit(): void {
    this.cargarMensajes();
  }

  recargar() {
    this.cargarMensajes();
  }

  private cargarMensajes(): void {
    this.loading = true;
    this.error = '';
    this.mensajeInfo = '';
    this.mensajes = [];

    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      this.error = 'No se encontró el usuario. Inicia sesión nuevamente.';
      this.loading = false;
      return;
    }

    const usuarioId = Number(storedUserId);

    // 1️⃣ Buscar restaurante por usuario
    this.restauranteService.findByUsuario(usuarioId).subscribe({
      next: (rest) => {
        if (!rest || !rest.id) {
          this.mensajeInfo =
            'Aún no has registrado el perfil de tu restaurante.';
          this.loading = false;
          return;
        }

        this.restaurante = rest;

        // 2️⃣ Buscar anuncios del restaurante
        this.anuncioService.getByRestaurante(rest.id).subscribe({
          next: (anuncios: Anuncio[]) => {
            if (!anuncios || anuncios.length === 0) {
              this.mensajeInfo =
                'Aún no has publicado anuncios, por lo que no tienes mensajes.';
              this.loading = false;
              return;
            }

            // 3️⃣ Cargar mensajes de cada anuncio
            let pendientes = anuncios.length;

            anuncios.forEach((a) => {
              this.mensajeService.getByAnuncio(a.id!).subscribe({
                next: (msgs) => {
                  if (msgs && msgs.length > 0) {
                    this.mensajes.push(...msgs);
                  }

                  pendientes--;
                  if (pendientes === 0) {
                    if (this.mensajes.length === 0) {
                      this.mensajeInfo =
                        'No se han recibido mensajes en tus anuncios.';
                    }

                    // Ordenar por fecha (más recientes primero)
                    this.mensajes.sort(
                      (x, y) =>
                        new Date(y.fechaEnvio).getTime() -
                        new Date(x.fechaEnvio).getTime()
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
          'No se pudo obtener la información del restaurante asociado.';
        this.loading = false;
      },
    });
  }
}
