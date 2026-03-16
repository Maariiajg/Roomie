package com.roomie.services.dto.piso;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de ENTRADA para crear un piso.
 * No incluye fPublicacion, numOcupantesActual ni owner: el service los asigna.
 */
@Getter
@Setter
public class PisoCrearDTO {

    private String direccion;
    private String descripcion;
    private int tamanio;
    private double precioMes;
    private int numTotalHabitaciones;

    private boolean garaje;
    private boolean animales;
    private boolean wifi;
    private boolean tabaco;
}

