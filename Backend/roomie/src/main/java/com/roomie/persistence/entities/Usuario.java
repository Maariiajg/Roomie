package com.roomie.persistence.entities;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.roomie.persistence.entities.enums.Genero;
import com.roomie.persistence.entities.enums.Roles;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@Column(length = 9, nullable = false, unique = true)
	@Size(min = 9, max = 9, message = "El DNI debe tener exactamente 9 caracteres")
	private String dni;
	
	@Column(length = 20)
	private String nombre;
	
	@Column(length = 30)
	private String apellido1;
	
	@Column(length = 30)
	private String apellido2;
	
	@Column(name = "anio_nacimiento")
	private LocalDate anioNacimiento;
	
	@Enumerated(value = EnumType.STRING)
	private Genero genero;
	
	@Column(length = 9)
	@Pattern(regexp = "\\d{9}", message = "El teléfono debe tener 9 dígitos numéricos")
	private String telefono; 
	
	@Column(length = 60, unique = true) 
	private String email;	
	
	@Column(length = 20, name = "nombre_usuario", nullable = false, unique = true) // MEJORA: Nombre de usuario único
	private String nombreUsuario;
	
	@Column(nullable = false, length = 60) 
	@Size(min = 8, max = 60, message = "La contraseña debe tener entre 8 y 60 caracteres") // CORRECCIÓN: Tamaño mínimo 8 y máximo 60
	private String password;
	
	@Column(name = "mensaje_presentacion", length = 70)
	private String mensajePresentacion;
	
	private String foto;
	
	@Column(nullable = false)
	private boolean bloqueado = false;
	
	@Column(nullable = false)
	private boolean aceptado = false;
	
	@Column
	private Roles rol;
	
	
	//MAPEOS
	
	// Relación 1:N Feedback puesto 
    @OneToMany(mappedBy = "usuarioPone")
    private List<Feedback> feedbackPuesto;

    //Feedback recibido
    @OneToMany(mappedBy = "usuarioRecibe")
    private List<Feedback> feedbackRecibido;
    
    // Relación 1:N Alquiler (pide)
    @OneToMany(mappedBy = "usuario") 
    private List<Alquiler> alquileresEnviados;
    
    //Piso (pone)
    @OneToMany(mappedBy = "usuarioDueno")
    private List<Piso> pisosPuestos;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorito> favoritos = new ArrayList<>();
    
    
}