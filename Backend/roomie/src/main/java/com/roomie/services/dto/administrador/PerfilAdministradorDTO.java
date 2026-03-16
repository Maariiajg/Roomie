package com.roomie.services.dto.administrador;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.Genero;
import com.roomie.persistence.entities.enums.Roles;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA para mostrar el perfil de un administrador.
 * No expone password. Sí expone aceptado (útil para el panel de gestión).
 * No incluye calificacionMedia (los admins no tienen feedback).
 */
@Getter
@Setter
public class PerfilAdministradorDTO {

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
    private Roles rol;
    private boolean aceptado;
}
