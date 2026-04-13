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
import com.roomie.services.dto.piso.PisoActualizarDTO;
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
    // FIND ALL COMO DTO
    // =========================================================================
    public List<PisoDTO> findAllDTO() {
        List<Piso> pisos = pisoRepository.findAll();
        return pisos.stream()
                .map(p -> PisoMapper.toPisoDTO(p,
                        usuarioService.getCalificacionMedia(p.getOwner().getId())))
                .toList();
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

     // Verificar que el usuario no vive ya en un piso
        if (alquilerService.tieneAlquilerAceptado(idUsuario)) {
            throw new PisoException("No puedes crear un piso si ya vives en uno.");
        }

        // Verificar que no es ya owner de otro piso
        if (pisoRepository.existsByOwnerId(idUsuario)) {
            throw new PisoException("Ya eres owner de un piso. No puedes crear otro.");
        }

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
    public PisoDTO modificarInformacionBasica(int idPiso, PisoActualizarDTO dto) {
        /*if (datos.getId() != idPiso) {
            throw new PisoException(
                    String.format(
                            "El id del body (%d) y el id del path (%d) no coinciden.",
                            datos.getId(), idPiso));
        } */
        Piso pisoExistente = pisoRepository.findById(idPiso)
                .orElseThrow(() -> new PisoNotFoundException(
                        "El piso con ID " + idPiso + " no existe."));

        
       
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
    	
    	if (datos.getIdOwnerActual() <= 0 || datos.getIdNuevoOwner() <= 0) {
            throw new PisoException("Los IDs de usuario deben ser válidos.");
        }
    	
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

        // 1. Activar feedbacks entre residentes antes de que el piso desaparezca
        alquilerService.activarFeedbacksEntreResidentes(idPiso);

        // 2. Finalizar alquileres activos y cancelar solicitudes pendientes
        alquilerService.finalizarAlquileresActivosDePiso(idPiso);

        // 3. Cambiar rol del owner a USUARIO
        usuarioService.cambiarRol(piso.getOwner().getId(), Roles.USUARIO);

        // 4. Eliminar el piso (las fotos y favoritos se eliminan en cascada)
        pisoRepository.delete(piso);
    }
    
    /*=======================================
     * Sacar el piso de un owner para que pueda operar sobre él sin saber su ID
     */
    public PisoResidenteDTO findMiPisoDTO(int idOwner) {
        List<Piso> pisos = pisoRepository.findByOwnerId(idOwner);
        if (pisos.isEmpty()) throw new PisoNotFoundException("No tienes ningún piso.");
        Piso piso = pisos.get(0);
        Double media = usuarioService.getCalificacionMedia(piso.getOwner().getId());
        return PisoMapper.toPisoResidenteDTO(piso, media);
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
