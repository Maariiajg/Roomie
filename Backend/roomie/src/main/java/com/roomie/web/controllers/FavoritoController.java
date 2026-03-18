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

import com.roomie.services.FavoritoService;
import com.roomie.services.dto.favorito.FavoritoDTO;

@RestController
@RequestMapping("/favorito")
public class FavoritoController {
 
    @Autowired
    private FavoritoService favoritoService;
 
    /* =========================
       FIND ALL (favoritos de un usuario)
       ========================= */
    @GetMapping
    public ResponseEntity<List<FavoritoDTO>> list(
            @RequestParam int idUsuario) {
 
        return ResponseEntity.ok(
                favoritoService.findAll(idUsuario));
    }
 
    /* =========================
       FIND BY ID
       ========================= */
    @GetMapping("/{idFavorito}")
    public ResponseEntity<FavoritoDTO> findById(
            @PathVariable int idFavorito) {
 
        return ResponseEntity.ok(
                favoritoService.findById(idFavorito));
    }
 
    /* =========================
       AÑADIR A FAVORITOS
       ========================= */
    @PostMapping
    public ResponseEntity<FavoritoDTO> create(
            @RequestParam int idUsuario,
            @RequestParam int idPiso) {
 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(favoritoService.anadirAFavoritos(idUsuario, idPiso));
    }
 
    /* =========================
       ELIMINAR DE FAVORITOS
       ========================= */
    @DeleteMapping
    public ResponseEntity<Void> delete(
            @RequestParam int idUsuario,
            @RequestParam int idPiso) {
 
        favoritoService.eliminarDeFavoritos(idUsuario, idPiso);
        return ResponseEntity.noContent().build();
    }
}