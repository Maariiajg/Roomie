package com.roomie.services.dto.usuario;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.Genero;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de ENTRADA para actualizar el perfil general de un usuario.
 * No incluye nombreUsuario, password, rol, bloqueado ni aceptado.
 */
@Getter
@Setter
public class ActualizarPerfilDTO {

    private String dni;
    private String nombre;
    private String apellido1;
    private String apellido2;
    private LocalDate anioNacimiento;
    private Genero genero;
    private String telefono;
    private String email;
    private String foto;
    private String mensajePresentacion;
}
