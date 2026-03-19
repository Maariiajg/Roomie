package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Feedback;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.EstadoFeedback;
import com.roomie.persistence.repositories.FeedbackRepository;
import com.roomie.services.dto.feedback.FeedbackDTO;
import com.roomie.services.exceptions.feedback.FeedbackException;
import com.roomie.services.exceptions.feedback.FeedbackNotFoundException;
import com.roomie.services.mapper.FeedbackMapper;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UsuarioService usuarioService;

    // =========================================================================
    // 1. FIND BY ID (sin filtrar visibilidad) — devuelve DTO
    // =========================================================================
    public FeedbackDTO findById(int idFeedback) {
        Feedback feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new FeedbackNotFoundException(
                        "El feedback no existe."));
        return FeedbackMapper.toDTO(feedback);
    }

    // =========================================================================
    // 2. FIND VISIBLE BY ID — devuelve DTO
    // =========================================================================
    public FeedbackDTO findVisibleById(int idFeedback) {
        Feedback feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new FeedbackNotFoundException(
                        "El feedback no existe."));

        if (!feedback.isVisible() ||
                feedback.getEstadoFeedback() != EstadoFeedback.VALORADO) {
            throw new FeedbackException("El feedback no es visible.");
        }

        return FeedbackMapper.toDTO(feedback);
    }

    // =========================================================================
    // 3. VER FEEDBACKS VISIBLES DE UN USUARIO — devuelve lista de DTOs
    // =========================================================================
    public List<FeedbackDTO> feedbacksVisiblesDeUsuario(int idUsuario) {
        usuarioService.findById(idUsuario);
        return FeedbackMapper.toDTOList(
                feedbackRepository.findByUsuarioRecibeIdAndVisibleTrueAndEstadoFeedback(
                        idUsuario, EstadoFeedback.VALORADO));
    }
    
 // Solo para pruebas/admin — devuelve todos los feedbacks sin filtrar visibilidad
    public List<FeedbackDTO> todosLosFeedbacksDeUsuario(int idUsuario) {
        usuarioService.findById(idUsuario);
        return FeedbackMapper.toDTOList(
                feedbackRepository.findByUsuarioRecibeId(idUsuario));
    }

    // =========================================================================
    // 4. DEJAR FEEDBACK (VALORAR) — recibe solo calificacion y descripcion
    // =========================================================================
    public FeedbackDTO valorar(int idUsuarioPone, int idUsuarioRecibe, FeedbackDTO datos) {
        /*if (datos.getId() != 0) {
            throw new FeedbackException("No se puede introducir el ID manualmente.");
        }

        if (datos.getEstadoFeedback() != null) {
            throw new FeedbackException("No se puede introducir el estado manualmente.");
        }

        if (!datos.isVisible()) {
            throw new FeedbackException("No se puede modificar el campo visible.");
        }*/

        if (datos.getCalificacion() < 1 || datos.getCalificacion() > 5) {
            throw new FeedbackException(
                    "La calificación debe estar entre 1 y 5.");
        }

        usuarioService.findById(idUsuarioPone);
        usuarioService.findById(idUsuarioRecibe);

        if (idUsuarioPone == idUsuarioRecibe) {
            throw new FeedbackException("No puedes valorarte a ti mismo.");
        }

        Feedback feedback = feedbackRepository
                .findByUsuarioPoneIdAndUsuarioRecibeId(idUsuarioPone, idUsuarioRecibe)
                .orElseThrow(() -> new FeedbackException("El feedback no existe."));

        if (feedback.getEstadoFeedback() != EstadoFeedback.PENDIENTE) {
            throw new FeedbackException("El feedback no está disponible para valorar.");
        }

        feedback.setCalificacion(datos.getCalificacion());
        feedback.setDescripcion(datos.getDescripcion());
        feedback.setFecha(LocalDate.now());
        feedback.setEstadoFeedback(EstadoFeedback.VALORADO);

        return FeedbackMapper.toDTO(feedbackRepository.save(feedback));
    }

    // =========================================================================
    // 5. MEDIA DE CALIFICACIONES (solo VALORADO + visible)
    // =========================================================================
    public double mediaCalificaciones(int idUsuario) {
        List<FeedbackDTO> feedbacks = feedbacksVisiblesDeUsuario(idUsuario);

        if (feedbacks.isEmpty()) return 0;

        return feedbacks.stream()
                .mapToInt(FeedbackDTO::getCalificacion)
                .average()
                .orElse(0);
    }

    // =========================================================================
    // 6. OCULTAR / MOSTRAR FEEDBACK (toggle) — devuelve DTO
    // =========================================================================
    public FeedbackDTO toggleVisible(int idFeedback) {
        Feedback feedback = feedbackRepository.findById(idFeedback)
                .orElseThrow(() -> new FeedbackNotFoundException(
                        "El feedback no existe."));

        feedback.setVisible(!feedback.isVisible());
        return FeedbackMapper.toDTO(feedbackRepository.save(feedback));
    }

    // =========================================================================
    // MÉTODOS INTERNOS  — llamado desde AlquilerService al aceptar una solicitud
    // Crea un feedback en estado NO_DISPONIBLE entre dos usuarios,
    // solo si no existe ya uno entre ellos en ese sentido.
    // =========================================================================

    public void crearSiNoExiste(Usuario usuarioPone, Usuario usuarioRecibe) {
        if (feedbackRepository.existsByUsuarioPoneIdAndUsuarioRecibeId(
                usuarioPone.getId(), usuarioRecibe.getId())) {
            return;
        }

        Feedback feedback = new Feedback();
        feedback.setUsuarioPone(usuarioPone);
        feedback.setUsuarioRecibe(usuarioRecibe);
        feedback.setCalificacion(1);
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
