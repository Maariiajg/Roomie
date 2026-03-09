package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.Feedback;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;
import com.roomie.persistence.entities.enums.EstadoFeedback;
import com.roomie.persistence.repositories.AlquilerRepository;
import com.roomie.persistence.repositories.FeedbackRepository;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.alquiler.AlquilerException;
import com.roomie.services.exceptions.alquiler.AlquilerNotFoundException;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@Service
public class AlquilerService {

    @Autowired
    private AlquilerRepository alquilerRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PisoRepository pisoRepository;
    
    @Autowired
    private FeedbackRepository feedbackRepository;

    
    
 



    // =========================================================================
    // 1. FIND ALL — ver todos los alquileres (uso interno / admin)
    // =========================================================================
    public List<Alquiler> findAll() {
        return this.alquilerRepository.findAll();
    }


    // =========================================================================
    // 2. FIND BY ID — buscar un alquiler concreto por su ID
    // =========================================================================
    public Alquiler findById(int idAlquiler) {

        if (!this.alquilerRepository.existsById(idAlquiler)) {
            throw new AlquilerNotFoundException(
                    "El alquiler con id " + idAlquiler + " no existe.");
        }

        return this.alquilerRepository.findById(idAlquiler).get();
    }


    // =========================================================================
    // 3. HISTORIAL DE ALQUILERES DE UN USUARIO
    //    Devuelve todos los alquileres del usuario independientemente del estado,
    //    sirviendo como historial completo (PENDIENTE, ACEPTADA, RECHAZADA, etc.)
    // =========================================================================
    public List<Alquiler> historialDeUsuario(int idUsuario) {

        // Verificamos que el usuario existe
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new UsuarioNotFoundException(
                    "El usuario con ID " + idUsuario + " no existe.");
        }

