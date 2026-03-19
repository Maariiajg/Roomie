package com.roomie.services.dto.piso;

import lombok.Getter;
import lombok.Setter;

//PisoActualizarDTO.java — idéntico a PisoCrearDTO por ahora, pero desacoplado
@Getter
@Setter
public class PisoActualizarDTO {
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
