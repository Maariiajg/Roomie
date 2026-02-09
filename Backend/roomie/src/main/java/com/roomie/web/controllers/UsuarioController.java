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

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /* =========================
       GET ALL (ADMIN)
       ========================= */
    @GetMapping
    public ResponseEntity<List<Usuario>> list() {
		return ResponseEntity.ok(this.usuarioService.findAll());
	}

    /* =========================
       GET BY ID (ADMIN)
       ========================= */
    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> findById(@PathVariable int idUsuario) {
        return ResponseEntity.ok(usuarioService.findById(idUsuario));
    } 

    /* =========================
       VER MI PERFIL
       ========================= */
    @GetMapping("/perfil/{nombreUsuario}")
    public ResponseEntity<?> miPerfil(@PathVariable String nombreUsuario) {    
        return ResponseEntity.ok(usuarioService.findByNombreUsuario(nombreUsuario));
    }

    /* =========================
       REGISTRO
       ========================= */
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                    .body(usuarioService.registrar(usuario));
        
    }

    /* =========================
       LOGIN
       ========================= */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String nombreUsuario, @RequestParam String password) {
        return ResponseEntity.ok(
            usuarioService.iniciarSesion(nombreUsuario, password));
    }

    /* =========================
       ACTUALIZAR PERFIL
       ========================= */
    @PutMapping("/{idUsuario}")
    public ResponseEntity<?> update(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(
                usuarioService.update(usuario, idUsuario));
    
    }

    /* =========================
       BLOQUEAR / DESBLOQUEAR (ADMIN)
       ========================= */
    @PutMapping("/{idUsuario}/bloqueo")
    public ResponseEntity<?> toggleBloqueo(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(
                usuarioService.toggleBloqueo(usuario, idUsuario));
    
    }

    /* =========================
       CAMBIAR CREDENCIALES
       ========================= */
    @PutMapping("/{idUsuario}/credenciales")
    public ResponseEntity<?> cambiarCredenciales(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(
                usuarioService.cambiarCredenciales(usuario, idUsuario));
        
    }
}