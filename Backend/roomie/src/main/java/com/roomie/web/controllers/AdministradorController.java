package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.services.AdministradorService;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.administrador.PerfilAdministradorDTO;

@RestController
@RequestMapping("/administrador")
public class AdministradorController {
 
    @Autowired
    private AdministradorService administradorService;
 
    /* =========================
       FIND ALL
       ========================= */
    @GetMapping
    public ResponseEntity<List<PerfilAdministradorDTO>> findAll() {
        return ResponseEntity.ok(
                administradorService.findAllAdministradores()
        );
    }
 
    /* =========================
       FIND BY ID
       ========================= */
    @GetMapping("/{idAdministrador}")
    public ResponseEntity<PerfilAdministradorDTO> findById(
            @PathVariable int idAdministrador) {
 
        return ResponseEntity.ok(
                administradorService.findAdministradorById(idAdministrador)
        );
    }
 
    /* =========================
       REGISTRAR
       ========================= 
    @PostMapping("/registrar")
    public ResponseEntity<PerfilAdministradorDTO> registrarAdministrador(
            @RequestBody AdministradorRegistroDTO dto) {
 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(administradorService.registrarAdministrador(dto));
    }*/
 
    /* =========================
       INICIAR SESIÓN
       ========================= 
    @PostMapping("/iniciar-sesion")
    public ResponseEntity<PerfilAdministradorDTO> iniciarSesion(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {
 
        return ResponseEntity.ok(
                administradorService.iniciarSesion(nombreUsuario, password)
        );
    }*/
 
    /* =========================
       CERRAR SESIÓN
       ========================= */
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<String> cerrarSesion() {
        administradorService.cerrarSesion();
        return ResponseEntity.ok("Sesión cerrada correctamente.");
    }
 
    /* =========================
       SOLICITUDES PENDIENTES
       ========================= */
    @GetMapping("/solicitudes")
    public ResponseEntity<List<PerfilAdministradorDTO>> solicitudesPendientes() {
        return ResponseEntity.ok(
                administradorService.solicitudesPendientes()
        );
    }
 
    /* =========================
       ACEPTAR ADMIN
       ========================= */
    @PutMapping("/{idAdmin}/aceptar")
    public ResponseEntity<PerfilAdministradorDTO> aceptarAdministrador(
            @PathVariable int idAdmin) {
 
        return ResponseEntity.ok(
                administradorService.aceptarAdministrador(idAdmin)
        );
    }
}