        return alquilerRepository.findByUsuarioId(idUsuario);
    }


    // =========================================================================
    // 4. ALQUILER ACTUAL DE UN USUARIO
    //    Devuelve el único alquiler con estado ACEPTADA del usuario,
    //    es decir, el piso en el que vive actualmente.
    // =========================================================================
    public Alquiler alquilerActual(int idUsuario) {

        // Verificamos que el usuario existe
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new UsuarioNotFoundException(
                    "El usuario con ID " + idUsuario + " no existe.");
        }

        // Buscamos sus alquileres aceptados; debería haber como máximo uno
        List<Alquiler> aceptados = alquilerRepository
                .findByUsuarioIdAndEstadoSolicitud(idUsuario, AlquilerEstadoSolicitud.ACEPTADA);

        if (aceptados.isEmpty()) {
            throw new AlquilerNotFoundException(
                    "El usuario no vive actualmente en ningún piso.");
        }

        // Devolvemos el primero (por regla de negocio solo puede haber uno)
        return aceptados.get(0);
    }


    // =========================================================================
    // 5. VER SOLICITUDES PENDIENTES DE UN PISO
    //    Solo devuelve las solicitudes en estado PENDIENTE del piso indicado.
    //    Cualquier usuario del piso puede verlas, pero solo el owner puede
    //    aceptarlas o rechazarlas (eso se controla en resolverSolicitud).
    // =========================================================================
    public List<Alquiler> solicitudesPendientes(int idPiso) {

        // Verificamos que el piso existe
        if (!pisoRepository.existsById(idPiso)) {
            throw new PisoNotFoundException("El piso no existe.");
        }

        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso, AlquilerEstadoSolicitud.PENDIENTE);
    }


    // =========================================================================
    // 6. ENVIAR SOLICITUD A UN PISO
    //    El usuario elige el piso y la fecha de inicio deseada.
    //    Validaciones: no puede ya vivir en un piso, ni haber solicitado
    //    ese mismo piso anteriormente.
    // =========================================================================
    public Alquiler enviarSolicitud(int idUsuario, int idPiso, LocalDate fInicio) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("El usuario no existe."));

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        // La fecha de inicio es obligatoria
        if (fInicio == null) {
            throw new AlquilerException("Debes indicar la fecha de inicio.");
        }

        // La fecha de inicio no puede ser anterior a hoy
        if (fInicio.isBefore(LocalDate.now())) {
            throw new AlquilerException(
                    "La fecha de inicio no puede ser anterior a hoy.");
        }

        // El usuario no puede solicitar un piso si ya vive en otro
        if (alquilerRepository.existsByUsuarioIdAndEstadoSolicitud(
                idUsuario, AlquilerEstadoSolicitud.ACEPTADA)) {
            throw new AlquilerException("Ya estás viviendo en un piso.");
        }

        // El usuario no puede enviar dos solicitudes al mismo piso
        if (alquilerRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new AlquilerException("Ya has enviado una solicitud a este piso.");
        }

        // Construimos el alquiler
        Alquiler alquiler = new Alquiler();
        alquiler.setId(0);
        alquiler.setUsuario(usuario);
        alquiler.setPiso(piso);
        alquiler.setFsolicitud(LocalDate.now());
        alquiler.setFInicio(fInicio);
        alquiler.setFFin(null);                                      // sin fecha fin por defecto
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.PENDIENTE);

        return alquilerRepository.save(alquiler);
    }


    // =========================================================================
    // 7. CANCELAR UNA SOLICITUD
    //    Solo el propio usuario puede cancelar su solicitud.
    //    Solo se pueden cancelar solicitudes en estado PENDIENTE.
    // =========================================================================
    public Alquiler cancelarSolicitud(int idAlquiler, int idUsuario) {

        // Comprobamos que el alquiler existe
        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerNotFoundException(
                                "El alquiler con ID " + idAlquiler + " no existe."));

        // Solo el dueño de la solicitud puede cancelarla
        if (alquiler.getUsuario().getId() != idUsuario) {
            throw new AlquilerException(
                    "No puedes cancelar una solicitud que no es tuya.");
        }

        // Solo se pueden cancelar solicitudes PENDIENTES
        if (alquiler.getEstadoSolicitud() != AlquilerEstadoSolicitud.PENDIENTE) {
            throw new AlquilerException(
                    "Solo puedes cancelar solicitudes que estén en estado PENDIENTE. " +
                    "Estado actual: " + alquiler.getEstadoSolicitud());
        }

        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA);

        return alquilerRepository.save(alquiler);
    }


    // =========================================================================
    // 8. ACEPTAR O RECHAZAR UNA SOLICITUD (solo el owner del piso)
    //    Si se acepta:
    //      - Se crean feedbacks en estado NO_DISPONIBLE entre el nuevo inquilino
    //        y cada compañero ya aceptado en el piso.
    //      - Se incrementa el contador de ocupantes del piso.
    //      - Las demás solicitudes PENDIENTES del mismo usuario se cancelan
    //        automáticamente (un usuario solo puede vivir en un piso a la vez).
    //    Si se rechaza: la solicitud pasa a RECHAZADA sin más efectos.
    // =========================================================================
    public Alquiler resolverSolicitud(int idAlquiler, int idDueno, boolean aceptar) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerNotFoundException("La solicitud no existe."));

        Piso piso = alquiler.getPiso();

        // Solo el owner del piso puede resolver solicitudes
        if (piso.getOwner().getId() != idDueno) {
            throw new AlquilerException("No eres el dueño del piso.");
        }

        // La solicitud debe estar en estado PENDIENTE para poder resolverse
        if (alquiler.getEstadoSolicitud() != AlquilerEstadoSolicitud.PENDIENTE) {
            throw new AlquilerException("La solicitud ya fue resuelta.");
        }

        if (aceptar) {

            // El piso no puede estar lleno
            if (piso.getNumOcupantesActual() >= piso.getNumTotalHabitaciones()) {
                throw new AlquilerException("El piso está completo.");
            }

            Usuario nuevoUsuario = alquiler.getUsuario();

            // Obtenemos los alquileres ACEPTADOS actuales del piso (compañeros ya presentes)
            List<Alquiler> alquileresAceptados =
                    alquilerRepository.findByPisoIdAndEstadoSolicitud(
                            piso.getId(), AlquilerEstadoSolicitud.ACEPTADA);

            // Creamos feedbacks bidireccionales entre el nuevo usuario y cada compañero
            for (Alquiler a : alquileresAceptados) {

                Usuario companero = a.getUsuario();

                // Feedback: compañero → nuevo usuario
                if (!feedbackRepository.existsByUsuarioPoneIdAndUsuarioRecibeId(
                        companero.getId(), nuevoUsuario.getId())) {

                    Feedback f1 = new Feedback();
                    f1.setUsuarioPone(companero);
                    f1.setUsuarioRecibe(nuevoUsuario);
                    f1.setCalificacion(1);           // valor neutro por defecto
                    f1.setEstadoFeedback(EstadoFeedback.NO_DISPONIBLE);
                    f1.setVisible(true);
                    f1.setFecha(null);
                    feedbackRepository.save(f1);
                }

                // Feedback: nuevo usuario → compañero
                if (!feedbackRepository.existsByUsuarioPoneIdAndUsuarioRecibeId(
                        nuevoUsuario.getId(), companero.getId())) {

                    Feedback f2 = new Feedback();
                    f2.setUsuarioPone(nuevoUsuario);
                    f2.setUsuarioRecibe(companero);
                    f2.setCalificacion(1);
                    f2.setEstadoFeedback(EstadoFeedback.NO_DISPONIBLE);
                    f2.setVisible(true);
                    f2.setFecha(null);
                    feedbackRepository.save(f2);
                }
            }

            // Aceptamos el alquiler y actualizamos el contador de ocupantes
            alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.ACEPTADA);
            piso.setNumOcupantesActual(piso.getNumOcupantesActual() + 1);
            pisoRepository.save(piso);

            // Cancelamos el resto de solicitudes PENDIENTES de este usuario
            // (no puede vivir en dos pisos a la vez)
            List<Alquiler> otrasSolicitudes =
                    alquilerRepository.findByUsuarioIdAndEstadoSolicitud(
                            nuevoUsuario.getId(), AlquilerEstadoSolicitud.PENDIENTE);

            otrasSolicitudes.forEach(a -> {
                if (a.getId() != alquiler.getId()) {
                    a.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA);
                    alquilerRepository.save(a);
                }
            });

        } else {
            // Rechazamos la solicitud
            alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.RECHAZADA);
        }

        return alquilerRepository.save(alquiler);
    }


    // =========================================================================
    // 9. SALIR DEL PISO
    //    Dos escenarios:
    //      a) Salida voluntaria: el propio usuario decide marcharse.
    //      b) Expulsión por el owner: el owner echa a un inquilino.
    //    En ambos casos:
    //      - El alquiler pasa a FINALIZADA.
    //      - Se descuenta un ocupante del piso.
    //      - Los feedbacks entre el usuario que sale y sus compañeros pasan
    //        de NO_DISPONIBLE a PENDIENTE para que puedan valorarse.
    // =========================================================================
    public void salirDelPiso(
            int idPiso,
            int idUsuario,
            LocalDate fechaSalida,
            boolean forzadoPorOwner,
            int idOwner) {

        // Verificamos que el piso existe
        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        // Verificamos que el usuario existe
        usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("El usuario no existe."));

        // Buscamos el alquiler ACEPTADO del usuario en ese piso
        Alquiler alquiler = alquilerRepository
                .findByPisoIdAndUsuarioIdAndEstadoSolicitud(
                        idPiso, idUsuario, AlquilerEstadoSolicitud.ACEPTADA)
                .orElseThrow(() ->
                        new AlquilerException("El usuario no vive actualmente en este piso."));

        if (forzadoPorOwner) {

            // Solo el owner real puede expulsar
            if (piso.getOwner().getId() != idOwner) {
                throw new PisoException("Solo el owner puede expulsar usuarios.");
            }

            // El owner no puede expulsarse a sí mismo
            if (idUsuario == idOwner) {
                throw new PisoException(
                        "El owner no puede expulsarse a sí mismo. " +
                        "Primero cede el rol de owner a otro usuario.");
            }

            // En expulsión la fecha de salida es siempre hoy
            fechaSalida = LocalDate.now();

        } else {

            // En salida voluntaria, si no se indica fecha se usa hoy
            if (fechaSalida == null) {
                fechaSalida = LocalDate.now();
            }

            // La fecha de salida no puede ser anterior a hoy
            if (fechaSalida.isBefore(LocalDate.now())) {
                throw new AlquilerException(
                        "La fecha de salida no puede ser anterior a hoy.");
            }
        }

        // -----------------------------------------------------------------------
        // Activamos los feedbacks entre el usuario que sale y sus compañeros
        // (pasamos de NO_DISPONIBLE a PENDIENTE en ambas direcciones)
        // -----------------------------------------------------------------------
        List<Alquiler> companeros = alquilerRepository
                .findByPisoIdAndEstadoSolicitud(idPiso, AlquilerEstadoSolicitud.ACEPTADA);

        for (Alquiler a : companeros) {

            Usuario companero = a.getUsuario();

            // No procesamos al propio usuario que sale
            if (companero.getId() == idUsuario) continue;

            // Feedback: compañero → usuario que sale
            List<Feedback> f1 = feedbackRepository
                    .findByUsuarioPoneIdAndUsuarioRecibeIdAndEstadoFeedback(
                            companero.getId(), idUsuario, EstadoFeedback.NO_DISPONIBLE);
            f1.forEach(f -> f.setEstadoFeedback(EstadoFeedback.PENDIENTE));
            feedbackRepository.saveAll(f1);

            // Feedback: usuario que sale → compañero
            List<Feedback> f2 = feedbackRepository
                    .findByUsuarioPoneIdAndUsuarioRecibeIdAndEstadoFeedback(
                            idUsuario, companero.getId(), EstadoFeedback.NO_DISPONIBLE);
            f2.forEach(f -> f.setEstadoFeedback(EstadoFeedback.PENDIENTE));
            feedbackRepository.saveAll(f2);
        }

        // Finalizamos el alquiler con la fecha de salida
        alquiler.setFFin(fechaSalida);
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.FINALIZADA);
        alquilerRepository.save(alquiler);

        // Decrementamos el contador de ocupantes del piso
        piso.setNumOcupantesActual(piso.getNumOcupantesActual() - 1);
        pisoRepository.save(piso);
    }
}