package com.roomie.services.dto.usuario;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de ENTRADA para cambiar nombre de usuario y/o contraseña.
 * Compartido por usuarios y administradores.
 *
 * Reglas de validación (aplicadas en el service):
 *   - passwordActual debe coincidir con la contraseña almacenada.
 *   - passwordNueva no puede ser igual a passwordActual.
 *   - repetirPassword debe coincidir con passwordNueva.
 */
@Getter
@Setter
public class CambiarCredencialesDTO {

    private String nombreUsuario;      // opcional: solo si quiere cambiarlo
    private String passwordActual;     // obligatoria si quiere cambiar contraseña
    private String passwordNueva;      // nueva contraseña
    private String repetirPassword;    // confirmación de la nueva contraseña
}
