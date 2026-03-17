package com.roomie.services.mapper;

import java.util.List;
import java.util.Map;

import com.roomie.persistence.entities.Piso;
import com.roomie.services.dto.piso.PisoCrearDTO;
import com.roomie.services.dto.piso.PisoDTO;
import com.roomie.services.dto.piso.PisoResidenteDTO;
import com.roomie.services.dto.piso.PisoResumenDTO;

/**
 * Mapper para convertir entre la entidad Piso y sus DTOs.
 * Solo transformaciones de datos y cálculos simples derivados de los campos del piso.
 * Sin lógica de negocio ni acceso a repositorios.
 *
 * La calificacionMedia del owner se recibe como parámetro porque proviene
 * de una consulta agregada en el repositorio de feedback.
 *
 * Depende de UsuarioMapper para convertir el owner en PerfilUsuarioDTO.
 */
public class PisoMapper {
 
    private PisoMapper() {}
 
    // -------------------------------------------------------------------------
    // 1. toPisoDTO — Piso → PisoDTO (para usuarios que NO viven en el piso)
    //    precioMesPersona = precioMes / (numOcupantesActual + 1)
    // -------------------------------------------------------------------------
    public static PisoDTO toPisoDTO(Piso piso, Double calificacionMediaOwner) {
        if (piso == null) return null;
 
        PisoDTO dto = new PisoDTO();
        dto.setId(piso.getId());
        dto.setDireccion(piso.getDireccion());
        dto.setDescripcion(piso.getDescripcion());
        dto.setTamanio(piso.getTamanio());
        dto.setPrecioMes(piso.getPrecioMes());
        dto.setNumTotalHabitaciones(piso.getNumTotalHabitaciones());
        dto.setNumOcupantesActual(piso.getNumOcupantesActual());
        dto.setFPublicacion(piso.getFPublicacion());
        dto.setGaraje(piso.isGaraje());
        dto.setAnimales(piso.isAnimales());
        dto.setWifi(piso.isWifi());
        dto.setTabaco(piso.isTabaco());
 
        // Precio que pagaría el usuario si entrase ahora
        int futurosOcupantes = piso.getNumOcupantesActual() + 1;
        dto.setPrecioMesPersona(futurosOcupantes > 0
                ? piso.getPrecioMes() / futurosOcupantes
                : 0.0);
 
        dto.setPlazasLibres(piso.getNumTotalHabitaciones() - piso.getNumOcupantesActual());
 
        // Owner como PerfilUsuarioDTO, nunca como entidad completa
        dto.setOwner(UsuarioMapper.toPerfilDTO(piso.getOwner(), calificacionMediaOwner));
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // 2. toPisoResidenteDTO — Piso → PisoResidenteDTO (para quien YA VIVE en el piso)
    //    precioMesPersona = precioMes / numOcupantesActual
    // -------------------------------------------------------------------------
    public static PisoResidenteDTO toPisoResidenteDTO(Piso piso, Double calificacionMediaOwner) {
        if (piso == null) return null;
 
        PisoResidenteDTO dto = new PisoResidenteDTO();
        dto.setId(piso.getId());
        dto.setDireccion(piso.getDireccion());
        dto.setDescripcion(piso.getDescripcion());
        dto.setTamanio(piso.getTamanio());
        dto.setPrecioMes(piso.getPrecioMes());
        dto.setNumTotalHabitaciones(piso.getNumTotalHabitaciones());
        dto.setNumOcupantesActual(piso.getNumOcupantesActual());
        dto.setFPublicacion(piso.getFPublicacion());
        dto.setGaraje(piso.isGaraje());
        dto.setAnimales(piso.isAnimales());
        dto.setWifi(piso.isWifi());
        dto.setTabaco(piso.isTabaco());
 
        // Precio que paga actualmente cada residente
        int ocupantes = piso.getNumOcupantesActual();
        dto.setPrecioMesPersona(ocupantes > 0
                ? piso.getPrecioMes() / ocupantes
                : 0.0);
 
        dto.setPlazasLibres(piso.getNumTotalHabitaciones() - piso.getNumOcupantesActual());
 
        // Owner como PerfilUsuarioDTO, nunca como entidad completa
        dto.setOwner(UsuarioMapper.toPerfilDTO(piso.getOwner(), calificacionMediaOwner));
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // 3. toPisoResumenDTO — Piso → PisoResumenDTO (versión ligera para contextos anidados)
    //    Usado en AlquilerDTO y FavoritoDTO. Sin owner, sin campos calculados.
    // -------------------------------------------------------------------------
    public static PisoResumenDTO toPisoResumenDTO(Piso piso) {
        if (piso == null) return null;
 
        PisoResumenDTO dto = new PisoResumenDTO();
        dto.setId(piso.getId());
        dto.setDireccion(piso.getDireccion());
        dto.setPrecioMes(piso.getPrecioMes());
        dto.setNumTotalHabitaciones(piso.getNumTotalHabitaciones());
        dto.setNumOcupantesActual(piso.getNumOcupantesActual());
 
        return dto;
    }
 
    // -------------------------------------------------------------------------
    // 4. fromCrearDTO — PisoCrearDTO → entidad Piso
    //    NO copia: id, owner, fPublicacion, numOcupantesActual ni relaciones.
    //    El service los asigna.
    // -------------------------------------------------------------------------
    public static Piso fromCrearDTO(PisoCrearDTO dto) {
        if (dto == null) return null;
 
        Piso piso = new Piso();
        piso.setDireccion(dto.getDireccion());
        piso.setDescripcion(dto.getDescripcion());
        piso.setTamanio(dto.getTamanio());
        piso.setPrecioMes(dto.getPrecioMes());
        piso.setNumTotalHabitaciones(dto.getNumTotalHabitaciones());
        piso.setGaraje(dto.isGaraje());
        piso.setAnimales(dto.isAnimales());
        piso.setWifi(dto.isWifi());
        piso.setTabaco(dto.isTabaco());
 
        return piso;
    }
 
    // -------------------------------------------------------------------------
    // Métodos opcionales para listas
    // -------------------------------------------------------------------------
 
    public static List<PisoDTO> toPisoDTOList(List<Piso> pisos, Map<Long, Double> mediasOwner) {
        if (pisos == null) return List.of();
        return pisos.stream()
                .map(p -> toPisoDTO(p, mediasOwner != null
                        ? mediasOwner.get((long) p.getOwner().getId())
                        : null))
                .toList();
    }
 
    public static List<PisoResumenDTO> toResumenList(List<Piso> pisos) {
        if (pisos == null) return List.of();
        return pisos.stream()
                .map(PisoMapper::toPisoResumenDTO)
                .toList();
    }
}
