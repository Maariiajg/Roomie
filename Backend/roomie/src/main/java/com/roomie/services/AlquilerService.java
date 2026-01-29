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
       1. Crear solicitud de alquiler
       ===================================================== */
    public Alquiler solicitarAlquiler(int idUsuario, int idPiso) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("Usuario no existe"));

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoException("Piso no existe"));

        Alquiler alquiler = new Alquiler();
        alquiler.setUsuario(usuario);
        alquiler.setPiso(piso);
        alquiler.setFInicio(LocalDate.now());
        alquiler.setFFin(LocalDate.now()); // placeholder
        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.PENDIENTE.name());
        alquiler.setFavorito(false);

        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       2. Listar solicitudes de un piso
       ===================================================== */
    public List<Alquiler> listarSolicitudesPiso(int idPiso) {

        if (!pisoRepository.existsById(idPiso)) {
            throw new PisoException("El piso no existe");
        }

        return alquilerRepository.findByPisoIdAndEstadoSolicitud(
                idPiso,
                AlquilerEstadoSolicitud.PENDIENTE.name()
        );
    }

    /* =====================================================
       3. Aceptar solicitud
       ===================================================== */
    public Alquiler aceptarSolicitud(int idAlquiler) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerException("Alquiler no existe"));

        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.ACEPTADA.name());

        Piso piso = alquiler.getPiso();
        piso.setNumOcupantesActual(piso.getNumOcupantesActual() + 1);

        pisoRepository.save(piso);
        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       4. Rechazar solicitud
       ===================================================== */
    public Alquiler rechazarSolicitud(int idAlquiler) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerException("Alquiler no existe"));

        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.RECHAZADA.name());

        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       5. Cancelar alquiler (salir del piso)
       ===================================================== */
    public Alquiler cancelarAlquiler(int idAlquiler) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerException("Alquiler no existe"));

        if (!alquiler.getEstadoSolicitud()
                .equals(AlquilerEstadoSolicitud.ACEPTADA.name())) {
            throw new AlquilerException("Solo se puede cancelar un alquiler aceptado");
        }

        alquiler.setEstadoSolicitud(AlquilerEstadoSolicitud.CANCELADA.name());
        alquiler.setFFin(LocalDate.now());

        Piso piso = alquiler.getPiso();
        piso.setNumOcupantesActual(piso.getNumOcupantesActual() - 1);

        pisoRepository.save(piso);
        return alquilerRepository.save(alquiler);
    }

    /* =====================================================
       6. Alquileres de un usuario
       ===================================================== */
    public List<Alquiler> alquileresUsuario(int idUsuario) {

        if (!usuarioRepository.existsById(idUsuario)) {
            throw new UsuarioException("Usuario no existe");
        }

        return alquilerRepository.findByUsuarioId(idUsuario);
    }

    /* =====================================================
       7. Marcar / desmarcar favorito
       ===================================================== */
    public Alquiler toggleFavorito(int idAlquiler) {

        Alquiler alquiler = alquilerRepository.findById(idAlquiler)
                .orElseThrow(() -> new AlquilerException("Alquiler no existe"));

        alquiler.setFavorito(!alquiler.isFavorito());
        return alquilerRepository.save(alquiler);
    }
}
