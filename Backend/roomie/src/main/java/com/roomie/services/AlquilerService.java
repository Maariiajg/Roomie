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
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.AlquilerRepository;
import com.roomie.services.dto.alquiler.AlquilerDTO;
import com.roomie.services.dto.alquiler.CompaneroDTO;
import com.roomie.services.exceptions.alquiler.AlquilerException;
import com.roomie.services.exceptions.alquiler.AlquilerNotFoundException;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.mapper.AlquilerMapper;

@Service
public class AlquilerService {
 
    // Único repository propio
    @Autowired
    private AlquilerRepository alquilerRepository;
 
    @Autowired
    private UsuarioService usuarioService;
 
    // @Lazy rompe la dependencia circular AlquilerService <-> PisoService
    @Autowired
    @Lazy
    private PisoService pisoService;
 
    @Autowired
    private FeedbackService feedbackService;
 
    // =========================================================================
    // HELPER — convierte Alquiler a AlquilerDTO usando UsuarioService
    // para obtener la calificacion media sin tocar UsuarioRepository
    // =========================================================================
    private AlquilerDTO toDTO(Alquiler alquiler) {
        Double media = usuarioService.getCalificacionMedia(
                alquiler.getUsuario().getId());
        return AlquilerMapper.toDTO(alquiler, media);
    }
 
    // =========================================================================
    // 1. FIND ALL
    // =========================================================================
    public List<AlquilerDTO> findAll() {
        return alquilerRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }
 
