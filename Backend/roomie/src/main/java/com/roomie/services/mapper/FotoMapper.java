package com.roomie.services.mapper;

import java.util.List;

import com.roomie.persistence.entities.Foto;
import com.roomie.services.dto.foto.FotoDTO;

/**
 * Mapper para convertir entre la entidad Foto y FotoDTO.
 * El más simple del sistema: solo expone id y url.
 * Sin dependencias de otros mappers ni relaciones.
 */
public class FotoMapper {
 
    private FotoMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. toDTO — Foto → FotoDTO
    // -------------------------------------------------------------------------
    public static FotoDTO toDTO(Foto foto) {
        if (foto == null) return null;
 
        FotoDTO dto = new FotoDTO();
        dto.setId(foto.getId());
        dto.setUrl(foto.getUrl());
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // Método opcional para listas (habitual en GET /pisos/{id}/fotos)
    // -------------------------------------------------------------------------
    public static List<FotoDTO> toDTOList(List<Foto> fotos) {
        if (fotos == null) return List.of();
        return fotos.stream()
                .map(FotoMapper::toDTO)
                .toList();
    }
}
