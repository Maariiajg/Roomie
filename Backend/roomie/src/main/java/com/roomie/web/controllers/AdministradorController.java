package com.roomie.web.controllers;

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

import com.roomie.persistence.entities.Usuario;
import com.roomie.services.AdministradorService;
import com.roomie.services.exceptions.administrador.AdministradorException;
import com.roomie.services.exceptions.administrador.AdministradorNotFoundException;

@RestController
@RequestMapping("/administrador")
public class AdministradorController {

    @Autowired
    private AdministradorService administradorService;

    
    
    @GetMapping
    public ResponseEntity<List<Usuario>> findAll() {
        return ResponseEntity.ok(
                administradorService.findAllAdministradores()
        );
    }

    /* =====================================================
       FIND ADMINISTRADOR BY ID
       ===================================================== */
    @GetMapping("/{idAdministrador}")
    public ResponseEntity<Usuario> findById(
            @PathVariable int idAdministrador) {

        return ResponseEntity.ok(
                administradorService.findAdministradorById(idAdministrador)
        );
    }
    
    
    @PostMapping("/registrar")
    public ResponseEntity<Usuario> registrarAdministrador(
            @RequestBody Usuario administrador) {

        Usuario nuevoAdmin =
                administradorService.registrarAdministrador(administrador);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevoAdmin);
    }
    
    
    /*

     =========================
       LOGIN ADMIN
       ========================= */
    
 // Endpoint para iniciar sesión
    @PostMapping("/iniciar-sesion")
    public ResponseEntity<Usuario> iniciarSesion(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {

        Usuario usuario = administradorService.iniciarSesion(nombreUsuario, password);
        return ResponseEntity.ok(usuario);
    }
    
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<String> cerrarSesion() {
        administradorService.cerrarSesion();
        return ResponseEntity.ok("Sesión cerrada correctamente.");
    }

    /* =========================
       VER SOLICITUDES PENDIENTES
       ========================= */
    @GetMapping("/solicitudes")
    public List<Usuario> solicitudesPendientes() {
        return administradorService.solicitudesPendientes();
    }

    /* =========================
       ACEPTAR ADMIN
       ========================= */
    @PutMapping("/{idAdmin}/aceptar")
    public ResponseEntity<Usuario> aceptarAdministrador(
            @PathVariable int idAdmin,
            @RequestBody Usuario datos) {

        return ResponseEntity.ok(
            administradorService.aceptarAdministrador(idAdmin, datos)
        );
    }

    /* =========================
       RECHAZAR ADMIN
       ========================= */
    @DeleteMapping("/{idAdmin}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable int idAdmin) {
        try {
            administradorService.rechazarAdmin(idAdmin);
            return ResponseEntity.ok().build();
        } catch (AdministradorNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    
   
}
