package com.roomie.services.mapper;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.administrador.PerfilAdministradorDTO;

/**
 * Mapper para convertir entre la entidad Usuario (rol ADMINISTRADOR) y sus DTOs.
 * Solo transformaciones de datos, sin lógica de negocio ni validaciones.
 *
 * NO incluye mappers para login ni cambio de credenciales:
 *   - Login usa InicioSesionDTO (módulo de seguridad).
 *   - Cambio de credenciales usa CambiarCredencialesDTO vía UsuarioMapper.
 */
public class AdministradorMapper {
 
    private AdministradorMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. fromRegistroDTO — AdministradorRegistroDTO → entidad Usuario
    //    NO copia: id, rol, bloqueado, aceptado ni relaciones.
    //    El mapper inicializa los valores controlados por el sistema.
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
        // repetirPassword no se persiste — solo validación en el service
 
        // Valores controlados por el sistema
        admin.setRol(Roles.ADMINISTRADOR);
        admin.setBloqueado(false);
        admin.setAceptado(false); // debe ser aceptado por otro administrador
 
        return admin;
    }
 
    // -------------------------------------------------------------------------
    // 2. toPerfilDTO — entidad Usuario (rol ADMIN) → PerfilAdministradorDTO
    //    NO expone: password, bloqueado ni listas de relaciones.
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
        dto.setAceptado(admin.isAceptado()); // útil para el panel de gestión
 
        return dto;
    }
}
 







