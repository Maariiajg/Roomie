package com.roomie.services.dto.alquiler;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;
import com.roomie.services.dto.piso.PisoResumenDTO;
import com.roomie.services.dto.usuario.PerfilUsuarioDTO;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA para alquileres.
 * Incluye PerfilUsuarioDTO del solicitante y PisoResumenDTO del piso.
 * Evita exponer las entidades completas anidadas.
 */
@Getter
@Setter
public class AlquilerDTO {

    private int id;
    private LocalDate fsolicitud;
    private LocalDate fInicio;
    private LocalDate fFin;
    private AlquilerEstadoSolicitud estadoSolicitud;

    private PerfilUsuarioDTO usuario;
    private PisoResumenDTO piso;
}
