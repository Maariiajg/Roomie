package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Feedback;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.EstadoFeedback;
import com.roomie.persistence.repositories.FeedbackRepository;
import com.roomie.services.exceptions.feedback.FeedbackException;
import com.roomie.services.exceptions.feedback.FeedbackNotFoundException;

@Service
public class FeedbackService {

    // ✅ Único repository propio
    @Autowired
    private FeedbackRepository feedbackRepository;

    // ✅ UsuarioService en lugar de UsuarioRepository
    @Autowired
    private UsuarioService usuarioService;


    // =========================================================================
    // 1. FIND BY ID (sin filtrar visibilidad)
    // =========================================================================
    public Feedback findById(int idFeedback) {

        return feedbackRepository.findById(idFeedback)
                .orElseThrow(() ->
                        new FeedbackNotFoundException("El feedback no existe."));
    }


    // =========================================================================
    // 2. FIND VISIBLE BY ID
    //    Solo devuelve el feedback si está en estado VALORADO y es visible.
    // =========================================================================
    public Feedback findVisibleById(int idFeedback) {

        Feedback feedback = findById(idFeedback);

        if (!feedback.isVisible() ||
                feedback.getEstadoFeedback() != EstadoFeedback.VALORADO) {
            throw new FeedbackException("El feedback no es visible.");
        }

        return feedback;
    }


    // =========================================================================
    // 3. VER FEEDBACKS VISIBLES DE UN USUARIO
    //    Solo los que tienen estado VALORADO y visible = true.
    // =========================================================================
    public List<Feedback> feedbacksVisiblesDeUsuario(int idUsuario) {

        usuarioService.findById(idUsuario); // lanza excepción si no existe

        return feedbackRepository
                .findByUsuarioRecibeIdAndVisibleTrueAndEstadoFeedback(
                        idUsuario, EstadoFeedback.VALORADO);
    }


    // =========================================================================
    // 4. DEJAR FEEDBACK (VALORAR)
    //    El usuario rellena la calificación y descripción de un feedback
    //    que debe estar en estado PENDIENTE.
    // =========================================================================
    public Feedback valorar(int idUsuarioPone, int idUsuarioRecibe, Feedback datos) {

        if (datos.getId() != 0) {
            throw new FeedbackException("No se puede introducir el ID manualmente.");
        }

        if (datos.getEstadoFeedback() != null) {
            throw new FeedbackException("No se puede introducir el estado manualmente.");
        }

        if (!datos.isVisible()) {
            throw new FeedbackException("No se puede modificar el campo visible.");
        }

        // Validamos que ambos usuarios existen
        usuarioService.findById(idUsuarioPone);
        usuarioService.findById(idUsuarioRecibe);

        if (idUsuarioPone == idUsuarioRecibe) {
            throw new FeedbackException("No puedes valorarte a ti mismo.");
        }

        Feedback feedback = feedbackRepository
                .findByUsuarioPoneIdAndUsuarioRecibeId(idUsuarioPone, idUsuarioRecibe)
                .orElseThrow(() ->
                        new FeedbackException("El feedback no existe."));

        if (feedback.getEstadoFeedback() != EstadoFeedback.PENDIENTE) {
            throw new FeedbackException("El feedback no está disponible para valorar.");
        }

        feedback.setCalificacion(datos.getCalificacion());
        feedback.setDescripcion(datos.getDescripcion());
        feedback.setFecha(LocalDate.now());
        feedback.setEstadoFeedback(EstadoFeedback.VALORADO);

        return feedbackRepository.save(feedback);
    }


    // =========================================================================
    // 5. MEDIA DE CALIFICACIONES (solo VALORADO + visible)
    // =========================================================================
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


    // =========================================================================
    // 6. OCULTAR / MOSTRAR FEEDBACK (toggle)
    // =========================================================================
    public Feedback toggleVisible(int idFeedback) {

        Feedback feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() ->
                        new FeedbackNotFoundException("El feedback no existe."));

        feedback.setVisible(!feedback.isVisible());

        return feedbackRepository.save(feedback);
    }


    // =========================================================================
    // MÉTODO INTERNO — llamado desde AlquilerService al aceptar una solicitud
    // Crea un feedback en estado NO_DISPONIBLE entre dos usuarios,
    // solo si no existe ya uno entre ellos en ese sentido.
    // =========================================================================
    public void crearSiNoExiste(Usuario usuarioPone, Usuario usuarioRecibe) {

        if (feedbackRepository.existsByUsuarioPoneIdAndUsuarioRecibeId(
                usuarioPone.getId(), usuarioRecibe.getId())) {
            return; // ya existe, no hacemos nada
        }

        Feedback feedback = new Feedback();
        feedback.setUsuarioPone(usuarioPone);
        feedback.setUsuarioRecibe(usuarioRecibe);
        feedback.setCalificacion(1); // valor neutro por defecto
        feedback.setEstadoFeedback(EstadoFeedback.NO_DISPONIBLE);
        feedback.setVisible(true);
        feedback.setFecha(null);

        feedbackRepository.save(feedback);
    }


    // =========================================================================
    // MÉTODO INTERNO — llamado desde AlquilerService al salir del piso
    // Pasa los feedbacks en estado NO_DISPONIBLE a PENDIENTE entre dos usuarios,
    // para que puedan valorarse al terminar la convivencia.
    // =========================================================================
    public void activarFeedbacks(int idUsuarioPone, int idUsuarioRecibe) {

        List<Feedback> feedbacks =
                feedbackRepository.findByUsuarioPoneIdAndUsuarioRecibeIdAndEstadoFeedback(
                        idUsuarioPone, idUsuarioRecibe, EstadoFeedback.NO_DISPONIBLE);

        feedbacks.forEach(f -> f.setEstadoFeedback(EstadoFeedback.PENDIENTE));
        feedbackRepository.saveAll(feedbacks);
    }

}
