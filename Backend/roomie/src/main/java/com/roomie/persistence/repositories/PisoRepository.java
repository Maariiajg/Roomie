package com.roomie.persistence.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomie.persistence.entities.Usuario;

public interface PisoRepository extends JpaRepository<Usuario, Integer>{

}
