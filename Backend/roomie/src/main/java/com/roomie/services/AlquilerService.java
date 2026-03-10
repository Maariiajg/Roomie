package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;
import com.roomie.persistence.repositories.AlquilerRepository;
import com.roomie.services.exceptions.alquiler.AlquilerException;
import com.roomie.services.exceptions.alquiler.AlquilerNotFoundException;
import com.roomie.services.exceptions.piso.PisoException;

@Service
public class AlquilerService {

    // ✅ Único repository propio
    @Autowired
    private AlquilerRepository alquilerRepository;

    // ✅ Servicios ajenos en lugar de sus repositories
    @Autowired
    private UsuarioService usuarioService;

    // @Lazy rompe la dependencia circular AlquilerService <-> PisoService
    @Autowired
    @Lazy
    private PisoService pisoService;

    @Autowired
    private FeedbackService feedbackService;


    // =========================================================================
    // 1. FIND ALL — ver todos los alquileres (uso interno / admin)
    // =========================================================================
    public List<Alquiler> findAll() {
        return this.alquilerRepository.findAll();
    }


    // =========================================================================
    // 2. FIND BY ID
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
    //    Todos los alquileres del usuario sin filtrar por estado.
    // =========================================================================
    public List<Alquiler> historialDeUsuario(int idUsuario) {

        usuarioService.findById(idUsuario); // lanza excepción si no existe

        return alquilerRepository.findByUsuarioId(idUsuario);
    }


    // =========================================================================
    // 4. ALQUILER ACTUAL DE UN USUARIO (estado ACEPTADA)
    // =========================================================================
    public Alquiler alquilerActual(int idUsuario) {

        usuarioService.findById(idUsuario); // lanza excepción si no existe

        List<Alquiler> aceptados = alquilerRepository
                .findByUsuarioIdAndEstadoSolicitud(
                        idUsuario, AlquilerEstadoSolicitud.ACEPTADA);

        if (aceptados.isEmpty()) {
            throw new AlquilerNotFoundException(
                    "El usuario no vive actualmente en ningún piso.");
        }

        return aceptados.get(0); // por regla de negocio solo puede haber uno
    }


