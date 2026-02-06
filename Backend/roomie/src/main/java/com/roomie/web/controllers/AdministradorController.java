package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Usuario;
import com.roomie.services.AdministradorService;
import com.roomie.services.exceptions.administrador.AdministradorException;
import com.roomie.services.exceptions.administrador.AdministradorNotFoundException;

@RestController
@RequestMapping("/administradores")
public class AdministradorController {

    @Autowired
    private AdministradorService administradorService;

    /* =========================
       REGISTRO ADMIN
       ========================= 
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Administrador admin) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(administradorService.registrar(admin));
        } catch (AdministradorException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

     =========================
       LOGIN ADMIN
       ========================= 
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {

        try {
            return ResponseEntity.ok(
                    administradorService.iniciarSesion(nombreUsuario, password));
        } catch (AdministradorException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }*/

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
    public ResponseEntity<?> aceptar(@PathVariable int idAdmin) {
        try {
            return ResponseEntity.ok(administradorService.aceptarAdmin(idAdmin));
        } catch (AdministradorNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (AdministradorException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
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

    /* =========================
       GET BY ID
       ========================= */
    @GetMapping("/{idAdmin}")
    public ResponseEntity<?> findById(@PathVariable int idAdmin) {
        try {
            return ResponseEntity.ok(administradorService.findById(idAdmin));
        } catch (AdministradorNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    /* =========================
       GET ALL
       ========================= */
    @GetMapping
    public List<Usuario> findAll() {
        return administradorService.findAll();
    }
}
