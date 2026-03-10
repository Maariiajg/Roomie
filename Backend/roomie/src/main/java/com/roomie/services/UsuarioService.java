package com.roomie.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    

    // Método para encontrar todos los usuarios y owners
    public List<Usuario> findAllUsuariosYOwners() {
        return usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getRol() == Roles.USUARIO || usuario.getRol() == Roles.OWNER)
                .collect(Collectors.toList());
    }
    
 // Método para encontrar un usuario por ID
    public Usuario findById(int idUsuario) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getRol() == Roles.USUARIO || usuario.getRol() == Roles.OWNER) {
                return usuario;
            }
        }
        throw new UsuarioNotFoundException("El usuario con ID " + idUsuario + " no fue encontrado o no tiene acceso.");
    }
    
    
 // Método para registrar un nuevo usuario
    public Usuario registrar(Usuario usuario) {

        if (usuario.getRol() != null) {
            throw new UsuarioException(
                "No puedes introducir el rol; por defecto será USUARIO."
            );
        }

        if (usuario.getId() != 0) {
            throw new UsuarioException(
                "No puedes introducir el id; se genera automáticamente."
            );
        }

        if (usuario.isBloqueado()) {
            throw new UsuarioException(
                "No puedes introducir el estado 'bloqueado'."
            );
        }

        if (usuario.isAceptado()) {
            throw new UsuarioException(
                "No puedes introducir el estado 'aceptado'."
            );
        }

        // Validar campos obligatorios
        if (usuario.getNombre() == null ||
            usuario.getApellido1() == null ||
            usuario.getAnioNacimiento() == null ||
            usuario.getGenero() == null ||
            usuario.getTelefono() == null ||
            usuario.getEmail() == null ||
            usuario.getNombreUsuario() == null ||
            usuario.getPassword() == null) {

            throw new UsuarioException(
                "Todos los campos obligatorios deben ser completados."
            );
        }

        // Validar unicidad
        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            throw new UsuarioException("El nombre de usuario ya está en uso.");
        }

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new UsuarioException("El email ya está en uso.");
        }
        
        if (usuarioRepository.existsByDni(usuario.getDni())) {
            throw new UsuarioException("El DNI ya existe en la base de datos.");
        }

        usuario.setRol(Roles.USUARIO);
        usuario.setId(0);              // nuevo registro
        usuario.setBloqueado(false);   // por defecto
        usuario.setAceptado(true);     // por defecto

        return usuarioRepository.save(usuario);
    }
    
    
    
    
    // Método para iniciar sesión
    public Usuario iniciarSesion(String nombreUsuario, String password) {

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsuarioException(
                    "Nombre de usuario o contraseña incorrectos."
                ));

        if (!usuario.getPassword().equals(password)) {
            throw new UsuarioException(
                "Nombre de usuario o contraseña incorrectos."
            );
        }

        if (usuario.isBloqueado()) {
            throw new UsuarioException(
                "Tu cuenta está bloqueada. Contacta con un administrador."
            );
        }

        if (!usuario.isAceptado()) {
            throw new UsuarioException(
                "Tu cuenta aún no ha sido aceptada."
            );
        }

        return usuario;
    }

    
    
    
    
    public void cerrarSesion() {
        // No hay sesión que cerrar en backend
        // Método intencionadamente vacío por ahora, este método hay q completarlo bien al meter springSecurity con JWT
    }

    
    public Usuario actualizarPerfil(int idUsuario, Usuario datos) {
    	
    	if (datos.getId() != idUsuario) {
			throw new UsuarioException(
					String.format("El id del body (%d) y el id del path (%d) no coinciden", datos.getId(), idUsuario));
		}
    	
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        
        // Validar campos NO permitidos
        if (datos.getNombreUsuario() != null ||
            datos.getPassword() != null ||
            datos.isBloqueado() ||
            datos.isAceptado() ||
            datos.getRol() != null) {

            throw new UsuarioException("No puedes modificar alguno de los campos introducidos.");
        }

        // Actualizar solo campos permitidos
        usuario.setDni(datos.getDni());
        usuario.setNombre(datos.getNombre());
        usuario.setApellido1(datos.getApellido1());
        usuario.setApellido2(datos.getApellido2());
        usuario.setAnioNacimiento(datos.getAnioNacimiento());
        usuario.setGenero(datos.getGenero());
        usuario.setTelefono(datos.getTelefono());
        usuario.setEmail(datos.getEmail());
        usuario.setFoto(datos.getFoto());
        usuario.setMensajePresentacion(datos.getMensajePresentacion());

        return usuarioRepository.save(usuario);
    }

    
    public Usuario cambiarEstadoBloqueo(int idUsuario, Usuario datos, boolean bloquear) {

        // 🔐 Validación ID path vs body
        if (datos.getId() != idUsuario) {
            throw new UsuarioException(
                    String.format(
                            "El id del body (%d) y el id del path (%d) no coinciden",
                            datos.getId(),
                            idUsuario
                    )
            );
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        // 🔒 Validar que NO venga ningún otro campo
        if (datos.getNombre() != null ||
            datos.getApellido1() != null ||
            datos.getApellido2() != null ||
            datos.getDni() != null ||
            datos.getEmail() != null ||
            datos.getTelefono() != null ||
            datos.getGenero() != null ||
            datos.getAnioNacimiento() != null ||
            datos.getNombreUsuario() != null ||
            datos.getPassword() != null ||
            datos.getRol() != null ||
            datos.isAceptado()) {

            throw new UsuarioException("Solo se puede modificar el estado de bloqueo del usuario.");
        }

        usuario.setBloqueado(bloquear);
        return usuarioRepository.save(usuario);
    }

    
    
    public Usuario cambiarCredenciales(int idUsuario, Usuario datos) {

    	if (datos.getId() != idUsuario) {
			throw new UsuarioException(
					String.format("El id del body (%d) y el id del path (%d) no coinciden", datos.getId(), idUsuario));
		}
    	
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        // Validar campos NO permitidos
        if (datos.getDni() != null ||
            datos.getNombre() != null ||
            datos.getApellido1() != null ||
            datos.getApellido2() != null ||
            datos.getAnioNacimiento() != null ||
            datos.getGenero() != null ||
            datos.getTelefono() != null ||
            datos.getEmail() != null ||
            datos.getMensajePresentacion() != null ||
            datos.getFoto() != null ||
            datos.isBloqueado() ||
            datos.isAceptado() ||
            datos.getRol() != null) {

            throw new UsuarioException("Solo puedes modificar el nombre de usuario y/o la contraseña.");
        }

        // Cambiar nombreUsuario si viene
        if (datos.getNombreUsuario() != null) {
            if (usuarioRepository.existsByNombreUsuario(datos.getNombreUsuario())) {
                throw new UsuarioException("El nombre de usuario ya está en uso.");
            }
            usuario.setNombreUsuario(datos.getNombreUsuario());
        }

        // Cambiar password si viene
        if (datos.getPassword() != null) {
            usuario.setPassword(datos.getPassword());
        }

        return usuarioRepository.save(usuario);
    }

    
 // =========================================================================
    // MÉTODO INTERNO — llamado desde PisoService
    // Cambia el rol de un usuario sin pasar por las validaciones del perfil.
    // Solo lo usan otros services internamente (crear piso, ceder piso, eliminar piso).
    // =========================================================================
    public void cambiarRol(int idUsuario, Roles nuevoRol) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException(
                                "Usuario con ID " + idUsuario + " no encontrado."));

        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);
    }


}