package com.roomie.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomie.persistence.entities.Usuario;
import com.roomie.persistence.repositories.UsuarioRepository;
import com.roomie.services.exceptions.usuario.UsuarioException;
import com.roomie.services.exceptions.usuario.UsuarioNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	//find All
	public List<Usuario> findAll(){
		return this.usuarioRepository.findAll();
	}
	
	// find id
	public Usuario findById(int idUsuario) {
		if(!this.usuarioRepository.existsById(idUsuario)) {
			throw new UsuarioNotFoundException("El ID indicado no existe. ");
		}
		
		return this.usuarioRepository.findById(idUsuario).get();
	}
	
	//Buscar por nombreUsuario (tambien se puede usar para ver mi perfil
    public Usuario findByNombreUsuario(String nombreUsuario) {
        Usuario usuario = this.usuarioRepository.findByNombreUsuario(nombreUsuario);

        if (usuario == null) {
            throw new UsuarioNotFoundException("No existe el usuario con nombreUsuario: " + nombreUsuario);
        }

        return usuario;
    }
    
    //registrar create
    
    //iniciar sesion
    
    //Actualizar perfil (información) update
    
    public Usuario update(Usuario usuario, int idUsuario) {
    	if(usuario.getId() != idUsuario) {
    		throw new UsuarioException(
    				String.format("El id del body (%d) y el id del path (%d) no coinciden", usuario.getId(), idUsuario));
    	
    	}
    	if(!this.usuarioRepository.existsById(idUsuario)) {
    		throw new UsuarioException("El usuario con id " + idUsuario + " no existe.");
    	}
    	
    	if (usuario.getPassword() != null) {
			throw new UsuarioException("No se puede modificar la contraseña, eso se hará en el endpoint correspondiente");
		}
    	if (usuario.getNombreUsuario() != null) {
			throw new UsuarioException("No se puede modificar el nombre de usuario, eso se hará en el endpoint correspondiente");
		}
    	if (usuario.getDni() != null) { //hay que asegurarse en el de crear de que el DNI sea correcto, si es correcto ya no se cambia xq eso no cambia
			throw new UsuarioException("No se puede modificar el DNI");
		}
    	
    	Usuario usuarioBD = this.findById(idUsuario);
    	
    	if (usuario.isBloqueado() != usuarioBD.isBloqueado()) {
            throw new UsuarioException(
                "No se puede modificar el estado de bloqueo desde este endpoint");
        }
    	
    	usuarioBD.setNombre(usuario.getNombre());
    	usuarioBD.setApellido1(usuario.getApellido1());
    	usuarioBD.setApellido2(usuario.getApellido2());
    	usuarioBD.setAnioNacimiento(usuario.getAnioNacimiento());
    	usuarioBD.setGenero(usuario.getGenero());
    	usuarioBD.setTelefono(usuario.getTelefono());
    	usuarioBD.setEmail(usuario.getEmail());
    	usuarioBD.setMensajePresentacion(usuario.getMensajePresentacion());
    	usuarioBD.setFoto(usuario.getFoto());
    	
    	return this.usuarioRepository.save(usuarioBD);
    	
    }
    
    //bloquear/desbloquear
    public Usuario desbloquear(Usuario usuario, int idUsuario) {
    	
    	if(usuario.getId() != idUsuario) {
    		throw new UsuarioException(
    				String.format("El id del body (%d) y el id del path (%d) no coinciden", usuario.getId(), idUsuario));
    	
    	}
    	if(!this.usuarioRepository.existsById(idUsuario)) {
    		throw new UsuarioException("El usuario con id " + idUsuario + " no existe.");
    	}
    	
    	// Protección: solo se permite tocar 'bloqueado'
        if (usuario.getPassword() != null ||
            usuario.getNombreUsuario() != null ||
            usuario.getDni() != null ||
            usuario.getNombre() != null ||
            usuario.getApellido1() != null ||
            usuario.getApellido2() != null ||
            usuario.getAnioNacimiento() != null ||
            usuario.getGenero() != null ||
            usuario.getTelefono() != null ||
            usuario.getEmail() != null ||
            usuario.getMensajePresentacion() != null ||
            usuario.getFoto() != null) {

            throw new UsuarioException(
                "Este endpoint solo permite bloquear o desbloquear al usuario");
        }
    	
    	
    	Usuario usuarioBD = this.findById(idUsuario);
    	
    	String mensaje;
    	if (usuarioBD.isBloqueado()) {
            usuarioBD.setBloqueado(false);
            mensaje = "Usuario desbloqueado";
        } else {
            usuarioBD.setBloqueado(true);
            mensaje = "Usuario bloqueado";
        }
    	
    	
    	this.usuarioRepository.save(usuarioBD);
        System.out.println(mensaje);

        return usuarioBD;
    }
    
    //Cambiar nombre de usuario y contraseña
    
    public Usuario cambiarContraseñaYNombreUsuario(Usuario usuario, int idUsuario) {
    	if(usuario.getId() != idUsuario) {
    		throw new UsuarioException(
    				String.format("El id del body (%d) y el id del path (%d) no coinciden", usuario.getId(), idUsuario));
    	
    	}
    	if(!this.usuarioRepository.existsById(idUsuario)) {
    		throw new UsuarioException("El usuario con id " + idUsuario + " no existe.");
    	}
    	
    	// Protección: solo se permite tocar 'bloqueado'
        if (usuario.getDni() != null ||
            usuario.getNombre() != null ||
            usuario.getApellido1() != null ||
            usuario.getApellido2() != null ||
            usuario.getAnioNacimiento() != null ||
            usuario.getGenero() != null ||
            usuario.getTelefono() != null ||
            usuario.getEmail() != null ||
            usuario.getMensajePresentacion() != null ||
            usuario.getFoto() != null) {

            throw new UsuarioException(
                "Este endpoint solo permite cambiar la contraseña o el nombre de usuario al usuario");
        
        }
        
        Usuario usuarioBD = this.findById(idUsuario);
    	
    	if (usuario.isBloqueado() != usuarioBD.isBloqueado()) {
            throw new UsuarioException(
                "No se puede modificar el estado de bloqueo desde este endpoint");
        }
    	
    	usuarioBD.setPassword(usuario.getPassword());
    	usuarioBD.setNombreUsuario(usuario.getNombreUsuario());
    	
    	return this.usuarioRepository.save(usuarioBD);
    }
	
}
