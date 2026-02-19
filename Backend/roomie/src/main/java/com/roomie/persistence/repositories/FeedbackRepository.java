package com.roomie.persistence.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roomie.persistence.entities.Feedback;
import com.roomie.persistence.entities.enums.EstadoFeedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

	Optional<Feedback> findByUsuarioPoneIdAndUsuarioRecibeId(int idPone, int idRecibe);

    List<Feedback> findByUsuarioRecibeIdAndVisibleTrueAndEstadoFeedback(
            int idUsuario,
            EstadoFeedback estadoFeedback
    );
    
    boolean existsByUsuarioPoneIdAndUsuarioRecibeId(int idPone, int idRecibe);
    
    List<Feedback> findByUsuarioPoneIdAndUsuarioRecibeIdAndEstadoFeedback(
            int idPone,
            int idRecibe,
            EstadoFeedback estadoFeedback
    );

}
