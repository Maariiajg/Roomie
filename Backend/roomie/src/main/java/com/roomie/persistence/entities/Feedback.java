package com.roomie.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; 
   
    @ManyToOne 
    @JoinColumn(name = "id_usuario_pone", nullable = false)
    private Usuario usuarioPone;

    @ManyToOne 
    @JoinColumn(name = "id_usuario_recibe", nullable = false)
    private Usuario usuarioRecibe;

    
    @Column(nullable = false)
    @Min(value = 1, message = "La calificación debe ser al menos 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private int calificacion;

    @Column(length = 500)
    private String descripcion;
    
    @Column(nullable = false)
    private boolean visible = true;
    
}