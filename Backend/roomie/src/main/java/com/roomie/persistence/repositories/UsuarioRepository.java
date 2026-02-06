package com.roomie.persistence.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
	Usuario findByNombreUsuario(String nombreUsuario); 
    
    boolean existsByNombreUsuario(String nombreUsuario);
    
    boolean existsByDni(String dni);
    
    boolean existsByEmail(String email);
    
    boolean existsByAceptado(boolean aceptado); //solicitudes de asministrador
    
    List<Usuario> findByRoles(Roles rol); //para buscar todos los administradores

}