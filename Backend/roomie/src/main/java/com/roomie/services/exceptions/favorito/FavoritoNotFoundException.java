package com.roomie.services.exceptions.favorito;

public class FavoritoNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 8954845870461706054L;

	public FavoritoNotFoundException(String message) {
		super(message);
	}
}