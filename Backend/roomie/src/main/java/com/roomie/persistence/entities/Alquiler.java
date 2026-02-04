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

    // Mapea la relación "pide": El Usuario que solicita
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario; 

    // Mapea la relación "se pone": El Piso solicitado
    @ManyToOne
    @JoinColumn(name = "id_piso", nullable = false)
    private Piso piso;

    @Column(name = "f_inicio", nullable = false)
    private LocalDate fInicio; 

    @Column(name = "f_fin", nullable = false)
    private LocalDate fFin; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlquilerEstadoSolicitud estadoSolicitud;

    @Column(nullable = false)
    private boolean favorito = false;
}