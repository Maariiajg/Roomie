package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.services.exceptions.piso.PisoNotFoundException;

@Service
public class PisoService {
	@Autowired
	private PisoRepository pisoRepository;
	
	//find All
	public List<Usuario> findAll(){
		return this.pisoRepository.findAll();
	} 
	
	// find por nombre
	public Usuario findById(int idPiso) {
		if(!this.pisoRepository.existsById(idPiso)) {
			throw new PisoNotFoundException("El ID indicado no existe. ");
		}
		
		return this.pisoRepository.findById(idPiso).get();
	}
}
