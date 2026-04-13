package com.roomie.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.services.dto.LoginResponse;
import com.roomie.services.dto.RefreshDTO;
import com.roomie.services.dto.RegistroResponse;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.usuario.InicioSesionDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.web.config.JwtUtils;

@Service
public class LoginService {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AdministradorService administradorService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtil;

    // =========================================================================
    // REGISTRO USUARIO — devuelve tokens + info (auto-login)
    // =========================================================================
    public RegistroResponse registrarUsuario(UsuarioRegistroDTO request) {
        usuarioService.registrar(request);
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getNombreUsuario(), request.getPassword())
        );
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        Usuario usuario = usuarioService.findByNombreUsuario(request.getNombreUsuario());
        return new RegistroResponse(
            jwtUtil.generateAccessToken(userDetails),
            jwtUtil.generateRefreshToken(userDetails),
            usuario.getId(),
            usuario.getNombreUsuario(),
            usuario.getRol().name()
        );
    }

    // =========================================================================
    // REGISTRO ADMINISTRADOR — NO hace auto-login (necesita aceptación previa)
    // Devuelve null (el controller responderá con un mensaje informativo)
    // =========================================================================
    public void registrarAdministrador(AdministradorRegistroDTO request) {
        administradorService.registrarAdministrador(request);
        // No se genera token: la cuenta queda con aceptado=false
        // hasta que otro administrador la acepte desde el panel.
    }

    // =========================================================================
    // LOGIN — devuelve tokens + info
    // =========================================================================
    public RegistroResponse login(InicioSesionDTO request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getNombreUsuario(), request.getPassword())
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Usuario usuario = usuarioService.findByNombreUsuario(request.getNombreUsuario());

        // Validaciones adicionales (bloqueado, no aceptado)
        if (usuario.isBloqueado()) {
            throw new UsuarioException("Tu cuenta está bloqueada. Contacta con un administrador.");
        }
        if (!usuario.isAceptado()) {
            throw new UsuarioException("Tu cuenta aún no ha sido aceptada por un administrador.");
        }

        return new RegistroResponse(
            jwtUtil.generateAccessToken(userDetails),
            jwtUtil.generateRefreshToken(userDetails),
            usuario.getId(),
            usuario.getNombreUsuario(),
            usuario.getRol().name()
        );
    }

    // =========================================================================
    // REFRESH — solo renueva los tokens, no necesita info de usuario
    // =========================================================================
    public LoginResponse refresh(RefreshDTO dto) {
        String accessToken = jwtUtil.generateAccessToken(dto.getRefresh());
        String refreshToken = jwtUtil.generateRefreshToken(dto.getRefresh());
        return new LoginResponse(accessToken, refreshToken);
    }
}