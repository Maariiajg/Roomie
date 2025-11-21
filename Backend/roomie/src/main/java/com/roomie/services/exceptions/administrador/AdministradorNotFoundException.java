package com.roomie.services.exceptions.administrador;

public class AdministradorNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 8954845870461706054L;

	public AdministradorNotFoundException(String message) {
		super(message);
	}
}
