package com.roomie.services.dto.feedback;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.EstadoFeedback;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA para un feedback.
 * Expone datos mínimos de usuarioPone y usuarioRecibe (nombreUsuario y foto),
 * sin exponer la entidad Usuario completa.
 */
@Getter
@Setter
public class FeedbackDTO {

    private int id;
    private int calificacion;
    private String descripcion;
    private LocalDate fecha;
    private EstadoFeedback estadoFeedback;
    private boolean visible;

    // Datos del usuario que pone el feedback
    private int idUsuarioPone;
    private String nombreUsuarioPone;   // nombreUsuario, no nombre real
    private String fotoUsuarioPone;

    // Datos del usuario que recibe el feedback
    private int idUsuarioRecibe;
    private String nombreUsuarioRecibe; // nombreUsuario, no nombre real
}
