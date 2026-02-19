package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Feedback;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.EstadoFeedback;
import com.roomie.persistence.repositories.FeedbackRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.feedback.FeedbackException;
import com.roomie.services.exceptions.feedback.FeedbackNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@Service
public class FeedbackService {

	@Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /* =====================================================
       1️⃣ FIND BY ID (SIN FILTRAR VISIBILIDAD)
       ===================================================== */
    public Feedback findById(int idFeedback) {

        return feedbackRepository.findById(idFeedback)
                .orElseThrow(() ->
                        new FeedbackNotFoundException("El feedback no existe"));
    }

    /* =====================================================
       2️⃣ FIND VISIBLE BY ID
       ===================================================== */
    public Feedback findVisibleById(int idFeedback) {

        Feedback feedback = findById(idFeedback);

        if (!feedback.isVisible() ||
            feedback.getEstadoFeedback() != EstadoFeedback.VALORADO) {

            throw new FeedbackException("El feedback no es visible");
        }

        return feedback;
    }

    /* =====================================================
       3️⃣ VER FEEDBACKS VISIBLES DE UN USUARIO
       ===================================================== */
    public List<Feedback> feedbacksVisiblesDeUsuario(int idUsuario) {

        if (!usuarioRepository.existsById(idUsuario)) {
            throw new UsuarioNotFoundException("El usuario no existe");
        }

        return feedbackRepository
                .findByUsuarioRecibeIdAndVisibleTrueAndEstadoFeedback(
                        idUsuario,
                        EstadoFeedback.VALORADO
                );
    }

    /* =====================================================
       4️⃣ DEJAR FEEDBACK (VALORAR)
       ===================================================== */
    public Feedback valorar(int idUsuarioPone, int idUsuarioRecibe, Feedback datos) {

        // ❌ No permitir introducir ID manual
        if (datos.getId() != 0) {
            throw new FeedbackException("No se puede introducir el ID manualmente");
        }

        // ❌ No permitir introducir estado manual
        if (datos.getEstadoFeedback() != null) {
            throw new FeedbackException("No se puede introducir el estado manualmente");
        }

        // ❌ No permitir tocar visible
        if (!datos.isVisible()) {
            throw new FeedbackException("No se puede modificar el campo visible");
        }

        Usuario usuarioPone = usuarioRepository.findById(idUsuarioPone)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario que valora no existe"));

        Usuario usuarioRecibe = usuarioRepository.findById(idUsuarioRecibe)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario a valorar no existe"));

        if (idUsuarioPone == idUsuarioRecibe) {
            throw new FeedbackException("No puedes valorarte a ti mismo");
        }

        Feedback feedback = feedbackRepository
                .findByUsuarioPoneIdAndUsuarioRecibeId(idUsuarioPone, idUsuarioRecibe)
                .orElseThrow(() ->
                        new FeedbackException("El feedback no existe"));

        // Solo si está PENDIENTE
        if (feedback.getEstadoFeedback() != EstadoFeedback.PENDIENTE) {
            throw new FeedbackException("El feedback no está disponible para valorar");
        }

        feedback.setCalificacion(datos.getCalificacion());
        feedback.setDescripcion(datos.getDescripcion());
        feedback.setFecha(LocalDate.now());
        feedback.setEstadoFeedback(EstadoFeedback.VALORADO);

        return feedbackRepository.save(feedback);
    }

    /* =====================================================
       5️⃣ MEDIA DE CALIFICACIONES (SOLO VALORADO + VISIBLE)
       ===================================================== */
    public double mediaCalificaciones(int idUsuario) {

        List<Feedback> feedbacks = feedbacksVisiblesDeUsuario(idUsuario);

        if (feedbacks.isEmpty()) {
            return 0;
        }

        return feedbacks.stream()
                .mapToInt(Feedback::getCalificacion)
                .average()
                .orElse(0);
    }

    /* =====================================================
       6️⃣ OCULTAR / MOSTRAR FEEDBACK
       ===================================================== */
    public Feedback toggleVisible(int idFeedback) {

        Feedback feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() ->
                        new FeedbackNotFoundException("El feedback no existe"));

        feedback.setVisible(!feedback.isVisible());

        return feedbackRepository.save(feedback);
    }

}
