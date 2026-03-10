package com.roomie.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Favorito;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.FavoritoRepository;
import com.roomie.services.exceptions.favorito.FavoritoException;
import com.roomie.services.exceptions.favorito.FavoritoNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class FavoritoService {

    // ✅ Único repository propio
    @Autowired
    private FavoritoRepository favoritoRepository;

    // ✅ Servicios ajenos en lugar de sus repositories
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PisoService pisoService;


    // =========================================================================
    // 1. FIND ALL — todos los favoritos de un usuario
    // =========================================================================
    public List<Favorito> findAll(int idUsuario) {

        usuarioService.findById(idUsuario); // lanza excepción si no existe

        return favoritoRepository.findByUsuarioId(idUsuario);
    }


    // =========================================================================
    // 2. FIND BY ID
    // =========================================================================
    public Favorito findById(int idFavorito) {

        return favoritoRepository.findById(idFavorito)
                .orElseThrow(() ->
                        new FavoritoNotFoundException("El favorito no existe."));
    }


    // =========================================================================
    // 3. AÑADIR A FAVORITOS
    // =========================================================================
    public Favorito anadirAFavoritos(int idUsuario, int idPiso) {

        Usuario usuario = usuarioService.findById(idUsuario);
        Piso piso       = pisoService.findById(idPiso);

        if (favoritoRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new FavoritoException("El piso ya está en favoritos.");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setPiso(piso);
        favorito.setFecha(LocalDateTime.now());

        return favoritoRepository.save(favorito);
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
