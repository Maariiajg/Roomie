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
                .orElseThrow(() -> new UsuarioException("Nombre de usuario o contraseña incorrectos."));

        if (!usuario.getPassword().equals(password)) {
            throw new UsuarioException("Nombre de usuario o contraseña incorrectos.");
        }

        return usuario; // Retornamos el usuario autenticado
    }

}