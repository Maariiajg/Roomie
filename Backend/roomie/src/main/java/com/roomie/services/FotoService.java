package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Foto;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.repositories.FotoRepository;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.services.exceptions.alquiler.AlquilerNotFoundException;
import com.roomie.services.exceptions.foto.FotoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;

@Service
public class FotoService {
	@Autowired
	private FotoRepository fotoRepository;
	
	@Autowired
	private PisoRepository pisoRepository;
	
	

 	// findById
 	public Foto findById(int idFoto) {
 		if (!this.fotoRepository.existsById(idFoto)) {
 			throw new AlquilerNotFoundException("La foto con id " + idFoto + " no existe. ");
 		} 

 		return this.fotoRepository.findById(idFoto).get();
 	}
 	
 	public Foto create(String url, int idPiso) {
        // 1. Buscamos el piso al que pertenece la foto
        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new FotoException("Piso no encontrado con ID: " + idPiso));

        // 2. Creamos la instancia de Foto
        Foto nuevaFoto = new Foto();
        nuevaFoto.setUrl(url);
        nuevaFoto.setPiso(piso); // Establecemos la relación ManyToOne

        return fotoRepository.save(nuevaFoto); 
    }
 	
 	
 	
 	public void delete(int id) {
        if (!fotoRepository.existsById(id)) {
            throw new RuntimeException("No se puede borrar: Foto no encontrada con ID: " + id);
        }
        fotoRepository.deleteById(id);
    }
 	
 	
 	
 	
 	
 	public List<Foto> findFotosByPiso(int idPiso) {

        // Verificamos que el piso existe
        if (!pisoRepository.existsById(idPiso)) {
            throw new PisoNotFoundException("El piso no existe");
        }

        return fotoRepository.findByPisoId(idPiso);
    }
}
