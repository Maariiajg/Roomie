package com.roomie.services.mapper;

import com.roomie.persistence.entities.Usuario;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.administrador.PerfilAdministradorDTO;

/**
 * Mapper para convertir entre la entidad Usuario (rol ADMINISTRADOR) y sus DTOs.
 */
public class AdministradorMapper {

    private AdministradorMapper() {}

    // -------------------------------------------------------------------------
    // DTO de SALIDA: entidad → PerfilAdministradorDTO
    // -------------------------------------------------------------------------
    public static PerfilAdministradorDTO toPerfilDTO(Usuario admin) {
        if (admin == null) return null;

        PerfilAdministradorDTO dto = new PerfilAdministradorDTO();
        dto.setId(admin.getId());
        dto.setDni(admin.getDni());
        dto.setNombre(admin.getNombre());
        dto.setApellido1(admin.getApellido1());
        dto.setApellido2(admin.getApellido2());
        dto.setAnioNacimiento(admin.getAnioNacimiento());
        dto.setGenero(admin.getGenero());
        dto.setTelefono(admin.getTelefono());
        dto.setEmail(admin.getEmail());
        dto.setNombreUsuario(admin.getNombreUsuario());
        dto.setFoto(admin.getFoto());
        dto.setRol(admin.getRol());
        dto.setAceptado(admin.isAceptado());

        return dto;
    }

    // -------------------------------------------------------------------------
    // DTO de ENTRADA: AdministradorRegistroDTO → entidad Usuario
    // -------------------------------------------------------------------------
    public static Usuario fromRegistroDTO(AdministradorRegistroDTO dto) {
        if (dto == null) return null;

        Usuario admin = new Usuario();
        admin.setDni(dto.getDni());
        admin.setNombre(dto.getNombre());
        admin.setApellido1(dto.getApellido1());
        admin.setApellido2(dto.getApellido2());
        admin.setAnioNacimiento(dto.getAnioNacimiento());
        admin.setGenero(dto.getGenero());
        admin.setTelefono(dto.getTelefono());
        admin.setEmail(dto.getEmail());
        admin.setNombreUsuario(dto.getNombreUsuario());
        admin.setPassword(dto.getPassword());
        admin.setFoto(dto.getFoto());

        return admin;
    }
}

