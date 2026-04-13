package com.roomie.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.entities.enums.Roles;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.dto.usuario.ActualizarPerfilDTO;
import com.roomie.services.dto.usuario.CambiarCredencialesDTO;
import com.roomie.services.dto.usuario.PerfilUsuarioDTO;
import com.roomie.services.dto.usuario.UsuarioRegistroDTO;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;
import com.roomie.services.mapper.UsuarioMapper;

@Service
public class UsuarioService implements UserDetailsService{

	@Autowired
    private UsuarioRepository usuarioRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;


	@Override
	public UserDetails loadUserByUsername(String nombreUsuario) throws UsernameNotFoundException {

		Usuario usuario = this.usuarioRepository.findByNombreUsuario(nombreUsuario)
				.orElseThrow(() -> new UsernameNotFoundException("El usuario " + nombreUsuario + " no existe. "));

		return User.builder()
				.username(usuario.getNombreUsuario())
				.password(usuario.getPassword())
				.roles(usuario.getRol().name())
				.build();
	}
	
	
    // =========================================================================
    // FIND ALL — solo USUARIO y OWNER (nunca ADMINISTRADOR)
    // =========================================================================
    public List<PerfilUsuarioDTO> findAllUsuariosYOwners() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == Roles.USUARIO || u.getRol() == Roles.OWNER)
                .map(u -> UsuarioMapper.toPerfilDTO(u, usuarioRepository.getCalificacionMedia(u.getId())))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // FIND BY ID — devuelve entidad (uso interno entre services)
    // =========================================================================
    public Usuario findById(int idUsuario) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getRol() == Roles.USUARIO || usuario.getRol() == Roles.OWNER) {
                return usuario;
            }
        }
        throw new UsuarioNotFoundException(
                "El usuario con ID " + idUsuario + " no fue encontrado o no tiene acceso.");
    }

    //====================
    //BUSCAR POR NOMBRE DE USUARIO
    public Usuario findByNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
            .orElseThrow(() -> new UsuarioNotFoundException(
                "Usuario con nombre '" + nombreUsuario + "' no encontrado."));
    }
    
    // =========================================================================
    // FIND BY ID — devuelve DTO (uso en controller)
    // =========================================================================
    public PerfilUsuarioDTO findByIdDTO(int idUsuario) {
        Usuario usuario = findById(idUsuario);
        return UsuarioMapper.toPerfilDTO(
                usuario, usuarioRepository.getCalificacionMedia(idUsuario));
    }

    // =========================================================================
    // REGISTRAR
    // =========================================================================
    public PerfilUsuarioDTO registrar(UsuarioRegistroDTO dto) {

        

        // Validar repetirPassword
        if (dto.getPassword() == null || dto.getRepetirPassword() == null ||
                !dto.getPassword().equals(dto.getRepetirPassword())) {
            throw new UsuarioException("Las contraseñas no coinciden.");
        }
        
        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new UsuarioException(
                "La contraseña es demasiado corta, debe tener al menos 8 caracteres."
            );
        }

        // Validar campos obligatorios
        if (dto.getNombre() == null ||
            dto.getApellido1() == null ||
            dto.getAnioNacimiento() == null ||
            dto.getGenero() == null ||
            dto.getTelefono() == null ||
            dto.getEmail() == null ||
            dto.getNombreUsuario() == null ||
            dto.getPassword() == null) {
            throw new UsuarioException("Todos los campos obligatorios deben ser completados.");
        }

        // Validar unicidad
        if (usuarioRepository.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new UsuarioException("El nombre de usuario ya está en uso.");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new UsuarioException("El email ya está en uso.");
        }
        if (dto.getDni() != null && usuarioRepository.existsByDni(dto.getDni())) {
            throw new UsuarioException("El DNI ya existe en la base de datos.");
        }

        // El mapper inicializa rol=USUARIO, bloqueado=false, aceptado=true
        Usuario usuario = UsuarioMapper.fromRegistroDTO(dto);
        
        // Encriptar contraseña antes de persistir
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        Usuario guardado = usuarioRepository.save(usuario);

        return UsuarioMapper.toPerfilDTO(guardado,
                usuarioRepository.getCalificacionMedia(guardado.getId()));
    }

    // =========================================================================
    // INICIAR SESIÓN — devuelve DTO (no expone password al cliente)
    // =========================================================================
    public PerfilUsuarioDTO iniciarSesion(String nombreUsuario, String password) {

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsuarioException(
                        "Nombre de usuario o contraseña incorrectos."));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new UsuarioException("Nombre de usuario o contraseña incorrectos.");
        }
        if (usuario.isBloqueado()) {
            throw new UsuarioException(
                    "Tu cuenta está bloqueada. Contacta con un administrador.");
        }
        if (!usuario.isAceptado()) {
            throw new UsuarioException("Tu cuenta aún no ha sido aceptada.");
        }

        return UsuarioMapper.toPerfilDTO(
                usuario, usuarioRepository.getCalificacionMedia(usuario.getId()));
    }

    // =========================================================================
    // CERRAR SESIÓN
    // =========================================================================
    public void cerrarSesion() {
        // Vacío hasta implementar JWT
    }

    // =========================================================================
    // ACTUALIZAR PERFIL
    // =========================================================================
    public PerfilUsuarioDTO actualizarPerfil(int idUsuario, ActualizarPerfilDTO dto) {

    	// Obtener el usuario autenticado del SecurityContext
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	String nombreUsuarioActual = auth.getName();
    	Usuario usuarioActual = usuarioRepository.findByNombreUsuario(nombreUsuarioActual).orElseThrow();
    	if (usuarioActual.getId() != idUsuario && usuarioActual.getRol() != Roles.ADMINISTRADOR) {
    	    throw new UsuarioException("No puedes editar el perfil de otro usuario.");
    	}

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        UsuarioMapper.applyActualizarPerfil(dto, usuario);
        Usuario guardado = usuarioRepository.save(usuario);

        return UsuarioMapper.toPerfilDTO(guardado,
                usuarioRepository.getCalificacionMedia(guardado.getId()));
    }

    // =========================================================================
    // BLOQUEAR / DESBLOQUEAR (solo administrador)
    // =========================================================================
    public PerfilUsuarioDTO cambiarEstadoBloqueo(int idUsuario, boolean bloquear) {
        /*if (datos.getId() != idUsuario) {
            throw new UsuarioException(
                    String.format(
                            "El id del body (%d) y el id del path (%d) no coinciden",
                            datos.getId(),
                            idUsuario
                    )
            );
        } */
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        usuario.setBloqueado(bloquear);
        Usuario guardado = usuarioRepository.save(usuario);

        return UsuarioMapper.toPerfilDTO(guardado,
                usuarioRepository.getCalificacionMedia(guardado.getId()));
    }

    // =========================================================================
    // CAMBIAR CREDENCIALES
    // =========================================================================
    public PerfilUsuarioDTO cambiarCredenciales(int idUsuario, CambiarCredencialesDTO dto) {

    	// Obtener el usuario autenticado del SecurityContext
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	String nombreUsuarioActual = auth.getName();
    	Usuario usuarioActual = usuarioRepository.findByNombreUsuario(nombreUsuarioActual).orElseThrow();
    	if (usuarioActual.getId() != idUsuario && usuarioActual.getRol() != Roles.ADMINISTRADOR) {
    	    throw new UsuarioException("No puedes editar el perfil de otro usuario.");
    	}

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        // Si quiere cambiar contraseña, validamos las reglas
        if (dto.getPasswordNueva() != null) {

            if (dto.getPasswordActual() == null) {
                throw new UsuarioException(
                        "Debes introducir tu contraseña actual para cambiarla.");
            }
            if (!passwordEncoder.matches(dto.getPasswordActual(), usuario.getPassword())) {
                throw new UsuarioException("La contraseña actual es incorrecta.");
            }
            if (dto.getPasswordNueva().equals(dto.getPasswordActual())) {
                throw new UsuarioException(
                        "La nueva contraseña no puede ser igual a la actual.");
            }
            if (!dto.getPasswordNueva().equals(dto.getRepetirPassword())) {
                throw new UsuarioException("Las contraseñas nuevas no coinciden.");
            }
            
            if (dto.getPasswordNueva() == null || dto.getPasswordNueva().length() < 8) {
                throw new UsuarioException(
                    "La nueve contraseña es demasiado corta, debe tener al menos 8 caracteres."
                );
            }
        }

        // Si quiere cambiar nombreUsuario, validamos unicidad
        if (dto.getNombreUsuario() != null &&
                usuarioRepository.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new UsuarioException("El nombre de usuario ya está en uso.");
        }

        UsuarioMapper.applyCambiarCredenciales(dto, usuario);
        
        // Si ha cambiado la contraseña, viene en texto plano desde el mapper, hay que encriptarla
        if (dto.getPasswordNueva() != null) {
            usuario.setPassword(passwordEncoder.encode(dto.getPasswordNueva()));
        }
        
        Usuario guardado = usuarioRepository.save(usuario);

        return UsuarioMapper.toPerfilDTO(guardado,
                usuarioRepository.getCalificacionMedia(guardado.getId()));
    }

    
 // =========================================================================
    // MÉTODO INTERNO — llamado desde PisoService
    // Cambia el rol de un usuario sin pasar por las validaciones del perfil.
    // Solo lo usan otros services internamente (crear piso, ceder piso, eliminar piso).
    // =========================================================================
    public void cambiarRol(int idUsuario, Roles nuevoRol) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new UsuarioNotFoundException(
                                "Usuario con ID " + idUsuario + " no encontrado."));

        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);
    }
    
 // =========================================================================
    // MÉTODO INTERNO — devuelve la calificacion media de un usuario
    // Usado por PisoService y AlquilerService para construir DTOs sin
    // necesidad de inyectar UsuarioRepository fuera de este service.
    // =========================================================================
    public Double getCalificacionMedia(int idUsuario) {
        return usuarioRepository.getCalificacionMedia(idUsuario);
    }


}