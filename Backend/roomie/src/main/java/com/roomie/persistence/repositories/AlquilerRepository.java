package com.roomie.persistence.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    
    @Query(value = """
            SELECT DISTINCT a2.id_usuario
            FROM alquiler a1
            JOIN alquiler a2 ON a1.id_piso = a2.id_piso
            WHERE a1.id_usuario = :idUsuario
              AND a2.id_usuario <> :idUsuario
              AND a1.estado_solicitud = 'ACEPTADA'
              AND a2.estado_solicitud = 'ACEPTADA'
              AND a1.f_inicio <= a2.f_fin
              AND a1.f_fin >= a2.f_inicio
            """, nativeQuery = true)
        List<Integer> findCompanerosConvivencia(int idUsuario);

}