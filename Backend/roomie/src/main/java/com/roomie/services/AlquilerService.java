package com.roomie.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
import com.roomie.services.exceptions.alquiler.AlquilerNotFoundException;
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
    
    
 // findAll
 	public List<Alquiler> findAll() {
 		return this.alquilerRepository.findAll();
 	}

 	// findById
 	public Alquiler findById(int idTarea) {
 		if (!this.alquilerRepository.existsById(idTarea)) {
 			throw new AlquilerNotFoundException("La tarea con id " + idTarea + " no existe. ");
 		} 

 		return this.alquilerRepository.findById(idTarea).get();
 	}


    /* =====================================================
       1. SOLICITAR ALQUILER (con fechas)
       ===================================================== */
    public Alquiler solicitar(
            int idUsuario,
            int idPiso,
            LocalDate fInicio,
            LocalDate fFin) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("El usuario no existe"));

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoException("El piso no existe"));

        if (fInicio == null) {
            throw new AlquilerException("La fecha de inicio es obligatoria");
        }

        if (fFin != null) {
            long meses = ChronoUnit.MONTHS.between(fInicio, fFin);
            if (meses < 1) {
                throw new AlquilerException(
                        "La estancia mínima es de un mes");
            }
        }

        if (alquilerRepository.existsByUsuarioIdAndEstadoSolicitud(
                idUsuario, AlquilerEstadoSolicitud.ACEPTADA)) {
            throw new AlquilerException("Ya estás viviendo en un piso");
        }

        Alquiler alquiler = new Alquiler();
        alquiler.setId(0);
        alquiler.setUsuario(usuario);
        alquiler.setPiso(piso);
        alquiler.setFInicio(fInicio);
        alquiler.setFFin(fFin);
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.PENDIENTE);
        alquiler.setFavorito(false);

        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       2. VER SOLICITUDES DE UN PISO (DUEÑO)
       ===================================================== */
    public List<Alquiler> solicitudesPendientes(int idPiso, int idDueno) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoException("El piso no existe"));

        if (piso.getUsuarioDueno().getId() != idDueno) {
            throw new AlquilerException("Solo el dueño puede ver solicitudes");
        }

        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso, AlquilerEstadoSolicitud.PENDIENTE);
    }

    /* =====================================================
       3. ACEPTAR / RECHAZAR SOLICITUD
       ===================================================== */
    public Alquiler resolverSolicitud(
            int idAlquiler,
            int idDueno,
            boolean aceptar) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerException("La solicitud no existe"));

        Piso piso = alquiler.getPiso();

        if (piso.getUsuarioDueno().getId() != idDueno) {
            throw new AlquilerException("No eres el dueño del piso");
        }

        if (alquiler.getEstadoSolicitud() != AlquilerEstadoSolicitud.PENDIENTE) {
            throw new AlquilerException("La solicitud ya fue resuelta");
        }

        if (aceptar) {

            if (piso.getNumOcupantesActual() >= piso.getNumTotalHabitaciones()) {
                throw new AlquilerException("El piso está completo");
            }

            alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.ACEPTADA);
            piso.setNumOcupantesActual(piso.getNumOcupantesActual() + 1);
            pisoRepository.save(piso);

            // CANCELAR OTRAS SOLICITUDES DEL USUARIO
            List<Alquiler> otras =
                    alquilerRepository.findByUsuarioIdAndEstadoSolicitud(
                            alquiler.getUsuario().getId(),
                            AlquilerEstadoSolicitud.PENDIENTE);

            otras.forEach(a -> {
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

    /* =====================================================
       4. SALIR DEL PISO (MANUAL)
       ===================================================== */
    public void salir(int idAlquiler, int idUsuario) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerException("El alquiler no existe"));

        if (alquiler.getUsuario().getId() != idUsuario) {
            throw new AlquilerException("No es tu alquiler");
        }

        if (alquiler.getEstadoSolicitud() != AlquilerEstadoSolicitud.ACEPTADA) {
            throw new AlquilerException("No estás viviendo en ese piso");
        }

        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA);
        alquiler.setFFin(LocalDate.now());

        Piso piso = alquiler.getPiso();
        piso.setNumOcupantesActual(piso.getNumOcupantesActual() - 1);

        pisoRepository.save(piso);
        alquilerRepository.save(alquiler);
    }

    /* =====================================================
       5. AÑADIR / QUITAR FAVORITO
       ===================================================== */
    public Alquiler toggleFavorito(int idUsuario, int idPiso) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("El usuario no existe"));

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoException("El piso no existe"));

        Alquiler alquiler = alquilerRepository
                .findByUsuarioIdAndPisoId(idUsuario, idPiso)
                .orElseGet(() -> {
                    Alquiler nuevo = new Alquiler();
                    nuevo.setUsuario(usuario);
                    nuevo.setPiso(piso);
                    nuevo.setFInicio(LocalDate.now());
                    nuevo.setEstadoSolicitud(null);
                    nuevo.setFavorito(false);
                    return nuevo;
                });

        alquiler.setFavorito(!alquiler.isFavorito());
        return alquilerRepository.save(alquiler);
    }
    
    
    /*======================================
     * 6. CANCELAR SOLICITUD
     * =====================================*/
    
     public Alquiler cancelar(Alquiler alquiler, int idAlquiler) {
    	 if (alquiler.getId() != idAlquiler) {
 			throw new AlquilerException(
 					String.format("El id del body (%d) y el id del path (%d) no coinciden", alquiler.getId(), idAlquiler));
 		}
    	
    	Alquiler alquilerBD = this.findById(idAlquiler);
    	alquilerBD.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA);
    	
    	return this.alquilerRepository.save(alquilerBD);
     }
}