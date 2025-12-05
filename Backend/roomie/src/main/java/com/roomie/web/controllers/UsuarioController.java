package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Usuario;
import com.roomie.services.UsuarioService;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {
	@Autowired
	private UsuarioService usuarioService;
	
	// GET ALL
    @GetMapping
    public ResponseEntity<List<Usuario>> list() {
        return ResponseEntity.ok(this.usuarioService.findAll());
    }

    // GET BY ID
    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> findById(@PathVariable int idUsuario) {
        try {
            return ResponseEntity.ok(this.usuarioService.findById(idUsuario));
        } catch (UsuarioNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    // GET BY nombreUsuario
    @GetMapping("/nombreUsuario/{nombreUsuario}")
    public ResponseEntity<?> findByNombreUsuario(@PathVariable String nombreUsuario) {
        try {
            return ResponseEntity.ok(this.usuarioService.findByNombreUsuario(nombreUsuario));
        } catch (UsuarioNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}
