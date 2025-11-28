package com.roomie.persistence.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Usuario findByNombreUsuario(String nombreUsuario); 
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);
    boolean existsByNombreUsuario(String nombreUsuario);

}