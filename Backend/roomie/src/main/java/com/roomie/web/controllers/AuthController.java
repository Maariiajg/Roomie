package com.roomie.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.services.LoginService;
import com.roomie.services.dto.RefreshDTO;
import com.roomie.services.dto.RegistroResponse;
import com.roomie.services.dto.administrador.AdministradorRegistroDTO;
import com.roomie.services.dto.usuario.InicioSesionDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;

@RestController
@RequestMapping("/auth")
public class AuthController {
	
	@Autowired
	private LoginService loginService;

	@PostMapping("/login")
	public ResponseEntity<RegistroResponse> login(@RequestBody InicioSesionDTO request) {
		return ResponseEntity.ok(this.loginService.login(request));
	}

	@PostMapping("/register")
	public ResponseEntity<RegistroResponse> register(@RequestBody UsuarioRegistroDTO request) {
	    return ResponseEntity.status(HttpStatus.CREATED).body(loginService.registrarUsuario(request));
	}
	@PostMapping("/register-admin")
	public ResponseEntity<String> registerAdmin(@RequestBody AdministradorRegistroDTO request) {
	    loginService.registrarAdministrador(request);
	    return ResponseEntity.status(HttpStatus.CREATED)
	        .body("Solicitud recibida. Tu cuenta debe ser aceptada por un administrador antes de poder iniciar sesión.");
	}

	@PostMapping("/refresh")
	public ResponseEntity<?> refresh(@RequestBody RefreshDTO request) {
		return ResponseEntity.ok(this.loginService.refresh(request));
	}
}