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

import com.roomie.persistence.entities.Foto;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.services.PisoService;
import com.roomie.services.dto.piso.PisoCederDTO;

@RestController
@RequestMapping("/piso")
public class PisoController {

    @Autowired
    private PisoService pisoService;

    
    @GetMapping
    public ResponseEntity<List<Piso>> findAll() {
        return ResponseEntity.ok(pisoService.findAll());
    }

    /* =====================================================
       GET /pisos/{id}
       ===================================================== */
    @GetMapping("/{idPiso}")
    public ResponseEntity<Piso> findById(@PathVariable int idPiso) {
        return ResponseEntity.ok(pisoService.findById(idPiso));
    }
    
    
    /* =========================
    CREAR PISO
    ========================= */
	 @PostMapping("/crear/{idUsuario}")
	 public ResponseEntity<Piso> crearPiso(
	         @PathVariable int idUsuario,
	         @RequestBody Piso datos) {
	
	     return ResponseEntity.status(HttpStatus.CREATED)
	             .body(pisoService.crearPiso(idUsuario, datos));
	 }
	 
	 /* =========================
     MODIFICAR PISOS 
     ========================= */
	 
	 @PutMapping("/{idPiso}")
	 public ResponseEntity<Piso> modificarInformacionBasica(
	         @PathVariable int idPiso,
	         @RequestBody Piso datos) {

	     return ResponseEntity.ok(
	             pisoService.modificarInformacionBasica(idPiso, datos)
	     );
	 }


	 /* =========================
     FILTRAR PISOS
     ========================= */
	 @GetMapping("/filtrar")
	 public ResponseEntity<List<Piso>> filtrar(
	         @RequestParam(required = false) Double precioMin,
	         @RequestParam(required = false) Double precioMax,
	         @RequestParam(required = false) Boolean garaje,
	         @RequestParam(required = false) Boolean animales,
	         @RequestParam(required = false) Boolean wifi,
	         @RequestParam(required = false) Boolean tabaco) {

	     return ResponseEntity.ok(
	             pisoService.filtrar(
	                     precioMin,
	                     precioMax,
	                     garaje,
	                     animales,
	                     wifi,
	                     tabaco
	             )
	     );
	 }
	 
	 
	 /*=====================
	  * pisos de un owner
	  ======================
	 
	 @GetMapping("/owner/{idOwner}")
	 public ResponseEntity<List<Piso>> listarPisosPorOwner(
	         @PathVariable int idOwner) {

	     return ResponseEntity.ok(
	             pisoService.findPisosByOwner(idOwner)
	     );
	 }*/

	 
	 /*=====================
	  * Ceder piso
	  * ====================*/
	 @PutMapping("/{idPiso}/ceder")
	 public ResponseEntity<Piso> cederPiso(
	         @PathVariable int idPiso,
	         @RequestBody PisoCederDTO datos) {

	     return ResponseEntity.ok(
	             pisoService.cederPiso(idPiso, datos)
	     );
	 }
	 
	 
	 
	 /*=================
	  * listar usuario de un piso
	  ==================*/
	 
	 @GetMapping("/{idPiso}/usuarios")
	    public ResponseEntity<List<Usuario>> listarUsuariosQueVivenEnPiso(
	            @PathVariable int idPiso) {

	        return ResponseEntity.ok(
	                pisoService.listarUsuariosQueVivenEnPiso(idPiso)
	        );
	    }

	 
	 /*====================================
	  * LISTAR FOTOS DE UN PISO
	  */
	 
	 @GetMapping("/{idPiso}/fotos")
	 public ResponseEntity<List<Foto>> listarFotosDePiso(
	         @PathVariable int idPiso) {

	     return ResponseEntity.ok(
	             pisoService.listarFotosDePiso(idPiso)
	     );
	 }
	 
	 
	 
	 /*==================================
	  * ELIMINAR UN PISO
	  */
	 @DeleteMapping("/{idPiso}")
	 public ResponseEntity<Void> eliminarPiso(
	         @PathVariable int idPiso) {

	     pisoService.eliminarPiso(idPiso);
	     return ResponseEntity.noContent().build();
	 }

	 


}