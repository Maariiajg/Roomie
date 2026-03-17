package com.roomie.services.mapper;

import java.util.List;
import java.util.Map;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.services.dto.alquiler.AlquilerDTO;

/**
 * Mapper para convertir entre la entidad Alquiler y AlquilerDTO.
 * Solo transformaciones de datos, sin lógica de negocio ni validaciones.
 *
 * La calificacionMedia del usuario solicitante se recibe como parámetro
 * porque proviene de una consulta agregada en el repositorio de feedback.
 *
 * Depende de UsuarioMapper y PisoMapper para los objetos relacionados.
 */
public class AlquilerMapper {
 
    private AlquilerMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. toDTO — Alquiler → AlquilerDTO
    //    Delega el mapeo del usuario en UsuarioMapper y el del piso en PisoMapper.
    //    Nunca expone entidades completas.
    // -------------------------------------------------------------------------
    public static AlquilerDTO toDTO(Alquiler alquiler, Double calificacionMediaUsuario) {
        if (alquiler == null) return null;
 
        AlquilerDTO dto = new AlquilerDTO();
        dto.setId(alquiler.getId());
        dto.setFsolicitud(alquiler.getFsolicitud());
        dto.setFInicio(alquiler.getFInicio());
        dto.setFFin(alquiler.getFFin());
        dto.setEstadoSolicitud(alquiler.getEstadoSolicitud());
 
        // Usuario solicitante como PerfilUsuarioDTO
        dto.setUsuario(UsuarioMapper.toPerfilDTO(
                alquiler.getUsuario(), calificacionMediaUsuario));
 
        // Piso en versión resumida
        dto.setPiso(PisoMapper.toPisoResumenDTO(alquiler.getPiso()));
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // Método opcional para listas
    // -------------------------------------------------------------------------
    public static List<AlquilerDTO> toDTOList(
            List<Alquiler> alquileres,
            Map<Long, Double> mediasUsuarios) {
 
        if (alquileres == null) return List.of();
 
        return alquileres.stream()
                .map(a -> toDTO(a, mediasUsuarios != null
                        ? mediasUsuarios.get((long) a.getUsuario().getId())
                        : null))
                .toList();
    }
}
