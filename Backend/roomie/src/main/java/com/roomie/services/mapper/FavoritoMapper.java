package com.roomie.services.mapper;

import java.util.List;

import com.roomie.persistence.entities.Favorito;
import com.roomie.services.dto.favorito.FavoritoDTO;

/**
 * Mapper para convertir entre la entidad Favorito y FavoritoDTO.
 * Solo transformaciones de datos, sin lógica de negocio ni validaciones.
 *
 * No incluye el usuario en el DTO porque el endpoint ya lo conoce por parámetro.
 * Delega el mapeo del piso en PisoMapper (versión resumida).
 */
public class FavoritoMapper {
 
    private FavoritoMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. toDTO — Favorito → FavoritoDTO
    // -------------------------------------------------------------------------
    public static FavoritoDTO toDTO(Favorito favorito) {
        if (favorito == null) return null;
 
        FavoritoDTO dto = new FavoritoDTO();
        dto.setId(favorito.getId());
        dto.setFecha(favorito.getFecha());
 
        // Piso en versión resumida. Si piso es null, se deja null sin lanzar excepción.
        dto.setPiso(favorito.getPiso() != null
                ? PisoMapper.toPisoResumenDTO(favorito.getPiso())
                : null);
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // Método opcional para listas
    // -------------------------------------------------------------------------
    public static List<FavoritoDTO> toDTOList(List<Favorito> favoritos) {
        if (favoritos == null) return List.of();
        return favoritos.stream()
                .map(FavoritoMapper::toDTO)
                .toList();
    }
}

