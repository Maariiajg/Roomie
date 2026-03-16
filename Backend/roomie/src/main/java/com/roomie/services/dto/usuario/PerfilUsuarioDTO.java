package com.roomie.services.dto.usuario;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.Genero;
import com.roomie.persistence.entities.enums.Roles;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA para mostrar el perfil de un usuario o owner.
 * No expone password, bloqueado ni aceptado.
 * Incluye calificacionMedia calculada desde FeedbackRepository.
 */
@Getter
@Setter
public class PerfilUsuarioDTO {

    private int id;
    private String dni;
    private String nombre;
    private String apellido1;
    private String apellido2;
    private LocalDate anioNacimiento;
    private Genero genero;
    private String telefono;
    private String email;
    private String nombreUsuario;
    private String foto;
    private String mensajePresentacion;
    private Roles rol;
    private Double calificacionMedia;  // media de feedbacks VALORADO y visibles
}
