package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.services.AlquilerService;
import com.roomie.services.exceptions.alquiler.AlquilerException;

@RestController
@RequestMapping("/alquileres")
public class AlquilerController {

    @Autowired
    private AlquilerService alquilerService;

    /* =========================
       SOLICITAR ALQUILER
       ========================= */
    @PostMapping
    public ResponseEntity<?> solicitar(
            @RequestParam int idUsuario,
            @RequestParam int idPiso) {

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(alquilerService.solicitar(idUsuario, idPiso));
        } catch (AlquilerException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        }
    }

    /* =========================
       SOLICITUDES DE UN PISO
       ========================= */
    @GetMapping("/piso/{idPiso}")
    public ResponseEntity<?> solicitudes(
            @PathVariable int idPiso,
            @RequestParam int idDueno) {

        try {
            List<Alquiler> solicitudes =
                    alquilerService.solicitudesPendientes(
                            idPiso, idDueno);
            return ResponseEntity.ok(solicitudes);
        } catch (AlquilerException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ex.getMessage());
        }
    }

    /* =========================
       ACEPTAR / RECHAZAR
       ========================= */
    @PutMapping("/{idAlquiler}")
    public ResponseEntity<?> resolver(
            @PathVariable int idAlquiler,
            @RequestParam int idDueno,
            @RequestParam boolean aceptar) {

        try {
            return ResponseEntity.ok(
                    alquilerService.resolver(
                            idAlquiler, idDueno, aceptar));
        } catch (AlquilerException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ex.getMessage());
        }
    }

    /* =========================
       SALIR DEL PISO
       ========================= */
    @PutMapping("/{idAlquiler}/salir")
    public ResponseEntity<?> salir(
            @PathVariable int idAlquiler,
            @RequestParam int idUsuario) {

        try {
            alquilerService.salir(idAlquiler, idUsuario);
            return ResponseEntity.ok("Has salido del piso");
        } catch (AlquilerException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ex.getMessage());
        }
    }

    /* =========================
       FAVORITO
       ========================= */
    @PutMapping("/{idAlquiler}/favorito")
    public ResponseEntity<?> favorito(
            @PathVariable int idAlquiler) {

        try {
            return ResponseEntity.ok(
                    alquilerService.toggleFavorito(idAlquiler));
        } catch (AlquilerException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }
    }
}