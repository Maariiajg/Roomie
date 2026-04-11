package com.roomie.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.services.LoginService;
import com.roomie.services.dto.LoginResponse;
import com.roomie.services.dto.RefreshDTO;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.usuario.InicioSesionDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;

@RestController
@RequestMapping("/auth")
public class AuthController {
	
	@Autowired
	private LoginService loginService;

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody InicioSesionDTO request) {
		return ResponseEntity.ok(this.loginService.login(request));
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody UsuarioRegistroDTO request) {
		return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION, this.loginService.registrarUsuario(request)).build();
	}
	@PostMapping("/register-admin")
	public ResponseEntity<?> registerAdmin(@RequestBody AdministradorRegistroDTO request) {
		return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION, this.loginService.registrarAdministrador(request)).build();
	}

	@PostMapping("/refresh")
	public ResponseEntity<?> refresh(@RequestBody RefreshDTO request) {
		return ResponseEntity.ok(this.loginService.refresh(request));
	}
}