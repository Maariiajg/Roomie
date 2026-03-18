package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.administrador.PerfilAdministradorDTO;
import com.roomie.services.exceptions.administrador.AdministradorException;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;
import com.roomie.services.mapper.AdministradorMapper;

@Service
public class AdministradorService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // =========================================================================
    // FIND ALL
    // =========================================================================
    public List<PerfilAdministradorDTO> findAllAdministradores() {
        return usuarioRepository.findByRol(Roles.ADMINISTRADOR)
                .stream()
                .map(AdministradorMapper::toPerfilDTO)
                .toList();
    }

    // =========================================================================
    // FIND BY ID
    // =========================================================================
    public PerfilAdministradorDTO findAdministradorById(int idAdministrador) {
        Usuario admin = usuarioRepository.findByIdAndRol(idAdministrador, Roles.ADMINISTRADOR)
                .orElseThrow(() -> new UsuarioNotFoundException(
                        "El administrador con ID " + idAdministrador + " no existe"));
        return AdministradorMapper.toPerfilDTO(admin);
    }

    // =========================================================================
    // REGISTRAR ADMINISTRADOR
    // =========================================================================
    public PerfilAdministradorDTO registrarAdministrador(AdministradorRegistroDTO dto) {
        /*// CAMPOS PROHIBIDOS
        if (admin.getId() != 0 ||
            admin.getRol() != null ||
            admin.isBloqueado() ||
            admin.isAceptado()) {

            throw new UsuarioException(
                    "No se pueden introducir los campos id, rol, bloqueado o aceptado."
            );
        } */
        // Validar repetirPassword
        if (dto.getPassword() == null || dto.getRepetirPassword() == null ||
                !dto.getPassword().equals(dto.getRepetirPassword())) {
            throw new AdministradorException("Las contraseñas no coinciden.");
        }

        // Campos obligatorios
        if (dto.getDni() == null ||
            dto.getNombre() == null ||
            dto.getApellido1() == null ||
            dto.getApellido2() == null ||
            dto.getAnioNacimiento() == null ||
            dto.getGenero() == null ||
            dto.getTelefono() == null ||
            dto.getEmail() == null ||
            dto.getNombreUsuario() == null ||
            dto.getPassword() == null) {
            throw new AdministradorException(
                    "Todos los campos son obligatorios excepto foto.");
        }

        // Unicidad
        if (usuarioRepository.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new AdministradorException(
                    "El nombre de usuario ya existe, debes elegir otro.");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new UsuarioException("El email ya está en uso.");
        }
        if (usuarioRepository.existsByDni(dto.getDni())) {
            throw new UsuarioException("El DNI ya existe en la base de datos.");
        }

        // El mapper asigna rol=ADMINISTRADOR, bloqueado=false, aceptado=false
        Usuario admin = AdministradorMapper.fromRegistroDTO(dto);
        Usuario guardado = usuarioRepository.save(admin);

        return AdministradorMapper.toPerfilDTO(guardado);
    }

    // =========================================================================
    // LOGIN ADMINISTRADOR
    // =========================================================================
    public PerfilAdministradorDTO iniciarSesion(String nombreUsuario, String password) {

        Usuario admin = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsuarioException(
                        "Nombre de usuario o contraseña incorrectos."));

        if (!admin.getPassword().equals(password)) {
            throw new UsuarioException("Nombre de usuario o contraseña incorrectos.");
        }
        if (admin.isBloqueado()) {
            throw new UsuarioException(
                    "Tu cuenta está bloqueada. Contacta con un administrador.");
        }
        if (!admin.isAceptado()) {
            throw new UsuarioException("Tu cuenta aún no ha sido aceptada.");
        }

        return AdministradorMapper.toPerfilDTO(admin);
    }

    // =========================================================================
    // CERRAR SESIÓN
    // =========================================================================
    public void cerrarSesion() {
        // Vacío hasta implementar JWT
    }

    // =========================================================================
    // SOLICITUDES PENDIENTES — solo admins no aceptados (bug corregido)
    // =========================================================================
    public List<PerfilAdministradorDTO> solicitudesPendientes() {
        return usuarioRepository.findByRol(Roles.ADMINISTRADOR)
                .stream()
                .filter(a -> !a.isAceptado())
                .map(AdministradorMapper::toPerfilDTO)
                .toList();
    }

    // =========================================================================
    // ACEPTAR ADMINISTRADOR
    // =========================================================================
    public PerfilAdministradorDTO aceptarAdministrador(int idAdmin) {
        /*if (datos.getId() != idAdmin) {
            throw new UsuarioException(
                String.format(
                    "El id del body (%d) y el id del path (%d) no coinciden",
                    datos.getId(), idAdmin
                )
            );
        } */
        Usuario admin = usuarioRepository.findByIdAndRol(idAdmin, Roles.ADMINISTRADOR)
                .orElseThrow(() -> new UsuarioNotFoundException(
                        "El administrador con ID " + idAdmin + " no existe."));

        if (admin.isAceptado()) {
            throw new AdministradorException("El administrador ya está aceptado.");
        }

        admin.setAceptado(true);
        Usuario guardado = usuarioRepository.save(admin);

        return AdministradorMapper.toPerfilDTO(guardado);
    }
    
    //No hace falta método rechazar xq aceptado es un booleano q por defecto está a false
}
