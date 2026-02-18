package com.roomie.persistence.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.roomie.persistence.entities.Piso;

@Repository
public interface PisoRepository extends JpaRepository<Piso, Integer>, JpaSpecificationExecutor<Piso>{
	 
	List<Piso> findByOwnerId(int ownerId);
	
	int countByOwnerId(int ownerId);
	
	boolean existsByOwnerId(int ownerId);
	

}
