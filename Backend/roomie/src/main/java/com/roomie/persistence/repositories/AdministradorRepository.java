package com.roomie.persistence.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Administrador;

public interface AdministradorRepository extends JpaRepository<Administrador, Integer>{
	
	Administrador findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);

    // solicitudes pendientes
    boolean existsByAceptado(boolean aceptado);
}