    // =========================================================================
    // 2. FIND BY ID
    // =========================================================================
    public AlquilerDTO findById(int idAlquiler) {
        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerNotFoundException(
                        "El alquiler con id " + idAlquiler + " no existe."));
        return toDTO(alquiler);
    }
 
    // =========================================================================
    // 3. HISTORIAL DE ALQUILERES DE UN USUARIO
    // =========================================================================
    public List<AlquilerDTO> historialDeUsuario(int idUsuario) {
        usuarioService.findById(idUsuario);
        return alquilerRepository.findByUsuarioId(idUsuario)
                .stream()
                .map(this::toDTO)
                .toList();
    }
 
    // =========================================================================
    // 4. ALQUILER ACTUAL DE UN USUARIO (estado ACEPTADA)
    // =========================================================================
    public AlquilerDTO alquilerActual(int idUsuario) {
        usuarioService.findById(idUsuario);
 
        List<Alquiler> aceptados = alquilerRepository
                .findByUsuarioIdAndEstadoSolicitud(
                        idUsuario, AlquilerEstadoSolicitud.ACEPTADA);
 
        if (aceptados.isEmpty()) {
            throw new AlquilerNotFoundException(
                    "El usuario no vive actualmente en ningún piso.");
        }
 
        return toDTO(aceptados.get(0));
    }
 
    // =========================================================================
    // 5. VER SOLICITUDES PENDIENTES DE UN PISO
    // =========================================================================
    public List<AlquilerDTO> solicitudesPendientes(int idPiso) {
        pisoService.findById(idPiso);
        return alquilerRepository
                .findByPisoIdAndEstadoSolicitud(idPiso, AlquilerEstadoSolicitud.PENDIENTE)
                .stream()
                .map(this::toDTO)
                .toList();
    }
 
    // =========================================================================
    // 6. ENVIAR SOLICITUD A UN PISO
    // =========================================================================
    public AlquilerDTO enviarSolicitud(int idUsuario, int idPiso, LocalDate fInicio) {
 
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
        //los owners no pueden solicitar un alquiler
        if (usuario.getRol() == Roles.OWNER) {
            throw new AlquilerException("Los owners no pueden solicitar alquiler en otro piso.");
        }
        //validación piso tiene plazas libres
        if (piso.getNumOcupantesActual() >= piso.getNumTotalHabitaciones()) {
            throw new AlquilerException("El piso no tiene plazas disponibles.");
        }
        
 
        Alquiler alquiler = new Alquiler();
        alquiler.setId(0);
        alquiler.setUsuario(usuario);
        alquiler.setPiso(piso);
        alquiler.setFsolicitud(LocalDate.now());
        alquiler.setFInicio(fInicio);
        alquiler.setFFin(null);
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.PENDIENTE);
 
        return toDTO(alquilerRepository.save(alquiler));
    }
 
    // =========================================================================
    // 7. CANCELAR UNA SOLICITUD
    // =========================================================================
    public AlquilerDTO cancelarSolicitud(int idAlquiler, int idUsuario) {
 
        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerNotFoundException(
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
        return toDTO(alquilerRepository.save(alquiler));
    }
 
    // =========================================================================
    // 8. ACEPTAR O RECHAZAR UNA SOLICITUD (solo el owner)
    // =========================================================================
    public AlquilerDTO resolverSolicitud(int idAlquiler, int idDueno, boolean aceptar) {
 
        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerNotFoundException(
                        "La solicitud no existe."));
 
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
 
            List<Alquiler> alquileresAceptados =
                    alquilerRepository.findByPisoIdAndEstadoSolicitud(
                            piso.getId(), AlquilerEstadoSolicitud.ACEPTADA);
 
            for (Alquiler a : alquileresAceptados) {
                Usuario companero = a.getUsuario();
                feedbackService.crearSiNoExiste(companero, nuevoUsuario);
                feedbackService.crearSiNoExiste(nuevoUsuario, companero);
            }
 
            alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.ACEPTADA);
            pisoService.incrementarOcupantes(piso.getId());
 
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
 
        return toDTO(alquilerRepository.save(alquiler));
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
        usuarioService.findById(idUsuario);
 
        Alquiler alquiler = alquilerRepository
                .findByPisoIdAndUsuarioIdAndEstadoSolicitud(
                        idPiso, idUsuario, AlquilerEstadoSolicitud.ACEPTADA)
                .orElseThrow(() -> new AlquilerException(
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
 
            if (piso.getOwner().getId() == idUsuario) {
                throw new PisoException(
                        "Eres el owner del piso. Debes ceder el rol de owner " +
                        "a otro usuario antes de abandonarlo.");
            }
            if (fechaSalida == null) {
                fechaSalida = LocalDate.now();
            }
            if (fechaSalida.isBefore(LocalDate.now())) {
                throw new AlquilerException(
                        "La fecha de salida no puede ser anterior a hoy.");
            }
        }
 
        List<Alquiler> companeros = alquilerRepository
                .findByPisoIdAndEstadoSolicitud(idPiso, AlquilerEstadoSolicitud.ACEPTADA);
 
        for (Alquiler a : companeros) {
            Usuario companero = a.getUsuario();
            if (companero.getId() == idUsuario) continue;
            feedbackService.activarFeedbacks(companero.getId(), idUsuario);
            feedbackService.activarFeedbacks(idUsuario, companero.getId());
        }
 
        alquiler.setFFin(fechaSalida);
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.FINALIZADA);
        alquilerRepository.save(alquiler);
 
        pisoService.decrementarOcupantes(piso.getId());
    }
 
    // =========================================================================
    // 10. COMPAÑEROS ACTUALES DE UN USUARIO
    // =========================================================================
    public List<CompaneroDTO> companerosActuales(int idUsuario) {
 
        usuarioService.findById(idUsuario);
 
        List<Alquiler> activos = alquilerRepository.findByUsuarioIdAndEstadoSolicitud(
                idUsuario, AlquilerEstadoSolicitud.ACEPTADA);
 
        if (activos.isEmpty()) {
            throw new AlquilerNotFoundException(
                    "El usuario no vive actualmente en ningún piso.");
        }
 
        int idPiso = activos.get(0).getPiso().getId();
 
        return alquilerRepository
                .findByPisoIdAndEstadoSolicitud(idPiso, AlquilerEstadoSolicitud.ACEPTADA)
                .stream()
                .map(Alquiler::getUsuario)
                .filter(u -> u.getId() != idUsuario)
                .map(u -> new CompaneroDTO(
                        u.getId(), u.getNombre(), u.getApellido1(), u.getApellido2()))
                .toList();
    }
 
    // =========================================================================
    // MÉTODOS INTERNOS — llamados desde PisoService
    // =========================================================================
 
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
 
    public boolean existeAlquilerEnPiso(int idUsuario, int idPiso) {
        return alquilerRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso);
    }
 
    public List<Alquiler> alquileresAceptadosDePiso(int idPiso) {
        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso, AlquilerEstadoSolicitud.ACEPTADA);
    }
    
    public boolean tieneAlquilerAceptado(int idUsuario) {
        return alquilerRepository.existsByUsuarioIdAndEstadoSolicitud(
            idUsuario, AlquilerEstadoSolicitud.ACEPTADA);
    }
    
    //numero de solicitudes pendientes
    public int countSolicitudesPendientes(int idPiso) {
        return alquilerRepository
            .findByPisoIdAndEstadoSolicitud(idPiso, AlquilerEstadoSolicitud.PENDIENTE)
            .size();
    }
    
    
 // En AlquilerService.java — añadir estos dos métodos al final

 // =========================================================================
 // MÉTODO INTERNO — finaliza todos los alquileres activos de un piso
 // y cancela las solicitudes pendientes
 // Llamado desde PisoService.eliminarPiso
 // =========================================================================
 public void finalizarAlquileresActivosDePiso(int idPiso) {
     // Finalizar alquileres ACEPTADOS
     List<Alquiler> activos = alquilerRepository.findByPisoIdAndEstadoSolicitud(
         idPiso, AlquilerEstadoSolicitud.ACEPTADA);
     activos.forEach(a -> {
         a.setFFin(LocalDate.now());
         a.setEstadoSolicitud(AlquilerEstadoSolicitud.FINALIZADA);
     });
     alquilerRepository.saveAll(activos);

     // Cancelar solicitudes PENDIENTES
     List<Alquiler> pendientes = alquilerRepository.findByPisoIdAndEstadoSolicitud(
         idPiso, AlquilerEstadoSolicitud.PENDIENTE);
     pendientes.forEach(a -> a.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA));
     alquilerRepository.saveAll(pendientes);
 }

 // =========================================================================
 // MÉTODO INTERNO — activa feedbacks entre todos los residentes actuales
 // de un piso (para usarlo justo antes de eliminar el piso)
 // =========================================================================
 public void activarFeedbacksEntreResidentes(int idPiso) {
     List<Alquiler> activos = alquilerRepository.findByPisoIdAndEstadoSolicitud(
         idPiso, AlquilerEstadoSolicitud.ACEPTADA);

     for (int i = 0; i < activos.size(); i++) {
         for (int j = 0; j < activos.size(); j++) {
             if (i != j) {
                 int idA = activos.get(i).getUsuario().getId();
                 int idB = activos.get(j).getUsuario().getId();
                 feedbackService.activarFeedbacks(idA, idB);
             }
         }
     }
 }
}
