package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.administrador.AdministradorException;
import com.roomie.services.exceptions.administrador.AdministradorNotFoundException;

@Service
public class AdministradorService {

    @Autowired
    private UsuarioRepository administradorRepository;

    /* =====================================================
       1. REGISTRAR ADMINISTRADOR (SOLICITUD)
       ===================================================== 
    public Usuario registrar(Usuario admin) {

        if (administradorRepository.existsByDni(admin.getDni())) {
            throw new AdministradorException("El DNI ya está registrado");
        }

        if (administradorRepository.existsByEmail(admin.getEmail())) {
            throw new AdministradorException("El email ya está registrado");
        }

        if (administradorRepository.existsByNombreUsuario(admin.getNombreUsuario())) {
            throw new AdministradorException("El nombre de usuario ya existe");
        }

        admin.setId(0);
        admin.setAceptado(false);

        return administradorRepository.save(admin);
    }

    =====================================================
       2. LOGIN ADMINISTRADOR
       ===================================================== 
    public Usua iniciarSesion(String nombreUsuario, String password) {

        Administrador admin = administradorRepository.findByNombreUsuario(nombreUsuario);

        if (admin == null) {
            throw new AdministradorException("Credenciales incorrectas");
        }

        if (!admin.isAceptado()) {
            throw new AdministradorException("El administrador aún no ha sido aceptado");
        }

        if (!admin.getPassword().equals(password)) {
            throw new AdministradorException("Credenciales incorrectas");
        }

        return admin;
    }*/

    /* =====================================================
       3. VER SOLICITUDES DE ADMIN PENDIENTES
       ===================================================== */
    public List<Usuario> solicitudesPendientes() {
        return administradorRepository.findAll()
                .stream()
                .filter(a -> !a.isAceptado())
                .toList();
    }

    /* =====================================================
       4. ACEPTAR ADMINISTRADOR
       ===================================================== */
    public Usuario aceptarAdmin(int idAdmin) {

        Usuario admin = administradorRepository.findById(idAdmin)
                .orElseThrow(() ->
                        new AdministradorNotFoundException("El administrador no existe"));

        if (admin.isAceptado()) {
            throw new AdministradorException("El administrador ya está aceptado");
        }

        admin.setAceptado(true);

        return administradorRepository.save(admin);
    }

    /* =====================================================
       5. RECHAZAR ADMINISTRADOR
       ===================================================== */
    public void rechazarAdmin(int idAdmin) {

        if (!administradorRepository.existsById(idAdmin)) {
            throw new AdministradorNotFoundException("El administrador no existe");
        }

        administradorRepository.deleteById(idAdmin);
    }

    /* =====================================================
       6. VER ADMIN POR ID
       ===================================================== */
    public Usuario findById(int idAdmin) {
        return administradorRepository.findById(idAdmin)
                .orElseThrow(() ->
                        new AdministradorNotFoundException("El administrador no existe"));
    }

    /* =====================================================
       7. LISTAR TODOS los administradores
       ===================================================== */
    public List<Usuario> findAll() {
        return administradorRepository.findAll();
    }
}
