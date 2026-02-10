package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<Usuario> iniciarSesion(@RequestParam String nombreUsuario, @RequestParam String password) {
        Usuario usuario = usuarioService.iniciarSesion(nombreUsuario, password);
        return ResponseEntity.ok(usuario);
    }
}