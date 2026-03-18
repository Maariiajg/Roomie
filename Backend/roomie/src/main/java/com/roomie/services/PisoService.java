package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Alquiler;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.specifications.PisoSpecification;
import com.roomie.services.dto.foto.FotoDTO;
import com.roomie.services.dto.piso.PisoCederDTO;
import com.roomie.services.dto.piso.PisoCrearDTO;
import com.roomie.services.dto.piso.PisoDTO;
import com.roomie.services.dto.piso.PisoResidenteDTO;
import com.roomie.services.dto.usuario.PerfilUsuarioDTO;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;
import com.roomie.services.mapper.FotoMapper;
import com.roomie.services.mapper.PisoMapper;
import com.roomie.services.mapper.UsuarioMapper;

@Service
public class PisoService {

    @Autowired
    private PisoRepository pisoRepository;

    @Autowired
    private UsuarioService usuarioService;
    
    // @Lazy rompe la dependencia circular PisoService <-> AlquilerService
    @Autowired
    @Lazy
    private AlquilerService alquilerService;

    // =========================================================================
    // FIND ALL — devuelve entidades (uso interno) 
    // El controller aplica el mapper
    // =========================================================================
    public List<Piso> findAll() {
        return pisoRepository.findAll();
    }

    // =========================================================================
    // FIND LIBRES — devuelve entidades (uso interno)
    // =========================================================================
    public List<Piso> findLibres() {
        return pisoRepository.findAll()
                .stream()
                .filter(p -> p.getNumOcupantesActual() < p.getNumTotalHabitaciones())
                .toList();
    }

