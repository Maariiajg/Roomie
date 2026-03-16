package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.Foto;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.specifications.PisoSpecification;
import com.roomie.services.dto.piso.PisoCederDTO;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;

@Service
public class PisoService {

    // Único repository propio
    @Autowired
    private PisoRepository pisoRepository;
 
    // UsuarioService en lugar de UsuarioRepository
    @Autowired
    private UsuarioService usuarioService;

    // @Lazy rompe la dependencia circular PisoService <-> AlquilerService
    @Autowired
    @Lazy
    private AlquilerService alquilerService;
    
    public List<Piso> findAll() {
        return pisoRepository.findAll();
    }
    
    /*Solo se devuelven pisos con plazas libres 
     * (numOcupantesActual < numTotalHabitaciones)
     */
    public List<Piso> findLibres() {
        return pisoRepository.findAll()
                .stream()
                .filter(p -> p.getNumOcupantesActual() < p.getNumTotalHabitaciones())
                .toList();
    } 
    
    //FIND BY ID
    
    public Piso findById(int idPiso) {
        return pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException(
                                "El piso con ID " + idPiso + " no existe"
                        )
                );
    }

 // =========================================================================
    // 1. CREAR PISO
    //    - El usuario pasa a ser OWNER automáticamente.
    //    - numOcupantesActual se inicializa a 1 (el propio owner).
    //    - Se genera un alquiler ACEPTADA para el owner vía AlquilerService.
    // =========================================================================
    public Piso crearPiso(int idUsuario, Piso datos) {

        Usuario usuario = usuarioService.findById(idUsuario);

        if (datos.getId() != 0) {
            throw new PisoException("No se puede introducir el ID manualmente.");
        }

        if (datos.getFPublicacion() != null) {
            throw new PisoException(
                    "La fecha de publicación se asigna automáticamente.");
        }

        if (datos.getNumOcupantesActual() != 0) {
            throw new PisoException(
                    "El número de ocupantes se asigna automáticamente.");
        }

        if (datos.getDireccion() == null ||
                datos.getDireccion().isBlank() ||
                datos.getTamanio() <= 0 ||
                datos.getPrecioMes() <= 0 ||
                datos.getNumTotalHabitaciones() <= 0) {
            throw new PisoException("Faltan campos obligatorios o son inválidos.");
        }

        datos.setFPublicacion(LocalDate.now());
        datos.setOwner(usuario);
        datos.setNumOcupantesActual(1);

        // Si era USUARIO pasa a OWNER
        if (usuario.getRol() == Roles.USUARIO) {
            usuarioService.cambiarRol(usuario.getId(), Roles.OWNER);
            // Refrescamos para que el owner tenga el rol actualizado
            usuario = usuarioService.findById(idUsuario);
            datos.setOwner(usuario);
        }

        Piso pisoGuardado = pisoRepository.save(datos);

        // Alquiler automático para el owner
        alquilerService.crearAlquilerOwner(pisoGuardado, usuario);

        return pisoGuardado;
    }


    // =========================================================================
    // 2. MODIFICAR INFORMACIÓN BÁSICA DEL PISO
    // =========================================================================
    public Piso modificarInformacionBasica(int idPiso, Piso datos) {

        if (datos.getId() != idPiso) {
            throw new PisoException(
                    String.format(
                            "El id del body (%d) y el id del path (%d) no coinciden.",
                            datos.getId(), idPiso));
        }

        Piso pisoExistente = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException(
                                "El piso con ID " + idPiso + " no existe."));

        if (datos.getFPublicacion() != null &&
                !datos.getFPublicacion().equals(pisoExistente.getFPublicacion())) {
            throw new PisoException("La fecha de publicación no se puede modificar.");
        }

        if (datos.getOwner() != null &&
                datos.getOwner().getId() != pisoExistente.getOwner().getId()) {
            throw new PisoException(
                    "No se puede modificar el owner desde este endpoint.");
        }

        if (datos.getNumOcupantesActual() != pisoExistente.getNumOcupantesActual()) {
            throw new PisoException(
                    "El número de ocupantes se modifica automáticamente.");
        }

        if (datos.getFotos() != null) {
            throw new PisoException("Las fotos se gestionan desde la entidad Foto.");
        }

        if (datos.getAlquileresSolicitados() != null) {
            throw new PisoException(
                    "Los alquileres no se pueden modificar desde aquí.");
        }

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


    // =========================================================================
    // 3. FILTRAR PISOS
    //    ⚠️ También aplica el filtro de plazas libres.
    // =========================================================================
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

        return pisoRepository.findAll(spec)
                .stream()
                .filter(p -> p.getNumOcupantesActual() < p.getNumTotalHabitaciones())
                .toList();
    }


    // =========================================================================
    // 4. CEDER PISO (traspasar el rol de owner a otro usuario del piso)
    // =========================================================================
    public Piso cederPiso(int idPiso, PisoCederDTO datos) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        Usuario duenoActual = piso.getOwner();

        if (duenoActual.getId() != datos.getIdOwnerActual()) {
            throw new PisoException(
                    "El usuario que intenta ceder no es el dueño actual del piso.");
        }

        Usuario nuevoDueno = usuarioService.findById(datos.getIdNuevoOwner());

        if (duenoActual.getId() == nuevoDueno.getId()) {
            throw new PisoException("No puedes ceder el piso a ti mismo.");
        }

        // El nuevo dueño debe vivir en el piso (consultamos a AlquilerService)
        if (!alquilerService.existeAlquilerEnPiso(nuevoDueno.getId(), idPiso)) {
            throw new PisoException(
                    "Solo se puede ceder el piso a un usuario que ya viva en él.");
        }

        // El nuevo dueño no puede ser ya owner de otro piso
        if (pisoRepository.existsByOwnerId(nuevoDueno.getId())) {
            throw new PisoException("El usuario ya es dueño de otro piso.");
        }

        piso.setOwner(nuevoDueno);

        usuarioService.cambiarRol(duenoActual.getId(), Roles.USUARIO);
        usuarioService.cambiarRol(nuevoDueno.getId(), Roles.OWNER);

        return pisoRepository.save(piso);
    }


    // =========================================================================
    // 5. LISTAR USUARIOS QUE VIVEN EN UN PISO
    // =========================================================================
    public List<Usuario> listarUsuariosQueVivenEnPiso(int idPiso) {

        pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoException("El piso con ID " + idPiso + " no existe."));

        return alquilerService.alquileresAceptadosDePiso(idPiso)
                .stream()
                .map(Alquiler::getUsuario)
                .toList();
    }


    // =========================================================================
    // 6. LISTAR FOTOS DE UN PISO
    // =========================================================================
    public List<Foto> listarFotosDePiso(int idPiso) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        return piso.getFotos();
    }


    // =========================================================================
    // 7. ELIMINAR UN PISO
    //    - El owner vuelve a ser USUARIO.
    //    - Se eliminan los alquileres vía AlquilerService.
    // =========================================================================
    public void eliminarPiso(int idPiso) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        Usuario owner = piso.getOwner();

        usuarioService.cambiarRol(owner.getId(), Roles.USUARIO);

        alquilerService.eliminarAlquileresDePiso(idPiso);

        pisoRepository.delete(piso);
    }


    // =========================================================================
    // MÉTODOS INTERNOS — llamados desde AlquilerService
    // =========================================================================

    /** Incrementa en 1 el contador de ocupantes del piso */
    public void incrementarOcupantes(int idPiso) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        piso.setNumOcupantesActual(piso.getNumOcupantesActual() + 1);
        pisoRepository.save(piso);
    }

    /** Decrementa en 1 el contador de ocupantes del piso */
    public void decrementarOcupantes(int idPiso) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe."));

        piso.setNumOcupantesActual(piso.getNumOcupantesActual() - 1);
        pisoRepository.save(piso);
    }

}
