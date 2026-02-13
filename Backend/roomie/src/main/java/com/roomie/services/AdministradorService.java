package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.administrador.AdministradorException;
import com.roomie.services.exceptions.administrador.AdministradorNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@Service
public class AdministradorService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Usuario> findAllAdministradores() {

        return usuarioRepository.findByRol(Roles.ADMINISTRADOR);
    }
    
 // Método para encontrar un usuario por ID
    public Usuario findAdministradorById(int idAdministrador) {

        return usuarioRepository.findByIdAndRol(idAdministrador, Roles.ADMINISTRADOR)
                .orElseThrow(() ->
                    new UsuarioNotFoundException(
                        "El administrador con ID " + idAdministrador + " no existe"
                    )
                );
    }


    public Usuario registrarAdministrador(Usuario admin) {

        // CAMPOS PROHIBIDOS
        if (admin.getId() != 0 ||
            admin.getRol() != null ||
            admin.isBloqueado() ||
            admin.isAceptado()) {

            throw new UsuarioException(
                    "No se pueden introducir los campos id, rol, bloqueado o aceptado."
            );
        }

        // CAMPOS OBLIGATORIOS
        if (admin.getDni() == null ||
            admin.getNombre() == null ||
            admin.getApellido1() == null ||
            admin.getApellido2() == null ||
            admin.getAnioNacimiento() == null ||
            admin.getGenero() == null ||
            admin.getTelefono() == null ||
            admin.getEmail() == null ||
            admin.getNombreUsuario() == null ||
            admin.getPassword() == null) {

            throw new AdministradorException(
                    "Todos los campos son obligatorios excepto foto y mensaje de presentación."
            );
        }

        // Validar username único
        if (usuarioRepository.existsByNombreUsuario(admin.getNombreUsuario())) {
            throw new AdministradorException(
                    "El nombre de usuario ya existe, debes elegir otro."
            );
        }
        
        if (usuarioRepository.existsByEmail(admin.getEmail())) {
            throw new UsuarioException("El email ya está en uso.");
        }
        
        if (usuarioRepository.existsByDni(admin.getDni())) {
            throw new UsuarioException("El DNI ya existe en la base de datos.");
        }

        // FORZAR VALORES DE ADMINISTRADOR
        admin.setRol(Roles.ADMINISTRADOR);
        admin.setBloqueado(false);
        admin.setAceptado(false);

        return usuarioRepository.save(admin);
    }


    /*=====================================================
       2. LOGIN ADMINISTRADOR
       ===================================================== */
    public Usuario iniciarSesion(String nombreUsuario, String password) {

        Usuario admin = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsuarioException(
                    "Nombre de usuario o contraseña incorrectos."
                ));

        if (!admin.getPassword().equals(password)) {
            throw new UsuarioException(
                "Nombre de usuario o contraseña incorrectos."
            );
        }

        if (admin.isBloqueado()) {
            throw new UsuarioException(
                "Tu cuenta está bloqueada. Contacta con un administrador."
            );
        }

        if (!admin.isAceptado()) {
            throw new UsuarioException(
                "Tu cuenta aún no ha sido aceptada."
            );
        }

        return admin;
    }
    
    
    public void cerrarSesion() {
        // No hay sesión que cerrar en backend
        // Método intencionadamente vacío por ahora, este método hay q completarlo bien al meter springSecurity con JWT
    }

    /* =====================================================
       3. VER SOLICITUDES DE ADMIN PENDIENTES
       ===================================================== */
    public List<Usuario> solicitudesPendientes() {
        return usuarioRepository.findAll()
                .stream()
                .filter(a -> !a.isAceptado())
                .toList();
    }

    /* =====================================================
       4. ACEPTAR ADMINISTRADOR
       ===================================================== */
    public Usuario aceptarAdministrador(int idAdmin, Usuario datos) {

        // Validación ID body vs path
        if (datos.getId() != idAdmin) {
            throw new UsuarioException(
                String.format(
                    "El id del body (%d) y el id del path (%d) no coinciden",
                    datos.getId(), idAdmin
                )
            );
        }

        // Validar que SOLO venga el ID
        if (
            datos.getDni() != null ||
            datos.getNombre() != null ||
            datos.getApellido1() != null ||
            datos.getApellido2() != null ||
            datos.getAnioNacimiento() != null ||
            datos.getGenero() != null ||
            datos.getTelefono() != null ||
            datos.getEmail() != null ||
            datos.getNombreUsuario() != null ||
            datos.getPassword() != null ||
            datos.getMensajePresentacion() != null ||
            datos.getFoto() != null ||
            datos.isBloqueado() != false || // default
            datos.isAceptado() != false ||  // default
            datos.getRol() != null
        ) {
            throw new UsuarioException(
                "solo necesitas introducir correctamente el ID y el administrador será aceptado"
            );
        }

        // Buscar administrador
        Usuario admin = usuarioRepository.findById(idAdmin)
            .orElseThrow(() ->
                new UsuarioNotFoundException("El administrador no existe")
            );

        // Cambiar estado
        admin.setAceptado(true);

        return usuarioRepository.save(admin);
    }

    /* =====================================================
       5. RECHAZAR ADMINISTRADOR
       ===================================================== */
    public void rechazarAdmin(int idAdmin) {

        if (!usuarioRepository.existsById(idAdmin)) {
            throw new AdministradorNotFoundException("El administrador no existe");
        }

        usuarioRepository.deleteById(idAdmin);
    }

    
}
