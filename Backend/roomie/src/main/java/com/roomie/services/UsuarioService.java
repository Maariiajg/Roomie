package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /* =====================================================
       1. LISTAR TODOS
       ===================================================== */
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    /* =====================================================
       2. VER PERFIL POR ID (ADMIN)
       ===================================================== */
    public Usuario findById(int idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("El usuario con id " + idUsuario + " no existe"));
    }

    /* =====================================================
       3. VER MI PERFIL / PERFIL POR NOMBRE USUARIO
       ===================================================== */
    public Usuario findByNombreUsuario(String nombreUsuario) {

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario);

        if (usuario == null) {
            throw new UsuarioNotFoundException(
                    "No existe el usuario con nombreUsuario: " + nombreUsuario);
        }

        if (usuario.isBloqueado()) {
            throw new UsuarioException("El usuario está bloqueado");
        }

        return usuario;
    }

    /* =====================================================
       4. REGISTRAR USUARIO
       ===================================================== */
    public Usuario registrar(Usuario usuario) {

        if (usuarioRepository.existsByDni(usuario.getDni())) {
            throw new UsuarioException("El DNI ya está registrado");
        }

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new UsuarioException("El email ya está registrado");
        }

        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            throw new UsuarioException("El nombre de usuario ya existe");
        }

        /*if (!usuario.getPassword().equals(usuario.getRepetirPassword())) {
            throw new UsuarioException("Las contraseñas no coinciden");
        }*///Para cuando meta DTO

        usuario.setId(0);
        usuario.setBloqueado(false);

        return usuarioRepository.save(usuario);
    }

    /* =====================================================
       5. INICIAR SESIÓN
       ===================================================== */
    public Usuario iniciarSesion(String nombreUsuario, String password) {

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario);

        if (usuario == null) {
            throw new UsuarioException("Credenciales incorrectas");
        }

        if (usuario.isBloqueado()) {
            throw new UsuarioException("El usuario está bloqueado por un administrador");
        }

        if (!usuario.getPassword().equals(password)) {
            throw new UsuarioException("Credenciales incorrectas");
        }

        return usuario;
    }

    /* =====================================================
       6. ACTUALIZAR PERFIL (DATOS PERSONALES)
       ===================================================== */
    public Usuario update(Usuario usuario, int idUsuario) {

        if (usuario.getId() != idUsuario) {
            throw new UsuarioException(
                    String.format("El id del body (%d) y el id del path (%d) no coinciden",
                            usuario.getId(), idUsuario));
        }

        Usuario usuarioBD = findById(idUsuario);

        if (usuario.getPassword() != null ||
            usuario.getNombreUsuario() != null ||
            usuario.getDni() != null ||
            usuario.isBloqueado() != usuarioBD.isBloqueado()) {

            throw new UsuarioException(
                    "No se pueden modificar contraseña, nombreUsuario, DNI ni bloqueo desde este endpoint");
        }

        usuarioBD.setNombre(usuario.getNombre());
        usuarioBD.setApellido1(usuario.getApellido1());
        usuarioBD.setApellido2(usuario.getApellido2());
        usuarioBD.setAnioNacimiento(usuario.getAnioNacimiento());
        usuarioBD.setGenero(usuario.getGenero());
        usuarioBD.setTelefono(usuario.getTelefono());
        usuarioBD.setEmail(usuario.getEmail());
        usuarioBD.setMensajePresentacion(usuario.getMensajePresentacion());
        usuarioBD.setFoto(usuario.getFoto());

        return usuarioRepository.save(usuarioBD);
    }

    /* =====================================================
       7. BLOQUEAR / DESBLOQUEAR (ADMIN)
       ===================================================== */
    public Usuario toggleBloqueo(Usuario usuario, int idUsuario) {

        if (usuario.getId() != idUsuario) {
            throw new UsuarioException("IDs no coinciden");
        }

        Usuario usuarioBD = findById(idUsuario);

        if (usuario.getNombre() != null ||
            usuario.getApellido1() != null ||
            usuario.getApellido2() != null ||
            usuario.getEmail() != null ||
            usuario.getPassword() != null ||
            usuario.getNombreUsuario() != null) {

            throw new UsuarioException(
                    "Este endpoint solo permite bloquear o desbloquear");
        }

        usuarioBD.setBloqueado(!usuarioBD.isBloqueado());

        return usuarioRepository.save(usuarioBD);
    }

    /* =====================================================
       8. CAMBIAR CONTRASEÑA Y NOMBRE USUARIO
       ===================================================== */
    public Usuario cambiarCredenciales(Usuario usuario, int idUsuario) {

        if (usuario.getId() != idUsuario) {
            throw new UsuarioException("IDs no coinciden");
        }

        Usuario usuarioBD = findById(idUsuario);

        if (usuario.getNombre() != null ||
            usuario.getApellido1() != null ||
            usuario.getEmail() != null ||
            usuario.getDni() != null ||
            usuario.getMensajePresentacion() != null ||
            usuario.getFoto() != null) {

            throw new UsuarioException(
                    "Este endpoint solo permite cambiar nombreUsuario y contraseña");
        }

        /*if (!usuario.getPassword().equals(usuario.getRepetirPassword())) {
            throw new UsuarioException("Las contraseñas no coinciden");
        }*/

        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            throw new UsuarioException("El nombre de usuario ya existe");
        }

        usuarioBD.setNombreUsuario(usuario.getNombreUsuario());
        usuarioBD.setPassword(usuario.getPassword());

        return usuarioRepository.save(usuarioBD);
    }
}