package com.roomie.services.exceptions.piso;

public class PisoNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 8954845870461706054L;

	public PisoNotFoundException(String message) {
		super(message);
	}
}
