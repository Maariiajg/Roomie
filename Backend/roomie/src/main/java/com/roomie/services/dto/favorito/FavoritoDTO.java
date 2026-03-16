package com.roomie.services.dto.favorito;

import java.time.LocalDateTime;

import com.roomie.services.dto.piso.PisoResumenDTO;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA para un favorito.
 * No expone el usuario (ya viene como parámetro en el endpoint).
 * Incluye PisoResumenDTO del piso marcado como favorito.
 */
@Getter
@Setter
public class FavoritoDTO {

    private int id;
    private LocalDateTime fecha;
    private PisoResumenDTO piso;
}
