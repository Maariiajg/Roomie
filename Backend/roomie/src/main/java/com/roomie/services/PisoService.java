package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.AlquilerEstadoSolicitud;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.usuario.UsuarioException;

@Service
public class PisoService {

    @Autowired
    private PisoRepository pisoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /* =====================================================
       1. CREAR PISO
       ===================================================== */
    public Piso crear(Piso piso, int idUsuario) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioException("El usuario no existe"));

        if (piso.getNumTotalHabitaciones() < 1) {
            throw new PisoException(
                    "El piso debe tener al menos una habitación");
        }

        piso.setId(0);
        piso.setUsuarioDueno(usuario);
        piso.setFPublicacion(LocalDate.now());

        // El dueño vive en el piso
        piso.setNumOcupantesActual(1);

        return pisoRepository.save(piso);
    }

    /* =====================================================
       2. LISTAR TODOS LOS PISOS
       ===================================================== */
    public List<Piso> listarTodos() {
        return pisoRepository.findAll();
    }

    /* =====================================================
       3. PISOS DE LOS QUE SOY DUEÑO
       ===================================================== */
    public List<Piso> pisosDeDueno(int idUsuario) {
        return pisoRepository.findByUsuarioDuenoId(idUsuario);
    }

    /* =====================================================
       4. FILTRAR PISOS
       ===================================================== */
    public List<Piso> filtrar(
            double precioMin,
            double precioMax,
            boolean garaje,
            boolean animales,
            boolean wifi,
            boolean tabaco) {

        if (precioMin < 0 || precioMax < precioMin) {
            throw new PisoException("Rango de precios inválido");
        }

        return pisoRepository
                .findByGarajeAndAnimalesAndWifiAndTabaco(
                        garaje, animales, wifi, tabaco)
                .stream()
                .filter(p ->
                        p.getPrecioMes() >= precioMin &&
                        p.getPrecioMes() <= precioMax)
                .toList();
    }

    /* =====================================================
       5. CAMBIAR DUEÑO DEL PISO
       ===================================================== */
    public Piso cambiarDueno(int idPiso, int idNuevoDueno) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoException("El piso no existe"));

        Usuario nuevoDueno = usuarioRepository.findById(idNuevoDueno)
                .orElseThrow(() ->
                        new UsuarioException("El usuario no existe"));

        // Validación clave del enunciado:
        // el nuevo dueño debe vivir en el piso
        boolean viveEnPiso = piso.getAlquileresSolicitados().stream()
                .anyMatch(a ->
                        a.getUsuario().getId() == idNuevoDueno &&
                        a.getEstadoSolicitud()
                                .equals(AlquilerEstadoSolicitud.ACEPTADA));

        if (!viveEnPiso) {
            throw new PisoException(
                    "El nuevo dueño debe vivir actualmente en el piso");
        }

        piso.setUsuarioDueno(nuevoDueno);
        return pisoRepository.save(piso);
    }
}