    // =========================================================================
    // FIND BY ID — devuelve entidad (uso interno entre services)
    // =========================================================================
    public Piso findById(int idPiso) {
        return pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException(
                        "El piso con ID " + idPiso + " no existe"));
    }

    // =========================================================================
    // FIND BY ID como DTO para visitante (no vive en el piso)
    // =========================================================================
    public PisoDTO findByIdDTO(int idPiso) {
        Piso piso = findById(idPiso);
        Double mediaOwner = usuarioService.getCalificacionMedia(piso.getOwner().getId());
        return PisoMapper.toPisoDTO(piso, mediaOwner);
    }

    // =========================================================================
    // FIND BY ID como DTO para residente (ya vive en el piso)
    // =========================================================================
    public PisoResidenteDTO findByIdResidenteDTO(int idPiso) {
        Piso piso = findById(idPiso);
        Double mediaOwner = usuarioService.getCalificacionMedia(piso.getOwner().getId());
        return PisoMapper.toPisoResidenteDTO(piso, mediaOwner);
    }

    // =========================================================================
    // 1. CREAR PISO
    // =========================================================================
    public PisoDTO crearPiso(int idUsuario, PisoCrearDTO dto) {

        Usuario usuario = usuarioService.findById(idUsuario);

        /*if (datos.getId() != 0) {
            throw new PisoException("No se puede introducir el ID manualmente.");
        }

        if (datos.getFPublicacion() != null) {
            throw new PisoException(
                    "La fecha de publicación se asigna automáticamente.");
        }

        if (datos.getNumOcupantesActual() != 0) {
            throw new PisoException(
                    "El número de ocupantes se asigna automáticamente.");
        } */

        if (dto.getDireccion() == null ||
                dto.getDireccion().isBlank() ||
                dto.getTamanio() <= 0 ||
                dto.getPrecioMes() <= 0 ||
                dto.getNumTotalHabitaciones() <= 0) {
            throw new PisoException("Faltan campos obligatorios o son inválidos.");
        }

        // El mapper copia solo los campos que el usuario puede definir
        Piso datos = PisoMapper.fromCrearDTO(dto);
        datos.setFPublicacion(LocalDate.now());
        datos.setOwner(usuario);
        datos.setNumOcupantesActual(1);

        // Si era USUARIO pasa a OWNER
        if (usuario.getRol() == Roles.USUARIO) {
            usuarioService.cambiarRol(usuario.getId(), Roles.OWNER);
            usuario = usuarioService.findById(idUsuario);
            datos.setOwner(usuario);
        }

        Piso pisoGuardado = pisoRepository.save(datos);

        // Alquiler automático para el owner
        alquilerService.crearAlquilerOwner(pisoGuardado, usuario);

        Double mediaOwner = usuarioService.getCalificacionMedia(usuario.getId());
        return PisoMapper.toPisoDTO(pisoGuardado, mediaOwner);
    }

    // =========================================================================
    // 2. MODIFICAR INFORMACIÓN BÁSICA DEL PISO
    // =========================================================================
    public PisoDTO modificarInformacionBasica(int idPiso, PisoCrearDTO dto) {
        /*if (datos.getId() != idPiso) {
            throw new PisoException(
                    String.format(
                            "El id del body (%d) y el id del path (%d) no coinciden.",
                            datos.getId(), idPiso));
        } */
        Piso pisoExistente = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException(
                        "El piso con ID " + idPiso + " no existe."));

        /*if (datos.getFPublicacion() != null &&
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
        } */
       
        // Aplicamos solo los campos permitidos (los del DTO de creación)
        pisoExistente.setDireccion(dto.getDireccion());
        pisoExistente.setDescripcion(dto.getDescripcion());
        pisoExistente.setTamanio(dto.getTamanio());
        pisoExistente.setPrecioMes(dto.getPrecioMes());
        pisoExistente.setNumTotalHabitaciones(dto.getNumTotalHabitaciones());
        pisoExistente.setGaraje(dto.isGaraje());
        pisoExistente.setAnimales(dto.isAnimales());
        pisoExistente.setWifi(dto.isWifi());
        pisoExistente.setTabaco(dto.isTabaco());

        Piso guardado = pisoRepository.save(pisoExistente);
        Double mediaOwner = usuarioService.getCalificacionMedia(guardado.getOwner().getId());
        return PisoMapper.toPisoDTO(guardado, mediaOwner);
    }

    // =========================================================================
    // 3. FILTRAR PISOS
    // =========================================================================
    public List<PisoDTO> filtrar(
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
                .map(p -> PisoMapper.toPisoDTO(p,
                		usuarioService.getCalificacionMedia(p.getOwner().getId())))
                .toList();
    }

    // =========================================================================
    // 4. CEDER PISO
    // =========================================================================
    public PisoDTO cederPiso(int idPiso, PisoCederDTO datos) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException("El piso no existe."));

        Usuario duenoActual = piso.getOwner();

        if (duenoActual.getId() != datos.getIdOwnerActual()) {
            throw new PisoException(
                    "El usuario que intenta ceder no es el dueño actual del piso.");
        }

        Usuario nuevoDueno = usuarioService.findById(datos.getIdNuevoOwner());

        if (duenoActual.getId() == nuevoDueno.getId()) {
            throw new PisoException("No puedes ceder el piso a ti mismo.");
        }

        if (!alquilerService.existeAlquilerEnPiso(nuevoDueno.getId(), idPiso)) {
            throw new PisoException(
                    "Solo se puede ceder el piso a un usuario que ya viva en él.");
        }

        if (pisoRepository.existsByOwnerId(nuevoDueno.getId())) {
            throw new PisoException("El usuario ya es dueño de otro piso.");
        }

        piso.setOwner(nuevoDueno);
        usuarioService.cambiarRol(duenoActual.getId(), Roles.USUARIO);
        usuarioService.cambiarRol(nuevoDueno.getId(), Roles.OWNER);

        Piso guardado = pisoRepository.save(piso);
        Double mediaOwner = usuarioService.getCalificacionMedia(nuevoDueno.getId());
        return PisoMapper.toPisoDTO(guardado, mediaOwner);
    }

    // =========================================================================
    // 5. LISTAR USUARIOS QUE VIVEN EN UN PISO
    // =========================================================================
    public List<PerfilUsuarioDTO> listarUsuariosQueVivenEnPiso(int idPiso) {

        pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoException(
                        "El piso con ID " + idPiso + " no existe."));

        return alquilerService.alquileresAceptadosDePiso(idPiso)
                .stream()
                .map(Alquiler::getUsuario)
                .map(u -> UsuarioMapper.toPerfilDTO(u,
                		usuarioService.getCalificacionMedia(u.getId())))
                .toList();
    }

    // =========================================================================
    // 6. LISTAR FOTOS DE UN PISO
    // =========================================================================
    public List<FotoDTO> listarFotosDePiso(int idPiso) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException("El piso no existe."));

        return FotoMapper.toDTOList(piso.getFotos());
    }

    // =========================================================================
    // 7. ELIMINAR UN PISO
    // =========================================================================
    public void eliminarPiso(int idPiso) {

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException("El piso no existe."));

        usuarioService.cambiarRol(piso.getOwner().getId(), Roles.USUARIO);
        alquilerService.eliminarAlquileresDePiso(idPiso);
        pisoRepository.delete(piso);
    }

    // =========================================================================
    // MÉTODOS INTERNOS — llamados desde AlquilerService
    // =========================================================================

    public void incrementarOcupantes(int idPiso) {
        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException("El piso no existe."));
        piso.setNumOcupantesActual(piso.getNumOcupantesActual() + 1);
        pisoRepository.save(piso);
    }

    public void decrementarOcupantes(int idPiso) {
        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException("El piso no existe."));
        piso.setNumOcupantesActual(piso.getNumOcupantesActual() - 1);
        pisoRepository.save(piso);
    }
}
