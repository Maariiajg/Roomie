package com.roomie.services.dto.piso;

import java.time.LocalDate;

import com.roomie.services.dto.usuario.PerfilUsuarioDTO;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA del piso para usuarios que YA VIVEN en él.
 *
 * precioMesPersona = precioMes / numOcupantesActual
 *   → precio que está pagando cada residente actual.
 *
 * plazasLibres = numTotalHabitaciones - numOcupantesActual
 */
@Getter
@Setter
public class PisoResidenteDTO {

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
    private double precioMesPersona;   // precioMes / numOcupantesActual
    private int plazasLibres;          // numTotalHabitaciones - numOcupantesActual

    // Owner como DTO
    private PerfilUsuarioDTO owner;
}

