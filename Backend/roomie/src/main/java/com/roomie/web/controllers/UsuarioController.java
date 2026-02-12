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
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

 // Endpoint para listar todos los usuarios y owners
    @GetMapping
    public ResponseEntity<List<Usuario>> findAll() {
        List<Usuario> usuarios = usuarioService.findAllUsuariosYOwners();
        return ResponseEntity.ok(usuarios);
    }
    
 // Endpoint para encontrar un usuario por ID
    @GetMapping("/{idUsuario}")
    public ResponseEntity<Usuario> findById(@PathVariable int idUsuario) {
        Usuario usuario = usuarioService.findById(idUsuario);
        return ResponseEntity.ok(usuario);
    }
    
 // Endpoint para registrar un nuevo usuario
    @PostMapping("/registrar")
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.registrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // Endpoint para iniciar sesión
    @PostMapping("/iniciar-sesion")
    public ResponseEntity<Usuario> iniciarSesion(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {

        Usuario usuario = usuarioService.iniciarSesion(nombreUsuario, password);
        return ResponseEntity.ok(usuario);
    }
    
    
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<String> cerrarSesion() {
        usuarioService.cerrarSesion();
        return ResponseEntity.ok("Sesión cerrada correctamente.");
    }

    
    @PutMapping("/{idUsuario}/actualizar-perfil")
    public ResponseEntity<Usuario> actualizarPerfil(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(usuarioService.actualizarPerfil(idUsuario, usuario));
    }

    
    @PutMapping("/{idUsuario}/bloquear")
    public ResponseEntity<Usuario> bloquear(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(
                usuarioService.cambiarEstadoBloqueo(idUsuario, usuario, true)
        );
    }

    @PutMapping("/{idUsuario}/desbloquear")
    public ResponseEntity<Usuario> desbloquear(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(
                usuarioService.cambiarEstadoBloqueo(idUsuario, usuario, false)
        );
    }

    
    
    @PutMapping("/{idUsuario}/credenciales")
    public ResponseEntity<Usuario> cambiarCredenciales(
            @PathVariable int idUsuario,
            @RequestBody Usuario usuario) {

        return ResponseEntity.ok(usuarioService.cambiarCredenciales(idUsuario, usuario));
    }



}