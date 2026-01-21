package com.roomie.persistence.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Piso;

public interface PisoRepository extends JpaRepository<Piso, Integer>{
	 
	List<Piso> findByUsuarioDuenoId(int idUsuario);
}
