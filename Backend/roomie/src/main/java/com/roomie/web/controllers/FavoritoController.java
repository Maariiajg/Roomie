package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Favorito;
import com.roomie.services.FavoritoService;

@RestController
@RequestMapping("/favorito")
public class FavoritoController {

    @Autowired
    private FavoritoService favoritoService;

    /* =========================
       GET ALL (favoritos de un usuario)
       ========================= */
    @GetMapping
    public ResponseEntity<List<Favorito>> list(
            @RequestParam int idUsuario) {

        return ResponseEntity.ok(
                this.favoritoService.findAll(idUsuario));
    }

    /* =========================
       GET BY ID
       ========================= */
    @GetMapping("/{idFavorito}")
    public ResponseEntity<?> findById(
            @PathVariable int idFavorito) {

        return ResponseEntity.ok(
                this.favoritoService.findById(idFavorito));
    }

    /* =========================
       CREATE (AÑADIR A FAVORITOS)
       ========================= */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam int idUsuario,
            @RequestParam int idPiso) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(this.favoritoService
                        .anadirAFavoritos(idUsuario, idPiso));
    }

    /* =========================
       DELETE (ELIMINAR DE FAVORITOS)
       ========================= */
    @DeleteMapping
    public ResponseEntity<?> delete(
            @RequestParam int idUsuario,
            @RequestParam int idPiso) {

        this.favoritoService
                .eliminarDeFavoritos(idUsuario, idPiso);

        return ResponseEntity.noContent().build();
    }
}

