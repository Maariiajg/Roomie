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
	
	// find id
	public Usuario findById(int idUsuario) {
		if(!this.usuarioRepository.existsById(idUsuario)) {
			throw new UsuarioNotFoundException("El ID indicado no existe. ");
		}
		
		return this.usuarioRepository.findById(idUsuario).get();
	}
	
	//Buscar por nombreUsuario
    public Usuario findByNombreUsuario(String nombreUsuario) {
        Usuario usuario = this.usuarioRepository.findByNombreUsuario(nombreUsuario);

        if (usuario == null) {
            throw new UsuarioNotFoundException("No existe el usuario con nombreUsuario: " + nombreUsuario);
        }

        return usuario;
    }
    
    //registrar
    
    //iniciar sesion
    
    //Actualizar perfil (información)
    
    //ver mi perfil (mostrar mi información)
	
}
