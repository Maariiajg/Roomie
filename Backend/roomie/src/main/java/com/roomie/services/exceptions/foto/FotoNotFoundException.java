package com.roomie.services.exceptions.foto;

public class FotoNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 8954845870461706054L;

	public FotoNotFoundException(String message) {
		super(message);
	}
}