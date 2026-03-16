package com.roomie.services.dto.piso;

import java.time.LocalDate;

import com.roomie.services.dto.usuario.PerfilUsuarioDTO;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA completo del piso para usuarios que NO viven en él.
 *
 * precioMesPersona = precioMes / (numOcupantesActual + 1)
 *   → precio que pagaría el usuario si entrase ahora.
 *
 * plazasLibres = numTotalHabitaciones - numOcupantesActual
 */
@Getter
@Setter
public class PisoDTO {

    private int id;
    private String direccion;
    private String descripcion;
    private int tamanio;
    private double precioMes;
    private int numTotalHabitaciones;
    private int numOcupantesActual;
    private LocalDate fPublicacion;

    private boolean garaje;
    private boolean animales;
    private boolean wifi;
    private boolean tabaco;

    // Campos calculados
    private double precioMesPersona;   // precioMes / (numOcupantesActual + 1)
    private int plazasLibres;          // numTotalHabitaciones - numOcupantesActual

    // Owner como DTO, no como entidad completa
    private PerfilUsuarioDTO owner;
}

