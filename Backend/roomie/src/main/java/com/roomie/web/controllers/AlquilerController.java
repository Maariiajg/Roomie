package com.roomie.web.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.services.AlquilerService;
import com.roomie.services.PisoService;
import com.roomie.services.exceptions.alquiler.AlquilerException;

@RestController
@RequestMapping("/alquiler")
public class AlquilerController {

    @Autowired
    private AlquilerService alquilerService;
    
    
    
    

	

    // =========================================================================
    // GET /alquiler
    // Devuelve todos los alquileres existentes (uso admin / debug)
    // =========================================================================
    @GetMapping
    public ResponseEntity<List<Alquiler>> findAll() {
        return ResponseEntity.ok(this.alquilerService.findAll());
    }


    // =========================================================================
    // GET /alquiler/{idAlquiler}
    // Busca un alquiler concreto por su ID
    // =========================================================================
    @GetMapping("/{idAlquiler}")
    public ResponseEntity<Alquiler> findById(@PathVariable int idAlquiler) {
        return ResponseEntity.ok(this.alquilerService.findById(idAlquiler));
    }


    // =========================================================================
    // GET /alquiler/usuario/{idUsuario}/historial
    // Devuelve todos los alquileres de un usuario (cualquier estado),
    // permitiendo ver su historial completo de solicitudes y pisos.
    // =========================================================================
    @GetMapping("/usuario/{idUsuario}/historial")
    public ResponseEntity<List<Alquiler>> historialDeUsuario(
            @PathVariable int idUsuario) {

        return ResponseEntity.ok(
                alquilerService.historialDeUsuario(idUsuario));
    }


    // =========================================================================
    // GET /alquiler/usuario/{idUsuario}/actual
    // Devuelve el alquiler activo (estado ACEPTADA) del usuario,
    // es decir, el piso en el que vive actualmente.
    // Devuelve 404 si el usuario no vive en ningún piso.
    // =========================================================================
    @GetMapping("/usuario/{idUsuario}/actual")
    public ResponseEntity<Alquiler> alquilerActual(
            @PathVariable int idUsuario) {

        return ResponseEntity.ok(
                alquilerService.alquilerActual(idUsuario));
    }


    // =========================================================================
    // GET /alquiler/piso/{idPiso}/solicitudes
    // Devuelve las solicitudes PENDIENTES de un piso concreto.
    // Cualquier usuario puede verlas, pero solo el owner puede resolverlas.
    // =========================================================================
    @GetMapping("/piso/{idPiso}/solicitudes")
    public ResponseEntity<List<Alquiler>> solicitudesPendientes(
            @PathVariable int idPiso) {

        return ResponseEntity.ok(
                alquilerService.solicitudesPendientes(idPiso));
    }


    // =========================================================================
    // POST /alquiler/solicitar
    // El usuario envía una solicitud para entrar en un piso.
    // Parámetros requeridos: idUsuario, idPiso, fInicio (fecha de inicio deseada)
    // =========================================================================
    @PostMapping("/solicitar")
    public ResponseEntity<Alquiler> enviarSolicitud(
            @RequestParam int idUsuario,
            @RequestParam int idPiso,
            @RequestParam LocalDate fInicio) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(alquilerService.enviarSolicitud(idUsuario, idPiso, fInicio));
    }


    // =========================================================================
    // PUT /alquiler/{idAlquiler}/cancelar
    // El propio usuario cancela una solicitud suya que esté en estado PENDIENTE.
    // Parámetro requerido: idUsuario (para verificar que es el dueño de la solicitud)
    // =========================================================================
    @PutMapping("/{idAlquiler}/cancelar")
    public ResponseEntity<Alquiler> cancelarSolicitud(
            @PathVariable int idAlquiler,
            @RequestParam int idUsuario) {

        return ResponseEntity.ok(
                alquilerService.cancelarSolicitud(idAlquiler, idUsuario));
    }


    // =========================================================================
    // PUT /alquiler/{idAlquiler}/resolver
    // El owner acepta o rechaza una solicitud PENDIENTE de su piso.
    // Parámetros requeridos:
    //   - idDueno: ID del owner que realiza la acción
    //   - aceptar: true para aceptar, false para rechazar
    // =========================================================================
    @PutMapping("/{idAlquiler}/resolver")
    public ResponseEntity<Alquiler> resolverSolicitud(
            @PathVariable int idAlquiler,
            @RequestParam int idDueno,
            @RequestParam boolean aceptar) {

        return ResponseEntity.ok(
                alquilerService.resolverSolicitud(idAlquiler, idDueno, aceptar));
    }


    // =========================================================================
    // PUT /alquiler/pisos/{idPiso}/salir
    // Un usuario sale de un piso, ya sea de forma voluntaria o expulsado por el owner.
    // Parámetros requeridos: idUsuario
    // Parámetros opcionales:
    //   - fechaSalida: si no se indica, se usa la fecha actual
    //   - forzadoPorOwner: true si el owner está echando al usuario (por defecto false)
    //   - idOwner: obligatorio si forzadoPorOwner es true
    // =========================================================================
    @PutMapping("/pisos/{idPiso}/salir")
    public ResponseEntity<Void> salirDelPiso(
            @PathVariable int idPiso,
            @RequestParam int idUsuario,
            @RequestParam(required = false) LocalDate fechaSalida,
            @RequestParam(defaultValue = "false") boolean forzadoPorOwner,
            @RequestParam(required = false, defaultValue = "0") int idOwner) {

        alquilerService.salirDelPiso(
                idPiso, idUsuario, fechaSalida, forzadoPorOwner, idOwner);

        return ResponseEntity.noContent().build();
    }

}
