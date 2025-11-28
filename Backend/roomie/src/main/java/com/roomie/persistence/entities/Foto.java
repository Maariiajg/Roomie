package com.roomie.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "foto")
@Getter
@Setter
@NoArgsConstructor
public class Foto { //Al haber mas de una foto por piso creamos una entidad para guardarlas

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; 
    
    @Column(length = 500, nullable = false) 
    private String url;
    
    // Relación N:1 con Piso. Muchas fotos pertenecen a UN piso.
    @ManyToOne 
    @JoinColumn(name = "id_piso", nullable = false)
    private Piso piso;
}
