package com.roomie.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomie.persistence.entities.Feedback;
import com.roomie.services.FeedbackService;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

	@Autowired
    private FeedbackService feedbackService;

    /* =========================
       GET /feedback/{id}
       ========================= */
    @GetMapping("/{idFeedback}")
    public ResponseEntity<Feedback> findById(
            @PathVariable int idFeedback) {

        return ResponseEntity.ok(
                feedbackService.findById(idFeedback)
        );
    }

    /* =========================
       GET /feedback/{id}/visible
       ========================= */
    @GetMapping("/{idFeedback}/visible")
    public ResponseEntity<Feedback> findVisibleById(
            @PathVariable int idFeedback) {

        return ResponseEntity.ok(
                feedbackService.findVisibleById(idFeedback)
        );
    }

    /* =========================
       GET /feedback/usuario/{id}
       ========================= */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Feedback>> feedbacksVisiblesDeUsuario(
            @PathVariable int idUsuario) {

        return ResponseEntity.ok(
                feedbackService.feedbacksVisiblesDeUsuario(idUsuario)
        );
    }

    /* =========================
       POST /feedback/{idPone}/{idRecibe}
       ========================= */
    @PostMapping("/{idUsuarioPone}/{idUsuarioRecibe}")
    public ResponseEntity<Feedback> valorar(
            @PathVariable int idUsuarioPone,
            @PathVariable int idUsuarioRecibe,
            @RequestBody Feedback datos) {

        return ResponseEntity.ok(
                feedbackService.valorar(
                        idUsuarioPone,
                        idUsuarioRecibe,
                        datos
                )
        );
    }

    /* =========================
       GET /feedback/media/{idUsuario}
       ========================= */
    @GetMapping("/media/{idUsuario}")
    public ResponseEntity<Double> mediaCalificaciones(
            @PathVariable int idUsuario) {

        return ResponseEntity.ok(
                feedbackService.mediaCalificaciones(idUsuario)
        );
    }

    /* =========================
       PUT /feedback/{id}/toggle
       ========================= */
    @PutMapping("/{idFeedback}/toggle")
    public ResponseEntity<Feedback> toggleVisible(
            @PathVariable int idFeedback) {

        return ResponseEntity.ok(
                feedbackService.toggleVisible(idFeedback)
        );
    }
}
