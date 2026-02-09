package com.roomie.persistence.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Favorito;

public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {

    // Todos los favoritos de un usuario
    List<Favorito> findByUsuarioId(int usuarioId);

    // Favorito concreto usuario–piso (clave lógica)
    Optional<Favorito> findByUsuarioIdAndPisoId(int usuarioId, int pisoId);

    // Para evitar duplicados
    boolean existsByUsuarioIdAndPisoId(int usuarioId, int pisoId);

    // Eliminar favorito por usuario y piso
    void deleteByUsuarioIdAndPisoId(int usuarioId, int pisoId);
}
