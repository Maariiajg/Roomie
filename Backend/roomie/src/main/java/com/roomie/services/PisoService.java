package com.roomie.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.piso.PisoException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;

@Service
public class PisoService {
	@Autowired
	private PisoRepository pisoRepository;
   @Autowired
   private UsuarioRepository usuarioRepository;
   // findAll
   public List<Piso> findAll() {
       return this.pisoRepository.findAll();
   }
   // findById
   public Piso findById(int idPiso) {
       if (!this.pisoRepository.existsById(idPiso)) {
           throw new PisoNotFoundException("El piso con id " + idPiso + " no existe");
       }
       return this.pisoRepository.findById(idPiso).get();
   }
   // crear piso
   public Piso create(Piso piso, int idUsuarioDueno) {
       Usuario dueno = this.usuarioRepository.findById(idUsuarioDueno)
               .orElseThrow(() -> new PisoNotFoundException("El usuario no existe"));
       if (piso.getPrecioMes() <= 0) {
           throw new PisoException("El precio mensual debe ser mayor que 0");
       }
       if (piso.getNumTotalHabitaciones() <= 0) {
           throw new PisoException("El número de habitaciones debe ser mayor que 0");
       }
       piso.setId(0);
       piso.setUsuarioDueno(dueno);
       piso.setNumOcupantesActual(0);
       piso.setFPublicacion(LocalDate.now());
       return this.pisoRepository.save(piso);
   }
   // actualizar piso (datos básicos)
   public Piso update(Piso piso, int idPiso) {
       if (piso.getId() != idPiso) {
           throw new PisoException(
                   String.format("El id del body (%d) y el id del path (%d) no coinciden",
                           piso.getId(), idPiso));
       }
       Piso pisoBD = this.findById(idPiso);
       pisoBD.setDireccion(piso.getDireccion());
       pisoBD.setPrecioMes(piso.getPrecioMes());
       pisoBD.setDescripcion(piso.getDescripcion());
       pisoBD.setGaraje(piso.isGaraje());
       pisoBD.setAnimales(piso.isAnimales());
       pisoBD.setWifi(piso.isWifi());
       pisoBD.setTabaco(piso.isTabaco());
       return this.pisoRepository.save(pisoBD);
   }
   // borrar piso
   public void delete(int idPiso) {
       if (!this.pisoRepository.existsById(idPiso)) {
           throw new PisoNotFoundException("El piso no existe");
       }
       this.pisoRepository.deleteById(idPiso);
   }
   // pisos por dueño
   public List<Piso> findByUsuarioDueno(int idUsuario) {
       return this.pisoRepository.findByUsuarioDuenoId(idUsuario);
   }


}
