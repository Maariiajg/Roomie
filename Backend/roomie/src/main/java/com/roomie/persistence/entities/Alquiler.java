package com.roomie.persistence.entities;

import java.time.LocalDate;

import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "alquiler")
@Getter
@Setter
@NoArgsConstructor
public class Alquiler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Fecha elegida por el usuario
    @Column(name = "f_inicio", nullable = false)
    private LocalDate fInicio;

    // Puede ser null (estancia indefinida)
    @Column(name = "f_fin")
    private LocalDate fFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_solicitud")
    private AlquilerEstadoSolicitud estadoSolicitud;

 // Usuario que solicita 
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // Piso solicitado 
    @ManyToOne
    @JoinColumn(name = "id_piso", nullable = false)
    private Piso piso;
    
}