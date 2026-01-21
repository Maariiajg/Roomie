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
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Piso;
import com.roomie.services.PisoService;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;

@RestController
@RequestMapping("/piso")
public class PisoController {

	@Autowired
	   private PisoService pisoService;
	
   @GetMapping
   public ResponseEntity<List<Piso>> findAll() {
       return ResponseEntity.ok(this.pisoService.findAll());
   }
   @GetMapping("/{idPiso}")
   public ResponseEntity<?> findById(@PathVariable int idPiso) {
       try {
           return ResponseEntity.ok(this.pisoService.findById(idPiso));
       } catch (PisoNotFoundException ex) {
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
       }
   }
   @PostMapping("/usuario/{idUsuario}")
   public ResponseEntity<?> create(@PathVariable int idUsuario, @RequestBody Piso piso) {
       try {
           return ResponseEntity.status(HttpStatus.CREATED)
                   .body(this.pisoService.create(piso, idUsuario));
       } catch (PisoException ex) {
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
       }
   }
   @PutMapping("/{idPiso}")
   public ResponseEntity<?> update(
           @PathVariable int idPiso,
           @RequestBody Piso piso) {
       try {
           return ResponseEntity.ok(this.pisoService.update(piso, idPiso));
       } catch (PisoNotFoundException ex) {
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
       } catch (PisoException ex) {
           return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
       }
   }
   @DeleteMapping("/{idPiso}")
   public ResponseEntity<?> delete(@PathVariable int idPiso) {
       try {
           this.pisoService.delete(idPiso);
           return ResponseEntity.ok().build();
       } catch (PisoNotFoundException ex) {
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
       }
   }
   @GetMapping("/usuario/{idUsuario}")
   public ResponseEntity<List<Piso>> findByUsuario(@PathVariable int idUsuario) {
       return ResponseEntity.ok(this.pisoService.findByUsuarioDueno(idUsuario));
   }

}
