package com.roomie.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.roomie.services.dto.LoginResponse;
import com.roomie.services.dto.RefreshDTO;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.usuario.InicioSesionDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;
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
	
	public String registrarUsuario(UsuarioRegistroDTO request) {
		this.usuarioService.registrar(request);
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getNombreUsuario(), request.getPassword()));
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		String token = jwtUtil.generateAccessToken(userDetails);

		return token;
	}
	
	public String registrarAdministrador(AdministradorRegistroDTO request) {
		this.administradorService.registrarAdministrador(request);
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getNombreUsuario(), request.getPassword()));
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		String token = jwtUtil.generateAccessToken(userDetails);

		return token;
	}

	public LoginResponse login(InicioSesionDTO request) {
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getNombreUsuario(), request.getPassword()));
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();

		String accessToken = jwtUtil.generateAccessToken(userDetails);
		String refreshToken = jwtUtil.generateRefreshToken(userDetails);

		return new LoginResponse(accessToken, refreshToken);
	}

	public LoginResponse refresh(RefreshDTO dto) {
		String accessToken = jwtUtil.generateAccessToken(dto.getRefresh());
		String refreshToken = jwtUtil.generateRefreshToken(dto.getRefresh());

		return new LoginResponse(accessToken, refreshToken);
	}

}
