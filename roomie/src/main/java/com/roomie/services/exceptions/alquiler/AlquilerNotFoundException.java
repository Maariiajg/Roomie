package com.roomie.services.exceptions.alquiler;

public class AlquilerNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 8954845870461706054L;

	public AlquilerNotFoundException(String message) {
		super(message);
	}
}