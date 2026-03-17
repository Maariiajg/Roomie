package com.roomie.services.mapper;

import java.util.List;
import java.util.Map;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.services.dto.usuario.ActualizarPerfilDTO;
import com.roomie.services.dto.usuario.CambiarCredencialesDTO;
import com.roomie.services.dto.usuario.PerfilUsuarioDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;

/**
 * Mapper para convertir entre la entidad Usuario y sus DTOs.
 * Solo transformaciones de datos, sin lógica de negocio ni validaciones.
 * La calificacionMedia se inyecta desde fuera porque requiere una query al repositorio.
 */
public class UsuarioMapper {
 
    private UsuarioMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. toPerfilDTO — entidad Usuario → PerfilUsuarioDTO
    // -------------------------------------------------------------------------
    public static PerfilUsuarioDTO toPerfilDTO(Usuario usuario, Double calificacionMedia) {
        if (usuario == null) return null;
 
        PerfilUsuarioDTO dto = new PerfilUsuarioDTO();
        dto.setId(usuario.getId());
        dto.setDni(usuario.getDni());
        dto.setNombre(usuario.getNombre());
        dto.setApellido1(usuario.getApellido1());
        dto.setApellido2(usuario.getApellido2());
        dto.setAnioNacimiento(usuario.getAnioNacimiento());
        dto.setGenero(usuario.getGenero());
        dto.setTelefono(usuario.getTelefono());
        dto.setEmail(usuario.getEmail());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setFoto(usuario.getFoto());
        dto.setMensajePresentacion(usuario.getMensajePresentacion());
        dto.setRol(usuario.getRol());
        // Si calificacionMedia es null se devuelve 0.0
        dto.setCalificacionMedia(calificacionMedia != null ? calificacionMedia : 0.0);
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // 2. toPerfilDTOList — List<Usuario> → List<PerfilUsuarioDTO>
    //    El Map<Long, Double> contiene la calificacion media indexada por id de usuario.
    // -------------------------------------------------------------------------
    public static List<PerfilUsuarioDTO> toPerfilDTOList(
            List<Usuario> usuarios,
            Map<Long, Double> medias) {
 
        if (usuarios == null) return List.of();
 
        return usuarios.stream()
                .map(u -> toPerfilDTO(u, medias != null ? medias.get((long) u.getId()) : null))
                .toList();
    }
 
    // -------------------------------------------------------------------------
    // 3. fromRegistroDTO — UsuarioRegistroDTO → entidad Usuario
    //    NO copia: id, rol, bloqueado, aceptado ni relaciones.
    //    El sistema los inicializa: rol=USUARIO, bloqueado=false, aceptado=true.
    // -------------------------------------------------------------------------
    public static Usuario fromRegistroDTO(UsuarioRegistroDTO dto) {
        if (dto == null) return null;
 
        Usuario usuario = new Usuario();
        usuario.setDni(dto.getDni());
        usuario.setNombre(dto.getNombre());
        usuario.setApellido1(dto.getApellido1());
        usuario.setApellido2(dto.getApellido2());
        usuario.setAnioNacimiento(dto.getAnioNacimiento());
        usuario.setGenero(dto.getGenero());
        usuario.setTelefono(dto.getTelefono());
        usuario.setEmail(dto.getEmail());
        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setPassword(dto.getPassword());
        usuario.setFoto(dto.getFoto());
        usuario.setMensajePresentacion(dto.getMensajePresentacion());
        // repetirPassword no se persiste — solo validación en el service
 
        // Valores inicializados por el sistema
        usuario.setRol(Roles.USUARIO);
        usuario.setBloqueado(false);
        usuario.setAceptado(true);
 
        return usuario;
    }
 
    // -------------------------------------------------------------------------
    // 4. applyActualizarPerfil — ActualizarPerfilDTO → aplica cambios sobre Usuario existente
    //    NO modifica: id, nombreUsuario, password, rol, bloqueado, aceptado, relaciones.
    // -------------------------------------------------------------------------
    public static void applyActualizarPerfil(ActualizarPerfilDTO dto, Usuario usuario) {
        if (dto == null || usuario == null) return;
 
        usuario.setDni(dto.getDni());
        usuario.setNombre(dto.getNombre());
        usuario.setApellido1(dto.getApellido1());
        usuario.setApellido2(dto.getApellido2());
        usuario.setAnioNacimiento(dto.getAnioNacimiento());
        usuario.setGenero(dto.getGenero());
        usuario.setTelefono(dto.getTelefono());
        usuario.setEmail(dto.getEmail());
        usuario.setFoto(dto.getFoto());
        usuario.setMensajePresentacion(dto.getMensajePresentacion());
    }
 
    // -------------------------------------------------------------------------
    // 5. applyCambiarCredenciales — CambiarCredencialesDTO → aplica credenciales sobre Usuario
    //    El service es responsable de validar: passwordActual correcta,
    //    passwordNueva != passwordActual, passwordNueva == repetirPassword.
    //    Este mapper solo aplica los cambios ya validados.
    // -------------------------------------------------------------------------
    public static void applyCambiarCredenciales(CambiarCredencialesDTO dto, Usuario usuario) {
        if (dto == null || usuario == null) return;
 
        if (dto.getNombreUsuario() != null) {
            usuario.setNombreUsuario(dto.getNombreUsuario());
        }
 
        if (dto.getPasswordNueva() != null) {
            // Se persiste passwordNueva como la nueva contraseña
            usuario.setPassword(dto.getPasswordNueva());
        }
    }
}
