package com.roomie.persistence.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.roomie.persistence.entities.Foto;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer>{

}
