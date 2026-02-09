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

import com.roomie.persistence.entities.Foto;
import com.roomie.services.FotoService;

@RestController
@RequestMapping("/foto")
public class FotoController {

    @Autowired
    private FotoService fotoService;

    /* =========================
       GET ALL
       ========================= */
    @GetMapping
    public ResponseEntity<List<Foto>> list() {
        return ResponseEntity.ok(this.fotoService.findAll());
    }

    /* =========================
       GET BY ID
       ========================= */
    @GetMapping("/{idFoto}")
    public ResponseEntity<?> findById(@PathVariable int idFoto) {
        return ResponseEntity.ok(this.fotoService.findById(idFoto));
    }

    /* =========================
       CREATE (AÑADIR A PISO)
       ========================= */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam String url, 
            @RequestParam int idPiso) {
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.fotoService.create(url, idPiso));
    }

    /* =========================
       DELETE
       ========================= */
    @DeleteMapping("/{idFoto}")
    public ResponseEntity<?> delete(@PathVariable int idFoto) {
        this.fotoService.delete(idFoto);
        return ResponseEntity.noContent().build(); 
    }
}