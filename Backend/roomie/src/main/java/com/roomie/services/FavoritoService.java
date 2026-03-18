package com.roomie.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Favorito;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.FavoritoRepository;
import com.roomie.services.dto.favorito.FavoritoDTO;
import com.roomie.services.exceptions.favorito.FavoritoException;
import com.roomie.services.exceptions.favorito.FavoritoNotFoundException;
import com.roomie.services.mapper.FavoritoMapper;

import jakarta.transaction.Transactional;

@Service
public class FavoritoService {

    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PisoService pisoService;

    // =========================================================================
    // 1. FIND ALL — todos los favoritos de un usuario
    // =========================================================================
    public List<FavoritoDTO> findAll(int idUsuario) {
        usuarioService.findById(idUsuario);
        return FavoritoMapper.toDTOList(
                favoritoRepository.findByUsuarioId(idUsuario));
    }

    // =========================================================================
    // 2. FIND BY ID
    // =========================================================================
    public FavoritoDTO findById(int idFavorito) {
        Favorito favorito = favoritoRepository.findById(idFavorito)
                .orElseThrow(() -> new FavoritoNotFoundException(
                        "El favorito no existe."));
        return FavoritoMapper.toDTO(favorito);
    }

    // =========================================================================
    // 3. AÑADIR A FAVORITOS
    // =========================================================================
    public FavoritoDTO anadirAFavoritos(int idUsuario, int idPiso) {

        Usuario usuario = usuarioService.findById(idUsuario);
        Piso piso = pisoService.findById(idPiso);

        if (favoritoRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new FavoritoException("El piso ya está en favoritos.");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setPiso(piso);
        favorito.setFecha(LocalDateTime.now());

        return FavoritoMapper.toDTO(favoritoRepository.save(favorito));
    }

    // =========================================================================
    // 4. ELIMINAR DE FAVORITOS
    // =========================================================================
    @Transactional
    public void eliminarDeFavoritos(int idUsuario, int idPiso) {

        if (!favoritoRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new FavoritoNotFoundException(
                    "El piso no está en la lista de favoritos.");
        }

        favoritoRepository.deleteByUsuarioIdAndPisoId(idUsuario, idPiso);
    }
}
