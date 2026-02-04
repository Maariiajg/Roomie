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

import com.roomie.persistence.entities.Piso;
import com.roomie.services.PisoService;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.usuario.UsuarioException;

@RestController
@RequestMapping("/pisos")
public class PisoController {

    @Autowired
    private PisoService pisoService;

    /* =========================
       CREAR PISO
       ========================= */
    @PostMapping
    public ResponseEntity<?> crear(
            @RequestParam int idUsuario,
            @RequestBody Piso piso) {

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(pisoService.crear(piso, idUsuario));
        } catch (UsuarioException | PisoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        }
    }

    /* =========================
       LISTAR TODOS
       ========================= */
    @GetMapping
    public ResponseEntity<List<Piso>> listar() {
        return ResponseEntity.ok(pisoService.listarTodos());
    }

    /* =========================
       PISOS DE LOS QUE SOY DUEÑO
       ========================= */
    @GetMapping("/dueno/{idUsuario}")
    public ResponseEntity<List<Piso>> pisosDueno(
            @PathVariable int idUsuario) {

        return ResponseEntity.ok(
                pisoService.pisosDeDueno(idUsuario));
    }

    /* =========================
       FILTRAR
       ========================= */
    @GetMapping("/filtrar")
    public ResponseEntity<?> filtrar(
            @RequestParam double precioMin,
            @RequestParam double precioMax,
            @RequestParam boolean garaje,
            @RequestParam boolean animales,
            @RequestParam boolean wifi,
            @RequestParam boolean tabaco) {

        try {
            return ResponseEntity.ok(
                    pisoService.filtrar(
                            precioMin, precioMax,
                            garaje, animales, wifi, tabaco));
        } catch (PisoException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        }
    }

    /* =========================
       CAMBIAR DUEÑO
       ========================= */
    @PutMapping("/{idPiso}/dueno")
    public ResponseEntity<?> cambiarDueno(
            @PathVariable int idPiso,
            @RequestParam int idNuevoDueno) {

        try {
            return ResponseEntity.ok(
                    pisoService.cambiarDueno(idPiso, idNuevoDueno));
        } catch (PisoException | UsuarioException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ex.getMessage());
        }
    }
}