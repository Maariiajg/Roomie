package com.roomie.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Favorito;
import com.roomie.persistence.entities.Piso;
import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.FavoritoRepository;
import com.roomie.persistence.repositories.PisoRepository;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.favorito.FavoritoException;
import com.roomie.services.exceptions.favorito.FavoritoNotFoundException;
import com.roomie.services.exceptions.piso.PisoNotFoundException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class FavoritoService {

    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PisoRepository pisoRepository;

    /* =====================================================
       1. FIND ALL (TODOS LOS FAVORITOS DE UN USUARIO)
       ===================================================== */
    public List<Favorito> findAll(int idUsuario) {

        if (!usuarioRepository.existsById(idUsuario)) {
            throw new UsuarioNotFoundException("El usuario no existe");
        }

        return favoritoRepository.findByUsuarioId(idUsuario);
    }

    /* =====================================================
       2. FIND BY ID
       ===================================================== */
    public Favorito findById(int idFavorito) {

        return favoritoRepository.findById(idFavorito)
                .orElseThrow(() ->
                        new FavoritoNotFoundException("El favorito no existe"));
    }

    /* =====================================================
       3. AÑADIR A FAVORITOS
       ===================================================== */
    public Favorito anadirAFavoritos(int idUsuario, int idPiso) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException("El usuario no existe"));

        Piso piso = pisoRepository.findById(idPiso)
                .orElseThrow(() ->
                        new PisoNotFoundException("El piso no existe"));

        // Evitar duplicados
        if (favoritoRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new FavoritoException("El piso ya está en favoritos");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setPiso(piso);
        favorito.setFecha(LocalDateTime.now());

        return favoritoRepository.save(favorito);
    }

    /* =====================================================
       4. ELIMINAR DE FAVORITOS
       ===================================================== */
    @Transactional
    public void eliminarDeFavoritos(int idUsuario, int idPiso) {

        if (!favoritoRepository.existsByUsuarioIdAndPisoId(idUsuario, idPiso)) {
            throw new FavoritoNotFoundException(
                    "El piso no está en la lista de favoritos");
        }

        favoritoRepository.deleteByUsuarioIdAndPisoId(idUsuario, idPiso);
    }
}