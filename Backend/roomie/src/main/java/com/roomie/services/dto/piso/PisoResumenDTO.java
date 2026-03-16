package com.roomie.services.dto.piso;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO ligero del piso.
 * Usado en contextos anidados: AlquilerDTO, FavoritoDTO.
 */
@Getter
@Setter
public class PisoResumenDTO {

    private int id;
    private String direccion;
    private double precioMes;
    private int numTotalHabitaciones;
    private int numOcupantesActual;
}
