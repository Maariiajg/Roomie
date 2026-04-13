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

import com.roomie.services.FotoService;
import com.roomie.services.dto.foto.FotoDTO;

@RestController
@RequestMapping("/foto")
public class FotoController {
 
    @Autowired
    private FotoService fotoService;
 
    /* =========================
       FIND BY ID
       ========================= */
    @GetMapping("/{idFoto}")
    public ResponseEntity<FotoDTO> findById(@PathVariable int idFoto) {
        return ResponseEntity.ok(fotoService.findById(idFoto));
    }
 
    /* =========================
       CREATE (añadir al piso)
       ========================= */
    @PostMapping
    public ResponseEntity<FotoDTO> create(
            @RequestParam String url,
            @RequestParam int idPiso, 
            @RequestParam int idOwner) {
 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(fotoService.create(url, idPiso, idOwner));
    }
 
    /* =========================
       DELETE
       ========================= */
    @DeleteMapping("/{idFoto}")
    public ResponseEntity<Void> delete(
    		@PathVariable int idFoto, 
    		@RequestParam int idPiso, 
            @RequestParam int idOwner) {
        fotoService.delete(idFoto, idPiso, idOwner);
        return ResponseEntity.noContent().build();
    }
 
    /* =========================
       FOTOS DE UN PISO
       ========================= */
    @GetMapping("/{idPiso}/fotos")
    public ResponseEntity<List<FotoDTO>> findFotosByPiso(@PathVariable int idPiso) {
        return ResponseEntity.ok(fotoService.findFotosByPiso(idPiso));
    }
}