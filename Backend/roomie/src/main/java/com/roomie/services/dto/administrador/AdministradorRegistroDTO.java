package com.roomie.services.dto.administrador;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.Genero;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de ENTRADA para el registro de un administrador.
 * Incluye repetirPassword para validar que las contraseñas coinciden.
 */
@Getter
@Setter
public class AdministradorRegistroDTO {

    private String dni;
    private String nombre;
    private String apellido1;
    private String apellido2;
    private LocalDate anioNacimiento;
    private Genero genero;
    private String telefono;
    private String email;
    private String nombreUsuario;
    private String password;
    private String repetirPassword;   // solo validación, no se persiste
    private String foto;
}

