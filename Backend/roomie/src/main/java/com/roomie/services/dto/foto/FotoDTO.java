package com.roomie.services.dto.foto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO de SALIDA para una foto.
 * Solo expone id y url. No expone el piso anidado.
 */
@Getter
@Setter
public class FotoDTO {

    private int id;
    private String url;
}