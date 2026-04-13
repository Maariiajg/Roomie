package com.roomie.web.controllers;

import java.time.LocalDate;
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

import com.roomie.services.AlquilerService;
import com.roomie.services.dto.alquiler.AlquilerDTO;
import com.roomie.services.dto.alquiler.CompaneroDTO;

@RestController
@RequestMapping("/alquiler")
public class AlquilerController {
 
    @Autowired
    private AlquilerService alquilerService;
 
    /* =========================
       FIND ALL
       ========================= */
    @GetMapping
    public ResponseEntity<List<AlquilerDTO>> findAll() {
        return ResponseEntity.ok(alquilerService.findAll());
    }
 
    /* =========================
       FIND BY ID
       ========================= */
    @GetMapping("/{idAlquiler}")
    public ResponseEntity<AlquilerDTO> findById(@PathVariable int idAlquiler) {
        return ResponseEntity.ok(alquilerService.findById(idAlquiler));
    }
 
    /* =========================
       HISTORIAL DE UN USUARIO
       ========================= */
    @GetMapping("/usuario/{idUsuario}/historial")
    public ResponseEntity<List<AlquilerDTO>> historialDeUsuario(
            @PathVariable int idUsuario) {
 
        return ResponseEntity.ok(alquilerService.historialDeUsuario(idUsuario));
    }
 
    /* =========================
       ALQUILER ACTUAL
       ========================= */
    @GetMapping("/usuario/{idUsuario}/actual")
    public ResponseEntity<AlquilerDTO> alquilerActual(@PathVariable int idUsuario) {
        return ResponseEntity.ok(alquilerService.alquilerActual(idUsuario));
    }
 
    /* =========================
       SOLICITUDES PENDIENTES DE UN PISO
       ========================= */
    @GetMapping("/piso/{idPiso}/solicitudes")
    public ResponseEntity<List<AlquilerDTO>> solicitudesPendientes(
            @PathVariable int idPiso) {
 
        return ResponseEntity.ok(alquilerService.solicitudesPendientes(idPiso));
    }
 
    /* =========================
       ENVIAR SOLICITUD
       ========================= */
    @PostMapping("/solicitar")
    public ResponseEntity<AlquilerDTO> enviarSolicitud(
            @RequestParam int idUsuario,
            @RequestParam int idPiso,
            @RequestParam LocalDate fInicio) {
 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(alquilerService.enviarSolicitud(idUsuario, idPiso, fInicio));
    }
 
    /* =========================
       CANCELAR SOLICITUD
       ========================= */
    @PutMapping("/{idAlquiler}/cancelar")
    public ResponseEntity<AlquilerDTO> cancelarSolicitud(
            @PathVariable int idAlquiler,
            @RequestParam int idUsuario) {
 
        return ResponseEntity.ok(
                alquilerService.cancelarSolicitud(idAlquiler, idUsuario));
    }
 
    /* =========================
       RESOLVER SOLICITUD (owner)
       ========================= */
    @PutMapping("/{idAlquiler}/resolver")
    public ResponseEntity<AlquilerDTO> resolverSolicitud(
            @PathVariable int idAlquiler,
            @RequestParam int idDueno,
            @RequestParam boolean aceptar) {
 
        return ResponseEntity.ok(
                alquilerService.resolverSolicitud(idAlquiler, idDueno, aceptar));
    }
 
    /* =========================
       SALIR DEL PISO
       ========================= */
    @PutMapping("/piso/{idPiso}/salir")
    public ResponseEntity<Void> salirDelPiso(
            @PathVariable int idPiso,
            @RequestParam int idUsuario,
            @RequestParam(required = false) LocalDate fechaSalida,
            @RequestParam(defaultValue = "false") boolean forzadoPorOwner,
            @RequestParam(defaultValue = "0") int idOwner) {
 
        alquilerService.salirDelPiso(
                idPiso, idUsuario, fechaSalida, forzadoPorOwner, idOwner);
 
        return ResponseEntity.noContent().build();
    }
 
    /* =========================
       COMPAÑEROS ACTUALES
       ========================= */
    @GetMapping("/usuario/{idUsuario}/companeros")
    public ResponseEntity<List<CompaneroDTO>> companerosActuales(
            @PathVariable int idUsuario) {
 
        return ResponseEntity.ok(
                alquilerService.companerosActuales(idUsuario));
    }
    
    //numero solicitudes
    @GetMapping("/piso/{idPiso}/solicitudes/count")
    public ResponseEntity<Integer> countSolicitudesPendientes(@PathVariable int idPiso) {
        return ResponseEntity.ok(alquilerService.countSolicitudesPendientes(idPiso));
    }
}