package com.roomie.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "administrador") 
@Getter
@Setter
@NoArgsConstructor
public class Administrador {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(length = 9, unique = true, nullable = false)
    @Size(min = 9, max = 9, message = "El DNI debe tener exactamente 9 caracteres")
    private String dni;
    
    @Column(length = 20, nullable = false)
    private String nombre;
    
    @Column(length = 30, nullable = false)
    private String apellido1;
    
    @Column(length = 30)
    private String apellido2;

    @Column(length = 20, name = "nombre_usuario", unique = true, nullable = false) 
    private String nombreUsuario;
    
    @Column(nullable = false, length = 60) 
    @Size(min = 8, max = 60, message = "La contraseña debe tener entre 8 y 60 caracteres") // CORRECCIÓN: min 8 y max 60
    private String password;
    
    @Column(length = 9)
    @Pattern(regexp = "\\d{9}", message = "El teléfono debe tener 9 dígitos numéricos")
    private String telefono; 
    
    @Column(length = 60, unique = true, nullable = false)
    private String email;

    
    @Column(name = "aceptado", nullable = false)
    private boolean aceptado = false; 
}
