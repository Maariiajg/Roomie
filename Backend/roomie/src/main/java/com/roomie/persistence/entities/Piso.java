package com.roomie.persistence.entities;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "piso")
@Getter
@Setter
@NoArgsConstructor
public class Piso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(length = 150, nullable = false)
    private String direccion;
    
    @Column(length = 500)
    private String descripcion;
    
    @Column(name = "tamanio_piso")
    private int tamanio; 
    
    @Column(name = "precio_mes", nullable = false)
    private double precioMes;

    @Column(name = "num_total_habitaciones", nullable = false)
    private int numTotalHabitaciones;
    
    @Column(name = "num_ocupantes_actual", nullable = false)
    private int numOcupantesActual;

    @Column(name = "f_publicacion")
    private LocalDate fPublicacion;

    // Atributos booleanos (características)
    private boolean garaje;
    private boolean animales;
    private boolean wifi;
    private boolean tabaco; 

    // Puede haber michas fotos de un piso
    @OneToMany(mappedBy = "piso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Foto> fotos;

    // Relación 1:N con Alquiler (Solicitudes recibidas - relación "se pone" y "pide")
    @OneToMany(mappedBy = "piso") 
    private List<Alquiler> alquileresSolicitados;
    
    // Relación N:1 con Usuario (dueño del piso - relación "pone")
    @ManyToOne 
    @JoinColumn(name = "id_owner", nullable = false) 
    private Usuario owner;
    
    // relación con favorito
    @OneToMany(mappedBy = "piso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorito> marcadoPorUsuarios = new ArrayList<>();
}