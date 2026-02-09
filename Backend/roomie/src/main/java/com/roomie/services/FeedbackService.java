package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Feedback;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;
import com.roomie.persistence.repositories.AlquilerRepository;
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

    @Autowired
    private AlquilerRepository alquilerRepository;

    /* =====================================================
       1. DEJAR FEEDBACK
       ===================================================== */
    public Feedback dejarFeedback(int idUsuarioPone, int idUsuarioRecibe, Feedback feedback) {

        if (idUsuarioPone == idUsuarioRecibe) {
            throw new FeedbackException("No puedes dejarte feedback a ti mismo");
        }

        Usuario usuarioPone = usuarioRepository.findById(idUsuarioPone)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("Usuario que pone feedback no existe"));

        Usuario usuarioRecibe = usuarioRepository.findById(idUsuarioRecibe)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("Usuario que recibe feedback no existe"));

        // Validar convivencia real
        boolean hanConvivido = alquilerRepository
                .findByUsuarioId(idUsuarioPone)
                .stream()
                .filter(a -> a.getEstadoSolicitud() == AlquilerEstadoSolicitud.ACEPTADA)
                .anyMatch(a -> a.getPiso().getAlquileresSolicitados()
                        .stream()
                        .anyMatch(b ->
                                b.getUsuario().getId() == idUsuarioRecibe &&
                                b.getEstadoSolicitud()
                                        .equals(AlquilerEstadoSolicitud.ACEPTADA.name())
                        )
                );

        if (!hanConvivido) {
            throw new FeedbackException(
                    "Solo puedes dejar feedback a usuarios con los que hayas convivido");
        }

        feedback.setId(0);
        feedback.setUsuarioPone(usuarioPone);
        feedback.setUsuarioRecibe(usuarioRecibe);
        feedback.setVisible(true);

        return feedbackRepository.save(feedback);
    }

    /* =====================================================
       2. VER FEEDBACKS VISIBLES DE UN USUARIO
       ===================================================== */
    public List<Feedback> feedbacksVisiblesDeUsuario(int idUsuario) {

        if (!usuarioRepository.existsById(idUsuario)) {
            throw new UsuarioNotFoundException("El usuario no existe");
        }

        return feedbackRepository.findByUsuarioRecibeIdAndVisibleTrue(idUsuario);
    }

    /* =====================================================
       3. MEDIA DE CALIFICACIONES (SOLO VISIBLES)
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
       4. OCULTAR / MOSTRAR FEEDBACK (ADMIN)
       ===================================================== */
    public Feedback toggleVisible(int idFeedback, Feedback feedback) {

        Feedback feedbackBD = feedbackRepository.findById(idFeedback)
                .orElseThrow(() ->
                        new FeedbackNotFoundException("El feedback no existe"));

        // Protección: solo se puede tocar 'visible'
        if (feedback.getCalificacion() != 0 ||
            feedback.getDescripcion() != null ||
            feedback.getUsuarioPone() != null ||
            feedback.getUsuarioRecibe() != null) {

            throw new FeedbackException(
                    "Este endpoint solo permite ocultar o mostrar el feedback");
        }

        feedbackBD.setVisible(!feedbackBD.isVisible());

        return feedbackRepository.save(feedbackBD);
    }
}
