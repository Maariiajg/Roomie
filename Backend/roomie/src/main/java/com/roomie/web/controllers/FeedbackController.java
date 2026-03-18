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

import com.roomie.services.FeedbackService;
import com.roomie.services.dto.feedback.FeedbackDTO;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {
 
    @Autowired
    private FeedbackService feedbackService;
 
    /* =========================
       FIND BY ID
       ========================= */
    @GetMapping("/{idFeedback}")
    public ResponseEntity<FeedbackDTO> findById(
            @PathVariable int idFeedback) {
 
        return ResponseEntity.ok(
                feedbackService.findById(idFeedback)
        );
    }
 
    /* =========================
       FIND VISIBLE BY ID
       ========================= */
    @GetMapping("/{idFeedback}/visible")
    public ResponseEntity<FeedbackDTO> findVisibleById(
            @PathVariable int idFeedback) {
 
        return ResponseEntity.ok(
                feedbackService.findVisibleById(idFeedback)
        );
    }
 
    /* =========================
       FEEDBACKS VISIBLES DE UN USUARIO
       ========================= */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<FeedbackDTO>> feedbacksVisiblesDeUsuario(
            @PathVariable int idUsuario) {
 
        return ResponseEntity.ok(
                feedbackService.feedbacksVisiblesDeUsuario(idUsuario)
        );
    }
 
    /* =========================
       VALORAR (dejar feedback)
       ========================= */
    @PostMapping("/{idUsuarioPone}/{idUsuarioRecibe}")
    public ResponseEntity<FeedbackDTO> valorar(
            @PathVariable int idUsuarioPone,
            @PathVariable int idUsuarioRecibe,
            @RequestBody FeedbackDTO datos) {
 
        return ResponseEntity.ok(
                feedbackService.valorar(idUsuarioPone, idUsuarioRecibe, datos)
        );
    }
 
    /* =========================
       MEDIA DE CALIFICACIONES
       ========================= */
    @GetMapping("/media/{idUsuario}")
    public ResponseEntity<Double> mediaCalificaciones(
            @PathVariable int idUsuario) {
 
        return ResponseEntity.ok(
                feedbackService.mediaCalificaciones(idUsuario)
        );
    }
 
    /* =========================
       TOGGLE VISIBLE (administrador)
       ========================= */
    @PutMapping("/{idFeedback}/toggle")
    public ResponseEntity<FeedbackDTO> toggleVisible(
            @PathVariable int idFeedback) {
 
        return ResponseEntity.ok(
                feedbackService.toggleVisible(idFeedback)
        );
    }
}