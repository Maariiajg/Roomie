package com.roomie.services.mapper;

import java.util.List;

import com.roomie.persistence.entities.Feedback;
import com.roomie.services.dto.feedback.FeedbackDTO;

/**
 * Mapper para convertir entre la entidad Feedback y FeedbackDTO.
 * Solo transformaciones de datos, sin lógica de negocio ni validaciones.
 *
 * No usa UsuarioMapper intencionadamente: PerfilUsuarioDTO tiene demasiados datos.
 * Aquí se extrae solo la información mínima de cada usuario (id, nombreUsuario, foto).
 * No se exponen datos personales (nombre real, apellidos, email, etc.).
 */
public class FeedbackMapper {
 
    private FeedbackMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. toDTO — Feedback → FeedbackDTO
    // -------------------------------------------------------------------------
    public static FeedbackDTO toDTO(Feedback feedback) {
        if (feedback == null) return null;
 
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setCalificacion(feedback.getCalificacion());
        dto.setDescripcion(feedback.getDescripcion());
        dto.setFecha(feedback.getFecha());
        dto.setEstadoFeedback(feedback.getEstadoFeedback());
        dto.setVisible(feedback.isVisible());
 
        // Datos mínimos del usuario que pone el feedback
        if (feedback.getUsuarioPone() != null) {
            dto.setIdUsuarioPone(feedback.getUsuarioPone().getId());
            dto.setNombreUsuarioPone(feedback.getUsuarioPone().getNombreUsuario());
            dto.setFotoUsuarioPone(feedback.getUsuarioPone().getFoto());
        }
 
        // Datos mínimos del usuario que recibe el feedback
        if (feedback.getUsuarioRecibe() != null) {
            dto.setIdUsuarioRecibe(feedback.getUsuarioRecibe().getId());
            dto.setNombreUsuarioRecibe(feedback.getUsuarioRecibe().getNombreUsuario());
        }
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // Método opcional para listas
    // -------------------------------------------------------------------------
    public static List<FeedbackDTO> toDTOList(List<Feedback> feedbacks) {
        if (feedbacks == null) return List.of();
        return feedbacks.stream()
                .map(FeedbackMapper::toDTO)
                .toList();
    }
}

