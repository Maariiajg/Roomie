package com.roomie.persistence.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
	Optional<Usuario> findByNombreUsuario(String nombreUsuario); 
    
    boolean existsByNombreUsuario(String nombreUsuario);
    
    boolean existsByDni(String dni);
    
    boolean existsByEmail(String email);
    
    boolean existsByAceptado(boolean aceptado); //solicitudes de asministrador
    
    List<Usuario> findByRol(Roles rol); //para buscar todos los administradores
    
    Optional<Usuario> findByIdAndRol(int id, Roles rol);
    
    //calcular media de calificaciones del feedback
    @Query("SELECT AVG(f.calificacion) FROM Feedback f WHERE f.usuarioRecibe.id = :idUsuario")
    Double getCalificacionMedia(int idUsuario);

}