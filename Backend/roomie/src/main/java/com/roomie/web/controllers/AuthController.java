package com.roomie.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.dto.AuthResponseDTO;
import com.roomie.services.dto.usuario.InicioSesionDTO;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.web.config.JwtUtils;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // =========================================================================
    // LOGIN USUARIO (roles USUARIO y OWNER)
    // =========================================================================
    @PostMapping("/login/usuario")
    public ResponseEntity<AuthResponseDTO> loginUsuario(@RequestBody InicioSesionDTO dto) {

        // 1. Autenticar con Spring Security (lanza excepción si falla)
        UserDetails userDetails = autenticar(dto.getNombreUsuario(), dto.getPassword());

        // 2. Verificar que el rol sea USUARIO u OWNER (no ADMINISTRADOR)
        Usuario usuario = usuarioRepository.findByNombreUsuario(dto.getNombreUsuario())
                .orElseThrow(() -> new UsuarioException("Usuario no encontrado."));

        if (usuario.getRol() == Roles.ADMINISTRADOR) {
            throw new UsuarioException(
                "Esta cuenta es de administrador. Usa /auth/login/administrador.");
        }

        // 3. Verificar que no esté bloqueado
        if (usuario.isBloqueado()) {
            throw new UsuarioException(
                "Tu cuenta está bloqueada. Contacta con un administrador.");
        }

        // 4. Generar tokens
        String accessToken  = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return ResponseEntity.ok(new AuthResponseDTO(
                accessToken,
                refreshToken,
                usuario.getNombreUsuario(),
                usuario.getRol().name(),
                usuario.getId()
        ));
    }

    // =========================================================================
    // LOGIN ADMINISTRADOR
    // =========================================================================
    @PostMapping("/login/administrador")
    public ResponseEntity<AuthResponseDTO> loginAdministrador(
            @RequestParam String nombreUsuario,
            @RequestParam String password) {

        // 1. Autenticar con Spring Security
        UserDetails userDetails = autenticar(nombreUsuario, password);

        // 2. Verificar que el rol sea ADMINISTRADOR
        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsuarioException("Usuario no encontrado."));

        if (usuario.getRol() != Roles.ADMINISTRADOR) {
            throw new UsuarioException(
                "Esta cuenta no es de administrador. Usa /auth/login/usuario.");
        }

        // 3. Verificar que haya sido aceptado por otro administrador
        if (!usuario.isAceptado()) {
            throw new UsuarioException(
                "Tu cuenta de administrador aún no ha sido aceptada.");
        }

        // 4. Verificar que no esté bloqueado
        if (usuario.isBloqueado()) {
            throw new UsuarioException(
                "Tu cuenta está bloqueada. Contacta con otro administrador.");
        }

        // 5. Generar tokens
        String accessToken  = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return ResponseEntity.ok(new AuthResponseDTO(
                accessToken,
                refreshToken,
                usuario.getNombreUsuario(),
                usuario.getRol().name(),
                usuario.getId()
        ));
    }

    // =========================================================================
    // REFRESH TOKEN — renueva el accessToken con el refreshToken
    // =========================================================================
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @RequestParam String refreshToken) {

        // Extraer el username del refreshToken (JwtUtils ya verifica la firma)
        String nombreUsuario = jwtUtils.extractUsername(refreshToken);

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsuarioException("Usuario no encontrado."));

        if (usuario.isBloqueado()) {
            throw new UsuarioException("Tu cuenta está bloqueada.");
        }

        String nuevoAccessToken  = jwtUtils.generateAccessToken(refreshToken);
        String nuevoRefreshToken = jwtUtils.generateRefreshToken(refreshToken);

        return ResponseEntity.ok(new AuthResponseDTO(
                nuevoAccessToken,
                nuevoRefreshToken,
                usuario.getNombreUsuario(),
                usuario.getRol().name(),
                usuario.getId()
        ));
    }

    // =========================================================================
    // HELPER PRIVADO — delega en Spring Security la validación de credenciales
    // =========================================================================
    private UserDetails autenticar(String nombreUsuario, String password) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(nombreUsuario, password)
            );
        } catch (BadCredentialsException e) {
            throw new UsuarioException("Nombre de usuario o contraseña incorrectos.");
        }

        // Si llegamos aquí las credenciales son correctas
        return (UserDetails) authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(nombreUsuario, password))
                .getPrincipal();
    }
}
