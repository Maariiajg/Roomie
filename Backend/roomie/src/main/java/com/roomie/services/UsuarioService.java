package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	//find All
	public List<Usuario> findAll(){
		return this.usuarioRepository.findAll();
	}
	
	// find por nombre
	public Usuario findById(int idUsuario) {
		if(!this.usuarioRepository.existsById(idUsuario)) {
			throw new UsuarioNotFoundException("El ID indicado no existe. ");
		}
		
		return this.usuarioRepository.findById(idUsuario).get();
	}
	
	
}
