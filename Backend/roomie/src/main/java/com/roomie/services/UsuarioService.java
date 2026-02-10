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
        // Validar que el rol sea USUARIO
        if (usuario.getRol() != Roles.USUARIO) {
            throw new UsuarioException("Solo se pueden registrar usuarios con rol USUARIO.");
        }

        // Validar campos obligatorios
        if (usuario.getNombre() == null || usuario.getApellido1() == null || usuario.getAnioNacimiento() == null ||
            usuario.getGenero() == null || usuario.getTelefono() == null || usuario.getEmail() == null ||
            usuario.getNombreUsuario() == null || usuario.getPassword() == null) {
            throw new UsuarioException("Todos los campos obligatorios deben ser completados.");
        }

        // Validar que el nombre de usuario y el email sean únicos
        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            throw new UsuarioException("El nombre de usuario ya está en uso.");
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new UsuarioException("El email ya está en uso.");
        }

        // Inicializar valores por defecto
        usuario.setId(0); // Asegurarse de que es un nuevo registro
        usuario.setBloqueado(false);
        usuario.setAceptado(true); // Automáticamente aceptado como usuario

        // Guardar el usuario
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