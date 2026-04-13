package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.services.PisoService;
import com.roomie.services.dto.foto.FotoDTO;
import com.roomie.services.dto.piso.PisoActualizarDTO;
import com.roomie.services.dto.piso.PisoCederDTO;
import com.roomie.services.dto.piso.PisoCrearDTO;
import com.roomie.services.dto.piso.PisoDTO;
import com.roomie.services.dto.piso.PisoResidenteDTO;
import com.roomie.services.dto.usuario.PerfilUsuarioDTO;

@RestController
@RequestMapping("/piso")
public class PisoController {
 
    @Autowired
    private PisoService pisoService;
 
    /* =========================
       FIND ALL
       ========================= */
    @GetMapping
    public ResponseEntity<List<PisoDTO>> findAll() {
        return ResponseEntity.ok(pisoService.findAllDTO());
    }
 
    /* =========================
       FIND LIBRES
       ========================= */
    @GetMapping("/libres")
    public ResponseEntity<List<PisoDTO>> findLibres() {
        return ResponseEntity.ok(pisoService.filtrar(null, null, null, null, null, null));
    }
 
    /* =========================
       FIND BY ID (vista de visitante)
       ========================= */
    @GetMapping("/{idPiso}")
    public ResponseEntity<PisoDTO> findById(@PathVariable int idPiso) {
        return ResponseEntity.ok(pisoService.findByIdDTO(idPiso));
    }
 
    /* =========================
       FIND BY ID (vista de residente)
       ========================= */
    @GetMapping("/{idPiso}/residente")
    public ResponseEntity<PisoResidenteDTO> findByIdResidente(@PathVariable int idPiso) {
        return ResponseEntity.ok(pisoService.findByIdResidenteDTO(idPiso));
    }
 
    /* =========================
       CREAR PISO
       ========================= */
    @PostMapping("/crear/{idUsuario}")
    public ResponseEntity<PisoDTO> crearPiso(
            @PathVariable int idUsuario,
            @RequestBody PisoCrearDTO dto) {
 
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pisoService.crearPiso(idUsuario, dto));
    }
 
    /* =========================
       MODIFICAR INFORMACIÓN BÁSICA
       ========================= */
    @PutMapping("/{idPiso}")
    public ResponseEntity<PisoDTO> modificarInformacionBasica(
            @PathVariable int idPiso,
            @RequestBody PisoActualizarDTO dto) {
 
        return ResponseEntity.ok(
                pisoService.modificarInformacionBasica(idPiso, dto)
        );
    }
 
    /* =========================
       FILTRAR PISOS
       ========================= */
    @GetMapping("/filtrar")
    public ResponseEntity<List<PisoDTO>> filtrar(
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) Boolean garaje,
            @RequestParam(required = false) Boolean animales,
            @RequestParam(required = false) Boolean wifi,
            @RequestParam(required = false) Boolean tabaco) {
 
        return ResponseEntity.ok(
                pisoService.filtrar(precioMin, precioMax, garaje, animales, wifi, tabaco)
        );
    }
 
    /* =========================
       CEDER PISO
       ========================= */
    @PutMapping("/{idPiso}/ceder")
    public ResponseEntity<PisoDTO> cederPiso(
            @PathVariable int idPiso,
            @RequestBody PisoCederDTO datos) {
 
        return ResponseEntity.ok(
                pisoService.cederPiso(idPiso, datos)
        );
    }
 
    /* =========================
       LISTAR USUARIOS DE UN PISO
       ========================= */
    @GetMapping("/{idPiso}/usuarios")
    public ResponseEntity<List<PerfilUsuarioDTO>> listarUsuariosQueVivenEnPiso(
            @PathVariable int idPiso) {
 
        return ResponseEntity.ok(
                pisoService.listarUsuariosQueVivenEnPiso(idPiso)
        );
    }
 
    /* =========================
       LISTAR FOTOS DE UN PISO
       ========================= */
    @GetMapping("/{idPiso}/fotos")
    public ResponseEntity<List<FotoDTO>> listarFotosDePiso(
            @PathVariable int idPiso) {
 
        return ResponseEntity.ok(
                pisoService.listarFotosDePiso(idPiso)
        );
    }
 
    /* =========================
       ELIMINAR PISO
       ========================= */
    @DeleteMapping("/{idPiso}")
    public ResponseEntity<Void> eliminarPiso(@PathVariable int idPiso) {
        pisoService.eliminarPiso(idPiso);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/mio/{idOwner}")
    public ResponseEntity<PisoResidenteDTO> getMiPiso(@PathVariable int idOwner) {
        return ResponseEntity.ok(pisoService.findMiPisoDTO(idOwner));
    }
}