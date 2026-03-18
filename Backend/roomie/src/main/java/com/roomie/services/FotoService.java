package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Foto;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.repositories.FotoRepository;
import com.roomie.services.dto.foto.FotoDTO;
import com.roomie.services.exceptions.foto.FotoNotFoundException;
import com.roomie.services.mapper.FotoMapper;

@Service
public class FotoService {

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private PisoService pisoService;

    // =========================================================================
    // FIND BY ID
    // =========================================================================
    public FotoDTO findById(int idFoto) {
        Foto foto = fotoRepository.findById(idFoto)
                .orElseThrow(() -> new FotoNotFoundException(
                        "La foto con id " + idFoto + " no existe."));
        return FotoMapper.toDTO(foto);
    }

    // =========================================================================
    // CREATE
    // =========================================================================
    public FotoDTO create(String url, int idPiso) {
        Piso piso = pisoService.findById(idPiso);

        Foto nuevaFoto = new Foto();
        nuevaFoto.setUrl(url);
        nuevaFoto.setPiso(piso);

        return FotoMapper.toDTO(fotoRepository.save(nuevaFoto));
    }

    // =========================================================================
    // DELETE
    // =========================================================================
    public void delete(int idFoto) {
        // Reutilizamos findById para lanzar la excepción correcta si no existe
        fotoRepository.findById(idFoto)
                .orElseThrow(() -> new FotoNotFoundException(
                        "La foto con id " + idFoto + " no existe."));
        fotoRepository.deleteById(idFoto);
    }

    // =========================================================================
    // FIND FOTOS BY PISO
    // =========================================================================
    public List<FotoDTO> findFotosByPiso(int idPiso) {
        pisoService.findById(idPiso);
        return FotoMapper.toDTOList(fotoRepository.findByPisoId(idPiso));
    }
}
