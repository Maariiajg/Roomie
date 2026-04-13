package com.roomie.web.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.roomie.services.exceptions.administrador.AdministradorException;
import com.roomie.services.exceptions.administrador.AdministradorNotFoundException;
import com.roomie.services.exceptions.alquiler.AlquilerException;
import com.roomie.services.exceptions.alquiler.AlquilerNotFoundException;
import com.roomie.services.exceptions.favorito.FavoritoException;
import com.roomie.services.exceptions.favorito.FavoritoNotFoundException;
import com.roomie.services.exceptions.feedback.FeedbackException;
import com.roomie.services.exceptions.feedback.FeedbackNotFoundException;
import com.roomie.services.exceptions.foto.FotoException;
import com.roomie.services.exceptions.foto.FotoNotFoundException;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(AdministradorNotFoundException.class)
    public ResponseEntity<String> handleNotFound(AdministradorNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(AdministradorException.class)
    public ResponseEntity<String> handleNotFound(AdministradorException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	@ExceptionHandler(AlquilerNotFoundException.class)
    public ResponseEntity<String> handleNotFound(AlquilerNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(AlquilerException.class)
    public ResponseEntity<String> handleNotFound(AlquilerException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	@ExceptionHandler(FeedbackNotFoundException.class)
    public ResponseEntity<String> handleNotFound(FeedbackNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(FeedbackException.class)
    public ResponseEntity<String> handleNotFound(FeedbackException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	@ExceptionHandler(PisoNotFoundException.class)
    public ResponseEntity<String> handleNotFound(PisoNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(PisoException.class)
    public ResponseEntity<String> handleNotFound(PisoException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	@ExceptionHandler(UsuarioNotFoundException.class)
    public ResponseEntity<String> handleNotFound(UsuarioNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(UsuarioException.class)
    public ResponseEntity<String> handleNotFound(UsuarioException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	@ExceptionHandler(FotoNotFoundException.class)
    public ResponseEntity<String> handleNotFound(FotoNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(FotoException.class)
    public ResponseEntity<String> handleNotFound(FotoException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	@ExceptionHandler(FavoritoNotFoundException.class)
    public ResponseEntity<String> handleNotFound(FavoritoNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
	
	@ExceptionHandler(FavoritoException.class) 
    public ResponseEntity<String> handleNotFound(FavoritoException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
	
	
	//=========================================================
	
	@ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
	public ResponseEntity<String> handleDataIntegrity(
	        org.springframework.dao.DataIntegrityViolationException ex) {

	    return ResponseEntity.status(HttpStatus.CONFLICT)
	            .body("Ya existe un registro con esos datos únicos (email, DNI o nombre de usuario).");
	}
	
	@ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
	public ResponseEntity<String> handleBadJson(
	        org.springframework.http.converter.HttpMessageNotReadableException ex) {

	    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	            .body("El cuerpo de la petición no es un JSON válido o tiene un formato incorrecto.");
	}
	
	@ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
	public ResponseEntity<String> handleTypeMismatch(
	        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {

	    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	            .body("Parámetro con tipo incorrecto: " + ex.getName());
	}
	
	@ExceptionHandler(org.hibernate.LazyInitializationException.class)
	public ResponseEntity<String> handleLazy(org.hibernate.LazyInitializationException ex) {

	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body("Error de carga de datos: " + ex.getMessage());
	}
	
	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<String> handleIllegalState(IllegalStateException ex) {
	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(ex.getMessage());
	}
	
	@ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
	public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
	    return ResponseEntity.status(HttpStatus.FORBIDDEN)
	        .body("No tienes permisos para realizar esta acción.");
	}
}
