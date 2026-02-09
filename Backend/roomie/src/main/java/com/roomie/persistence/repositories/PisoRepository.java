package com.roomie.persistence.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roomie.persistence.entities.Piso;

@Repository
public interface PisoRepository extends JpaRepository<Piso, Integer>{
	 
	List<Piso> findByOwnerId(int idUsuario);

    List<Piso> findByPrecioMesBetween(double min, double max);

    List<Piso> findByGarajeAndAnimalesAndWifiAndTabaco(
            boolean garaje, boolean animales, boolean wifi, boolean tabaco);
}
