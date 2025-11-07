package com.roomie.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Administrador")
@Getter
@Setter
@NoArgsConstructor
public class Administrador {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@Column(length = 9)
	private String dni;
	
	@Column(length = 20)
	private String nombre;
	
	@Column(length = 30)
	private String apellido1;
	@Column(length = 30)
	
	private String apellido2;
	private String nombreUsuario;
	private String password;
	private int telefono;
	private String email;
}
