package com.roomie.persistence.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Alquiler;

public interface AlquilerRepository extends JpaRepository<Alquiler, Integer> {

    // Solicitudes de un piso por estado
    List<Alquiler> findByPisoIdAndEstadoSolicitud(int idPiso, String estadoSolicitud);

    // Alquileres de un usuario
    List<Alquiler> findByUsuarioId(int idUsuario);
}