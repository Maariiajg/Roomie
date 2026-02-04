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

import com.roomie.persistence.entities.Usuario;
import com.roomie.services.UsuarioService;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /* =========================
       GET ALL (ADMIN)
       ========================= */
    @GetMapping
    public List<Usuario> findAll() {
        return usuarioService.findAll();
    }

    /* =========================
       GET BY ID (ADMIN)
       ========================= */
    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> findById(@PathVariable int idUsuario) {
        try {
            return ResponseEntity.ok(usuarioService.findById(idUsuario));
        } catch (UsuarioNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    /* =========================
       VER MI PERFIL
       ========================= */
    @GetMapping("/perfil/{nombreUsuario}")
    public ResponseEntity<?> miPerfil(@PathVariable String nombreUsuario) {
        try {
            return ResponseEntity.ok(usuarioService.findByNombreUsuario(nombreUsuario));
        } catch (UsuarioException | UsuarioNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    /* =========================
       REGISTRO
       ========================= */
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(usuarioService.registrar(usuario));
        } catch (UsuarioException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    /* =========================
       LOGIN
       ========================= */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {

        try {
            return ResponseEntity.ok(
                    usuarioService.iniciarSesion(nombreUsuario, password));
        } catch (UsuarioException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    /* =========================
       ACTUALIZAR PERFIL
       ========================= */
    @PutMapping("/{idUsuario}")
    public ResponseEntity<?> update(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        try {
            return ResponseEntity.ok(
                    usuarioService.update(usuario, idUsuario));
        } catch (UsuarioException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    /* =========================
       BLOQUEAR / DESBLOQUEAR (ADMIN)
       ========================= */
    @PutMapping("/{idUsuario}/bloqueo")
    public ResponseEntity<?> toggleBloqueo(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        try {
            return ResponseEntity.ok(
                    usuarioService.toggleBloqueo(usuario, idUsuario));
        } catch (UsuarioException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
    }

    /* =========================
       CAMBIAR CREDENCIALES
       ========================= */
    @PutMapping("/{idUsuario}/credenciales")
    public ResponseEntity<?> cambiarCredenciales(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        try {
            return ResponseEntity.ok(
                    usuarioService.cambiarCredenciales(usuario, idUsuario));
        } catch (UsuarioException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}