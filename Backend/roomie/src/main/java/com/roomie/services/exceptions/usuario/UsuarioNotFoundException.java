package com.roomie.services.exceptions.usuario;

public class UsuarioNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 8954845870461706054L;

	public UsuarioNotFoundException(String message) {
		super(message);
	}
}
