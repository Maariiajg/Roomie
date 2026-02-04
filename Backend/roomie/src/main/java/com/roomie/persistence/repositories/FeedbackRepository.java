package com.roomie.persistence.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findByUsuarioRecibeId(int idUsuario);

    List<Feedback> findByUsuarioRecibeIdAndVisibleTrue(int idUsuario);
}
