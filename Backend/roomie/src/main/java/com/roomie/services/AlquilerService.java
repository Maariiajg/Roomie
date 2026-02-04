package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;
import com.roomie.persistence.repositories.AlquilerRepository;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.alquiler.AlquilerException;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.usuario.UsuarioException;

@Service
public class AlquilerService {

    @Autowired
    private AlquilerRepository alquilerRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PisoRepository pisoRepository;

    /* =====================================================
       1. SOLICITAR ALQUILER
       ===================================================== */
    public Alquiler solicitar(int idUsuario, int idPiso) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioException("El usuario no existe"));

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoException("El piso no existe"));

        // Regla del enunciado:
        // un usuario solo puede vivir en un piso
        if (alquilerRepository.existsByUsuarioIdAndEstadoSolicitud(
                idUsuario, AlquilerEstadoSolicitud.ACEPTADA)) {

            throw new AlquilerException(
                    "Ya estás viviendo en un piso");
        }

        Alquiler alquiler = new Alquiler();
        alquiler.setId(0);
        alquiler.setUsuario(usuario);
        alquiler.setPiso(piso);
        alquiler.setFInicio(LocalDate.now());
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.PENDIENTE);
        alquiler.setFavorito(false);

        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       2. VER SOLICITUDES DE UN PISO (DUEÑO)
       ===================================================== */
    public List<Alquiler> solicitudesPendientes(
            int idPiso, int idDueno) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoException("El piso no existe"));

        if (piso.getUsuarioDueno().getId() != idDueno) {
            throw new AlquilerException(
                    "Solo el dueño puede ver las solicitudes");
        }

        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso, AlquilerEstadoSolicitud.PENDIENTE);
    }

    /* =====================================================
       3. ACEPTAR / RECHAZAR SOLICITUD
       ===================================================== */
    public Alquiler aceptarORechazar(
            int idAlquiler, int idDueno, boolean aceptar) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerException("La solicitud no existe"));

        Piso piso = alquiler.getPiso();

        if (piso.getUsuarioDueno().getId() != idDueno) {
            throw new AlquilerException(
                    "No eres el dueño del piso");
        }

        if (alquiler.getEstadoSolicitud()
                != AlquilerEstadoSolicitud.PENDIENTE) {

            throw new AlquilerException(
                    "La solicitud ya ha sido resuelta");
        }

        if (aceptar) {
            // Capacidad del piso
            if (piso.getNumOcupantesActual()
                    >= piso.getNumTotalHabitaciones()) {

                throw new AlquilerException(
                        "El piso está completo");
            }

            alquiler.setEstadoSolicitud(
                    AlquilerEstadoSolicitud.ACEPTADA);

            piso.setNumOcupantesActual(
                    piso.getNumOcupantesActual() + 1);

            pisoRepository.save(piso);

        } else {
            alquiler.setEstadoSolicitud(
                    AlquilerEstadoSolicitud.RECHAZADA);
        }

        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       4. SALIR DEL PISO
       ===================================================== */
    public void salir(int idAlquiler, int idUsuario) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerException("El alquiler no existe"));

        if (alquiler.getUsuario().getId() != idUsuario) {
            throw new AlquilerException(
                    "No es tu alquiler");
        }

        if (alquiler.getEstadoSolicitud()
                != AlquilerEstadoSolicitud.ACEPTADA) {

            throw new AlquilerException(
                    "No estás viviendo en ese piso");
        }

        alquiler.setEstadoSolicitud(
                AlquilerEstadoSolicitud.CANCELADA);

        alquiler.setFFin(LocalDate.now());

        Piso piso = alquiler.getPiso();
        piso.setNumOcupantesActual(
                piso.getNumOcupantesActual() - 1);

        pisoRepository.save(piso);
        alquilerRepository.save(alquiler);
    }

    /* =====================================================
       5. MARCAR / DESMARCAR FAVORITO
       ===================================================== */
    public Alquiler toggleFavorito(int idAlquiler) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerException("El alquiler no existe"));

        alquiler.setFavorito(!alquiler.isFavorito());
        return alquilerRepository.save(alquiler);
    }
}

