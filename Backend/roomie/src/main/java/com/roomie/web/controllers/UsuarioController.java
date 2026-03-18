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

import com.roomie.services.UsuarioService;
import com.roomie.services.dto.usuario.ActualizarPerfilDTO;
import com.roomie.services.dto.usuario.CambiarCredencialesDTO;
import com.roomie.services.dto.usuario.PerfilUsuarioDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {
 
    @Autowired
    private UsuarioService usuarioService;
 
    /* =========================
       FIND ALL
       ========================= */
    @GetMapping
    public ResponseEntity<List<PerfilUsuarioDTO>> findAll() {
        return ResponseEntity.ok(
                usuarioService.findAllUsuariosYOwners()
        );
    }
 
    /* =========================
       FIND BY ID
       ========================= */
    @GetMapping("/{idUsuario}")
    public ResponseEntity<PerfilUsuarioDTO> findById(@PathVariable int idUsuario) {
        return ResponseEntity.ok(
                usuarioService.findByIdDTO(idUsuario)
        );
    }
 
    /* =========================
       REGISTRAR
       ========================= */
    @PostMapping("/registrar")
    public ResponseEntity<PerfilUsuarioDTO> registrar(
            @RequestBody UsuarioRegistroDTO dto) {
 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuarioService.registrar(dto));
    }
 
    /* =========================
       INICIAR SESIÓN
       ========================= */
    @PostMapping("/iniciar-sesion")
    public ResponseEntity<PerfilUsuarioDTO> iniciarSesion(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {
 
        return ResponseEntity.ok(
                usuarioService.iniciarSesion(nombreUsuario, password)
        );
    }
 
    /* =========================
       CERRAR SESIÓN
       ========================= */
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<String> cerrarSesion() {
        usuarioService.cerrarSesion();
        return ResponseEntity.ok("Sesión cerrada correctamente.");
    }
 
    /* =========================
       ACTUALIZAR PERFIL
       ========================= */
    @PutMapping("/{idUsuario}/actualizar-perfil")
    public ResponseEntity<PerfilUsuarioDTO> actualizarPerfil(
            @PathVariable int idUsuario,
            @RequestBody ActualizarPerfilDTO dto) {
 
        return ResponseEntity.ok(
                usuarioService.actualizarPerfil(idUsuario, dto)
        );
    }
 
    /* =========================
       BLOQUEAR
       ========================= */
    @PutMapping("/{idUsuario}/bloquear")
    public ResponseEntity<PerfilUsuarioDTO> bloquear(
            @PathVariable int idUsuario) {
 
        return ResponseEntity.ok(
                usuarioService.cambiarEstadoBloqueo(idUsuario, true)
        );
    }
 
    /* =========================
       DESBLOQUEAR
       ========================= */
    @PutMapping("/{idUsuario}/desbloquear")
    public ResponseEntity<PerfilUsuarioDTO> desbloquear(
            @PathVariable int idUsuario) {
 
        return ResponseEntity.ok(
                usuarioService.cambiarEstadoBloqueo(idUsuario, false)
        );
    }
 
    /* =========================
       CAMBIAR CREDENCIALES
       ========================= */
    @PutMapping("/{idUsuario}/credenciales")
    public ResponseEntity<PerfilUsuarioDTO> cambiarCredenciales(
            @PathVariable int idUsuario,
            @RequestBody CambiarCredencialesDTO dto) {
 
        return ResponseEntity.ok(
                usuarioService.cambiarCredenciales(idUsuario, dto)
        );
    }
}