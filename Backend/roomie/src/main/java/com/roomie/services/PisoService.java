package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.persistence.specifications.PisoSpecification;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

@Service
public class PisoService {

    @Autowired
    private PisoRepository pisoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Piso> findAll() {
        return pisoRepository.findAll();
    }
    
    public Piso findById(int idPiso) {
        return pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException(
                                "El piso con ID " + idPiso + " no existe"
                        )
                );
    }

    /* =====================================================
       1. CREAR PISO
       ===================================================== */
    public Piso crearPiso(int idUsuario, Piso datos) {

        // 1️ Validar que el usuario exista
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("El usuario no existe")
                );

        // 2️ No permitir ID manual
        if (datos.getId() != 0) {
            throw new PisoException("No se puede introducir el ID manualmente");
        }

        // 3️ No permitir fecha manual 
        if (datos.getFPublicacion() != null) {
            throw new PisoException("La fecha de publicación se asigna automáticamente");
        }

        // 4️ Validar campos obligatorios
        if (datos.getDireccion() == null ||
            datos.getDireccion().isBlank() ||
            datos.getTamanio() <= 0 ||
            datos.getPrecioMes() <= 0 ||
            datos.getNumTotalHabitaciones() <= 0 ||
            datos.getNumOcupantesActual() < 0) {

            throw new PisoException("Faltan campos obligatorios o son inválidos");
        }

        // 5️ Asignar fecha automática
        datos.setFPublicacion(LocalDate.now());

        // 6️ Asignar owner
        datos.setOwner(usuario);

        // 7️ Cambiar rol a OWNER si era USUARIO
        if (usuario.getRol() == Roles.USUARIO) {
            usuario.setRol(Roles.OWNER);
            usuarioRepository.save(usuario);
        }

        return pisoRepository.save(datos);
    }

    //Modificar datos básicos
    public Piso modificarInformacionBasica(int idPiso, Piso datos) {

        // 1️⃣ Validar ID body vs path
        if (datos.getId() != idPiso) {
            throw new PisoException(
                String.format(
                    "El id del body (%d) y el id del path (%d) no coinciden",
                    datos.getId(), idPiso
                )
            );
        }

        // 2️⃣ Buscar piso existente
        Piso pisoExistente = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException(
                                "El piso con ID " + idPiso + " no existe"
                        )
                );

        // 3️⃣ Validar que NO intenten modificar campos prohibidos
        if (datos.getFPublicacion() != null &&
            !datos.getFPublicacion().equals(pisoExistente.getFPublicacion())) {

            throw new PisoException("La fecha de publicación no se puede modificar");
        }

        if (datos.getOwner() != null &&
            datos.getOwner().getId() != pisoExistente.getOwner().getId()) {

            throw new PisoException("No se puede modificar el owner desde este endpoint");
        }

        if (datos.getNumOcupantesActual() != pisoExistente.getNumOcupantesActual()) {
            throw new PisoException("El número de ocupantes se modifica automáticamente");
        }

        if (datos.getFotos() != null) {
            throw new PisoException("Las fotos se gestionan desde la entidad Foto");
        }

        if (datos.getAlquileresSolicitados() != null) {
            throw new PisoException("Los alquileres no se pueden modificar desde aquí");
        }

        /*if (datos.getMarcadoPorUsuarios() != null) {
            throw new PisoException("Los favoritos no se pueden modificar desde aquí");
        }*/

        // 4️⃣ Actualizar SOLO los campos permitidos
        pisoExistente.setDireccion(datos.getDireccion());
        pisoExistente.setDescripcion(datos.getDescripcion());
        pisoExistente.setTamanio(datos.getTamanio());
        pisoExistente.setPrecioMes(datos.getPrecioMes());
        pisoExistente.setNumTotalHabitaciones(datos.getNumTotalHabitaciones());
        pisoExistente.setGaraje(datos.isGaraje());
        pisoExistente.setAnimales(datos.isAnimales());
        pisoExistente.setWifi(datos.isWifi());
        pisoExistente.setTabaco(datos.isTabaco());

        return pisoRepository.save(pisoExistente);
    }

    /* =====================================================
       3. PISOS DE LOS QUE SOY DUEÑO
       ===================================================== */
    public List<Piso> pisosDeDueno(int idUsuario) {
        return pisoRepository.findByOwnerId(idUsuario);
    }

    /* =====================================================
       4. FILTRAR PISOS
       ===================================================== */
    public List<Piso> filtrar(
            Double precioMin,
            Double precioMax,
            Boolean garaje,
            Boolean animales,
            Boolean wifi,
            Boolean tabaco) {

        Specification<Piso> spec = Specification
                .where(PisoSpecification.precioMayorOIgual(precioMin))
                .and(PisoSpecification.precioMenorOIgual(precioMax))
                .and(PisoSpecification.tieneGaraje(garaje))
                .and(PisoSpecification.permiteAnimales(animales))
                .and(PisoSpecification.tieneWifi(wifi))
                .and(PisoSpecification.permiteTabaco(tabaco));

        return pisoRepository.findAll(spec);
    }
    
    /* =========================
     * CEDER PISO
     * ========================= */
    
    
}