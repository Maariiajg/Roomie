package com.roomie.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
import com.roomie.services.exceptions.usuario.UsuarioException;
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

    
    
 // findAll
 	public List<Alquiler> findAll() {
 		return this.alquilerRepository.findAll();
 	}

 	// findById
 	public Alquiler findById(int idAlquiler) {
 		if (!this.alquilerRepository.existsById(idAlquiler)) {
 			throw new AlquilerNotFoundException("La tarea con id " + idAlquiler + " no existe. ");
 		} 

 		return this.alquilerRepository.findById(idAlquiler).get();
 	}


    /* =====================================================
       1. SOLICITAR ALQUILER (con fechas)  cambiar enteroooooo
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

        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       2. VER SOLICITUDES DE UN PISO (DUEÑO)
       ===================================================== */
    public List<Alquiler> solicitudesPendientes(int idPiso, int idDueno) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoException("El piso no existe"));

        if (piso.getOwner().getId() != idDueno) {
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

        if (piso.getOwner().getId() != idDueno) {
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
            
         // =============================
         // CREAR FEEDBACKS AUTOMÁTICOS DENTRO DE RESOLVER SOLICITUD
         // al aceptar la solicitud se generan todos los feedbacks automaticamente
         // =============================

         // Usuario que acaba de entrar
         Usuario nuevoUsuario = alquiler.getUsuario();

         // Buscar compañeros actuales (ya aceptados en el piso)
         List<Alquiler> alquileresAceptados =
                 alquilerRepository.findByPisoIdAndEstadoSolicitud(
                         piso.getId(),
                         AlquilerEstadoSolicitud.ACEPTADA);

         // Para cada compañero crear feedback bidireccional
         for (Alquiler a : alquileresAceptados) {

             Usuario companero = a.getUsuario();

             // Evitar que se cree consigo mismo
             if (companero.getId() == nuevoUsuario.getId()) {
                 continue;
             }

             // 🔹 compañer@ -> nuevo
             if (!feedbackRepository.existsByUsuarioPoneIdAndUsuarioRecibeId(
                     companero.getId(), nuevoUsuario.getId())) {

                 Feedback f1 = new Feedback();
                 f1.setUsuarioPone(companero);
                 f1.setUsuarioRecibe(nuevoUsuario);
                 f1.setCalificacion(1); // mínimo permitido
                 f1.setEstadoFeedback(EstadoFeedback.NO_DISPONIBLE);
                 f1.setVisible(true);
                 f1.setFecha(null);

                 feedbackRepository.save(f1);
             }

             // 🔹 nuevo -> compañer@
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
     
     
     
     
     
     /*
      * 
      * 
      * A PARTIR DE AQUÍ LOS QUE SON DEFINITIVOS
      * 
      * 
      * 
      */
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     //================================================================================
     //==========================================================================
     //=================================================================================
     
     public void abandonarPiso(int idPiso, int idUsuario) {

    	    Piso piso = pisoRepository.findById(idPiso)
    	            .orElseThrow(() ->
    	                    new PisoNotFoundException("El piso no existe")
    	            );

    	    Usuario usuario = usuarioRepository.findById(idUsuario)
    	            .orElseThrow(() ->
    	                    new UsuarioNotFoundException("El usuario no existe")
    	            );

    	    // 🔴 Si es owner → NO puede salir
    	    if (piso.getOwner().getId() == usuario.getId()) {
    	        throw new PisoException(
    	            "Eres la persona responsable del piso, si quieres salir de él primero debes ceder este puesto a otra persona"
    	        );
    	    }

    	    // Buscar alquiler activo
    	    Alquiler alquiler = alquilerRepository
    	            .findByPisoIdAndUsuarioIdAndEstadoSolicitud(
    	                    idPiso,
    	                    idUsuario,
    	                    AlquilerEstadoSolicitud.ACEPTADA
    	            )
    	            .orElseThrow(() ->
    	                    new PisoException("El usuario no vive en este piso")
    	            );

    	    // 🔹 Obtener compañeros actuales antes de borrar el alquiler
    	    List<Alquiler> alquileresAceptados =
    	            alquilerRepository.findByPisoIdAndEstadoSolicitud(
    	                    idPiso,
    	                    AlquilerEstadoSolicitud.ACEPTADA
    	            );

    	    for (Alquiler a : alquileresAceptados) {

    	        Usuario companero = a.getUsuario();

    	        if (companero.getId() == usuario.getId()) {
    	            continue;
    	        }

    	        // 🔹 compañer@ -> usuario que se va
    	        List<Feedback> f1 =
    	                feedbackRepository
    	                        .findByUsuarioPoneIdAndUsuarioRecibeIdAndEstadoFeedback(
    	                                companero.getId(),
    	                                usuario.getId(),
    	                                EstadoFeedback.NO_DISPONIBLE
    	                        );

    	        f1.forEach(f -> {
    	            f.setEstadoFeedback(EstadoFeedback.PENDIENTE);
    	            feedbackRepository.save(f);
    	        });

    	        // 🔹 usuario que se va -> compañer@
    	        List<Feedback> f2 =
    	                feedbackRepository
    	                        .findByUsuarioPoneIdAndUsuarioRecibeIdAndEstadoFeedback(
    	                                usuario.getId(),
    	                                companero.getId(),
    	                                EstadoFeedback.NO_DISPONIBLE
    	                        );

    	        f2.forEach(f -> {
    	            f.setEstadoFeedback(EstadoFeedback.PENDIENTE);
    	            feedbackRepository.save(f);
    	        });
    	    }

    	    // 🔹 Eliminar alquiler
    	    alquilerRepository.delete(alquiler);
    	}


}