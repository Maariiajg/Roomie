package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Feedback;
import com.roomie.services.FeedbackService;
import com.roomie.services.exceptions.feedback.FeedbackException;
import com.roomie.services.exceptions.feedback.FeedbackNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;
    
    /*================================
     * findById
     */
    
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> obtenerFeedback(@PathVariable int id) {

        Feedback feedback = feedbackService.findById(id);
        return ResponseEntity.ok(feedback);
    }
    
    /* =========================
    VER FEEDBACKS VISIBLES DE USUARIO
    ========================= */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Feedback>> obtenerFeedbackRecibido(
            @PathVariable int idUsuario) {

        List<Feedback> lista = feedbackService.feedbacksVisiblesDeUsuario(idUsuario);
        return ResponseEntity.ok(lista);
    }

    /* =========================
       DEJAR FEEDBACK
       ========================= */
    @PostMapping
    public ResponseEntity<?> dejarFeedback(
            @RequestParam int idUsuarioPone,
            @RequestParam int idUsuarioRecibe,
            @RequestBody Feedback feedback) {

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(feedbackService.dejarFeedback(
                            idUsuarioPone, idUsuarioRecibe, feedback));
        } catch (FeedbackException | UsuarioNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    

    /* =========================
       MEDIA DE CALIFICACIONES
       ========================= */
    @GetMapping("/usuario/{idUsuario}/media")
    public ResponseEntity<Double> media(@PathVariable int idUsuario) {
        return ResponseEntity.ok(feedbackService.mediaCalificaciones(idUsuario));
    }

    /* =========================
       OCULTAR / MOSTRAR FEEDBACK (ADMIN)
       ========================= */
    @PutMapping("/{idFeedback}/visible")
    public ResponseEntity<?> toggleVisible(
            @PathVariable int idFeedback,
            @RequestBody Feedback feedback) {

        try {
            return ResponseEntity.ok(
                    feedbackService.toggleVisible(idFeedback, feedback));
        } catch (FeedbackNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (FeedbackException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }
}
