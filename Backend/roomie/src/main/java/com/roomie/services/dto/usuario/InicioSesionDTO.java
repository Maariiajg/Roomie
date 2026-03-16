package com.roomie.services.dto.usuario;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de ENTRADA para el inicio de sesión de un usuario.
 */
@Getter
@Setter
public class InicioSesionDTO {

    private String nombreUsuario;
    private String password;
}
