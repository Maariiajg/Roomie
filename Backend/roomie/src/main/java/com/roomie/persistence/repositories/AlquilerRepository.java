package com.roomie.persistence.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;

@Repository
public interface AlquilerRepository extends JpaRepository<Alquiler, Integer> {

    List<Alquiler> findByPisoIdAndEstadoSolicitud(int idPiso, AlquilerEstadoSolicitud estado);

    List<Alquiler> findByUsuarioId(int idUsuario);

    boolean existsByUsuarioIdAndEstadoSolicitud(
            int idUsuario, AlquilerEstadoSolicitud estado);

    List<Alquiler> findByUsuarioIdAndEstadoSolicitud(
            int idUsuario, AlquilerEstadoSolicitud estado);
    
    boolean existsByUsuarioIdAndPisoId(int idUsuario, int idPiso);

    Optional<Alquiler> findByUsuarioIdAndPisoId(int idUsuario, int idPiso);
    
    Optional<Alquiler> findByPisoIdAndUsuarioIdAndEstadoSolicitud(
            int idPiso,
            int idUsuario,
            AlquilerEstadoSolicitud estadoSolicitud
    );
    
    List<Alquiler> findByPisoId(int idPiso);

}