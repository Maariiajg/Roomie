package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Foto;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.repositories.FotoRepository;
import com.roomie.services.exceptions.foto.FotoException;
import com.roomie.services.exceptions.foto.FotoNotFoundException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;

@Service
public class FotoService {
	@Autowired
	private FotoRepository fotoRepository;
	
	@Autowired
	private PisoService pisoService;
	
	

 	// findById
 	public Foto findById(int idFoto) {
 		if (!this.fotoRepository.existsById(idFoto)) {
 			throw new FotoNotFoundException("La foto con id " + idFoto + " no existe. ");
 		} 

 		return this.fotoRepository.findById(idFoto).get();
 	}
 	
 	
 	
 	//CREATE
 	public Foto create(String url, int idPiso) {

        // PisoService lanza PisoNotFoundException si el piso no existe
        Piso piso = pisoService.findById(idPiso);

        Foto nuevaFoto = new Foto();
        nuevaFoto.setUrl(url);
        nuevaFoto.setPiso(piso);

        return fotoRepository.save(nuevaFoto);
    }
 	
 	
 	
 // =========================================================================
    // DELETE — eliminar una foto por ID
    // =========================================================================
    public void delete(int idFoto) {

        // Reutilizamos findById para que lance la excepción correcta si no existe
        findById(idFoto);

        fotoRepository.deleteById(idFoto);
    }
 	
 	
 	
 // =========================================================================
    // FIND FOTOS BY PISO — todas las fotos de un piso concreto
    // =========================================================================
    public List<Foto> findFotosByPiso(int idPiso) {

        // PisoService lanza PisoNotFoundException si el piso no existe
        pisoService.findById(idPiso);

        return fotoRepository.findByPisoId(idPiso);
    }
}
