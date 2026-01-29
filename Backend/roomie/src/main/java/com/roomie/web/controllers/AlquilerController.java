package com.roomie.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.services.AlquilerService;

@RestController
@RequestMapping("/alquileres")
public class AlquilerController {

    @Autowired
    private AlquilerService alquilerService;

    /* 1. Solicitar alquiler */
    @PostMapping
    public Alquiler solicitar(@RequestParam int idUsuario,
                              @RequestParam int idPiso) {
        return alquilerService.solicitarAlquiler(idUsuario, idPiso);
    }

    /* 3. Aceptar solicitud */
    @PutMapping("/{idAlquiler}/aceptar")
    public Alquiler aceptar(@PathVariable int idAlquiler) {
        return alquilerService.aceptarSolicitud(idAlquiler);
    }

    /* 4. Rechazar solicitud */
    @PutMapping("/{idAlquiler}/rechazar")
    public Alquiler rechazar(@PathVariable int idAlquiler) {
        return alquilerService.rechazarSolicitud(idAlquiler);
    }

    /* 5. Cancelar alquiler */
    @PutMapping("/{idAlquiler}/cancelar")
    public Alquiler cancelar(@PathVariable int idAlquiler) {
        return alquilerService.cancelarAlquiler(idAlquiler);
    }

    /* 7. Favorito */
    @PutMapping("/{idAlquiler}/favorito")
    public Alquiler favorito(@PathVariable int idAlquiler) {
        return alquilerService.toggleFavorito(idAlquiler);
    }
}