    // =========================================================================
    // 5. VER SOLICITUDES PENDIENTES DE UN PISO
    // =========================================================================
    public List<Alquiler> solicitudesPendientes(int idPiso) {

        pisoService.findById(idPiso); // lanza excepción si no existe

        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso, AlquilerEstadoSolicitud.PENDIENTE);
    }


    // =========================================================================
    // 6. ENVIAR SOLICITUD A UN PISO
    // =========================================================================
    public Alquiler enviarSolicitud(int idUsuario, int idPiso, LocalDate fInicio) {

        Usuario usuario = usuarioService.findById(idUsuario);
        Piso piso       = pisoService.findById(idPiso);

        if (fInicio == null) {
            throw new AlquilerException("Debes indicar la fecha de inicio.");
        }

        if (fInicio.isBefore(LocalDate.now())) {
            throw new AlquilerException(
                    "La fecha de inicio no puede ser anterior a hoy.");
        }

        if (alquilerRepository.existsByUsuarioIdAndEstadoSolicitud(
                idUsuario, AlquilerEstadoSolicitud.ACEPTADA)) {
            throw new AlquilerException("Ya estás viviendo en un piso.");
        }

        if (alquilerRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new AlquilerException("Ya has enviado una solicitud a este piso.");
        }

        Alquiler alquiler = new Alquiler();
        alquiler.setId(0);
        alquiler.setUsuario(usuario);
        alquiler.setPiso(piso);
        alquiler.setFsolicitud(LocalDate.now());
        alquiler.setFInicio(fInicio);
        alquiler.setFFin(null);
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.PENDIENTE);

        return alquilerRepository.save(alquiler);
    }


    // =========================================================================
    // 7. CANCELAR UNA SOLICITUD
    //    Solo el propio usuario puede cancelar su solicitud PENDIENTE.
    // =========================================================================
    public Alquiler cancelarSolicitud(int idAlquiler, int idUsuario) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerNotFoundException(
                                "El alquiler con ID " + idAlquiler + " no existe."));

        if (alquiler.getUsuario().getId() != idUsuario) {
            throw new AlquilerException(
                    "No puedes cancelar una solicitud que no es tuya.");
        }

        if (alquiler.getEstadoSolicitud() != AlquilerEstadoSolicitud.PENDIENTE) {
            throw new AlquilerException(
                    "Solo puedes cancelar solicitudes en estado PENDIENTE. " +
                    "Estado actual: " + alquiler.getEstadoSolicitud());
        }

        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA);

        return alquilerRepository.save(alquiler);
    }


    // =========================================================================
    // 8. ACEPTAR O RECHAZAR UNA SOLICITUD (solo el owner)
    // =========================================================================
    public Alquiler resolverSolicitud(int idAlquiler, int idDueno, boolean aceptar) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() ->
                        new AlquilerNotFoundException("La solicitud no existe."));

        Piso piso = alquiler.getPiso();

        if (piso.getOwner().getId() != idDueno) {
            throw new AlquilerException("No eres el dueño del piso.");
        }

        if (alquiler.getEstadoSolicitud() != AlquilerEstadoSolicitud.PENDIENTE) {
            throw new AlquilerException("La solicitud ya fue resuelta.");
        }

        if (aceptar) {

            if (piso.getNumOcupantesActual() >= piso.getNumTotalHabitaciones()) {
                throw new AlquilerException("El piso está completo.");
            }

            Usuario nuevoUsuario = alquiler.getUsuario();

            // Compañeros que ya viven en el piso
            List<Alquiler> alquileresAceptados =
                    alquilerRepository.findByPisoIdAndEstadoSolicitud(
                            piso.getId(), AlquilerEstadoSolicitud.ACEPTADA);

            for (Alquiler a : alquileresAceptados) {
                Usuario companero = a.getUsuario();
                // FeedbackService se encarga de crear el feedback si no existe
                feedbackService.crearSiNoExiste(companero, nuevoUsuario);
                feedbackService.crearSiNoExiste(nuevoUsuario, companero);
            }

            alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.ACEPTADA);

            // Incrementamos ocupantes a través del PisoService
            pisoService.incrementarOcupantes(piso.getId());

            // Cancelamos las demás solicitudes PENDIENTES del usuario
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
            alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.RECHAZADA);
        }

        return alquilerRepository.save(alquiler);
    }


    // =========================================================================
    // 9. SALIR DEL PISO (voluntario o expulsión por el owner)
    // =========================================================================
    public void salirDelPiso(
            int idPiso,
            int idUsuario,
            LocalDate fechaSalida,
            boolean forzadoPorOwner,
            int idOwner) {

        Piso piso = pisoService.findById(idPiso);
        usuarioService.findById(idUsuario); // valida que existe

        Alquiler alquiler = alquilerRepository
                .findByPisoIdAndUsuarioIdAndEstadoSolicitud(
                        idPiso, idUsuario, AlquilerEstadoSolicitud.ACEPTADA)
                .orElseThrow(() ->
                        new AlquilerException(
                                "El usuario no vive actualmente en este piso."));

        if (forzadoPorOwner) {

            if (piso.getOwner().getId() != idOwner) {
                throw new PisoException("Solo el owner puede expulsar usuarios.");
            }

            if (idUsuario == idOwner) {
                throw new PisoException(
                        "El owner no puede expulsarse a sí mismo. " +
                        "Primero cede el rol de owner a otro usuario.");
            }

            fechaSalida = LocalDate.now();

        } else {

            if (fechaSalida == null) {
                fechaSalida = LocalDate.now();
            }

            if (fechaSalida.isBefore(LocalDate.now())) {
                throw new AlquilerException(
                        "La fecha de salida no puede ser anterior a hoy.");
            }
        }

        // Activamos feedbacks pendientes con cada compañero
        List<Alquiler> companeros = alquilerRepository
                .findByPisoIdAndEstadoSolicitud(idPiso, AlquilerEstadoSolicitud.ACEPTADA);

        for (Alquiler a : companeros) {
            Usuario companero = a.getUsuario();
            if (companero.getId() == idUsuario) continue;

            // FeedbackService activa los feedbacks NO_DISPONIBLE -> PENDIENTE
            feedbackService.activarFeedbacks(companero.getId(), idUsuario);
            feedbackService.activarFeedbacks(idUsuario, companero.getId());
        }

        alquiler.setFFin(fechaSalida);
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.FINALIZADA);
        alquilerRepository.save(alquiler);

        // Decrementamos ocupantes a través del PisoService
        pisoService.decrementarOcupantes(piso.getId());
    }


    // =========================================================================
    // MÉTODOS INTERNOS — llamados desde PisoService
    // =========================================================================

    /** Crea el alquiler automático para el owner al publicar un piso */
    public void crearAlquilerOwner(Piso piso, Usuario owner) {

        Alquiler alquilerOwner = new Alquiler();
        alquilerOwner.setId(0);
        alquilerOwner.setPiso(piso);
        alquilerOwner.setUsuario(owner);
        alquilerOwner.setFsolicitud(LocalDate.now());
        alquilerOwner.setFInicio(LocalDate.now());
        alquilerOwner.setFFin(null);
        alquilerOwner.setEstadoSolicitud(AlquilerEstadoSolicitud.ACEPTADA);

        alquilerRepository.save(alquilerOwner);
    }

    /** Elimina todos los alquileres de un piso (usado al borrar el piso) */
    public void eliminarAlquileresDePiso(int idPiso) {
        List<Alquiler> alquileres = alquilerRepository.findByPisoId(idPiso);
        alquilerRepository.deleteAll(alquileres);
    }

    /** Comprueba si un usuario tiene algún alquiler en un piso concreto */
    public boolean existeAlquilerEnPiso(int idUsuario, int idPiso) {
        return alquilerRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso);
    }

    /** Devuelve los alquileres ACEPTADOS de un piso (usuarios que viven en él) */
    public List<Alquiler> alquileresAceptadosDePiso(int idPiso) {
        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso, AlquilerEstadoSolicitud.ACEPTADA);
    }

}
