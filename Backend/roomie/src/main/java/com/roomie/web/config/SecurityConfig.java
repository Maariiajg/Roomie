package com.roomie.web.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	@Value("${frontend.url}")
	private String frontendUrls;
	
	@Autowired
	private JwtFilter jwtFilter;
	
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	    http
	        .csrf(csrf -> csrf.disable())
	        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
	        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	        .authorizeHttpRequests(auth -> auth

	            // ── RUTAS PÚBLICAS ──────────────────────────────────────────────
		        .requestMatchers(HttpMethod.POST, "/auth/login/usuario").permitAll()
	            .requestMatchers(HttpMethod.POST, "/usuario/registrar").permitAll()
	            .requestMatchers(HttpMethod.POST, "/usuario/iniciar-sesion").permitAll()
	            .requestMatchers(HttpMethod.POST, "/administrador/registrar").permitAll()
	            .requestMatchers(HttpMethod.POST, "/administrador/iniciar-sesion").permitAll()

	            // Ver pisos (público, sin token)
	            .requestMatchers(HttpMethod.GET, "/piso/libres").permitAll()
	            .requestMatchers(HttpMethod.GET, "/piso/filtrar").permitAll()
	            .requestMatchers(HttpMethod.GET, "/piso/{idPiso}").permitAll()
	            .requestMatchers(HttpMethod.GET, "/piso/{idPiso}/fotos").permitAll()
	            .requestMatchers(HttpMethod.GET, "/foto/{idFoto}").permitAll()

	            // Ver reputación pública de un usuario
	            .requestMatchers(HttpMethod.GET, "/feedback/usuario/{idUsuario}").permitAll()
	            .requestMatchers(HttpMethod.GET, "/feedback/media/{idUsuario}").permitAll()

	            // ── SOLO ADMINISTRADOR ──────────────────────────────────────────
	            // Gestión de administradores
	            .requestMatchers(HttpMethod.GET, "/administrador").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.GET, "/administrador/{idAdministrador}").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.GET, "/administrador/solicitudes").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.PUT, "/administrador/{idAdmin}/aceptar").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.POST, "/administrador/cerrar-sesion").hasRole("ADMINISTRADOR")

	            // Ver TODOS los pisos (no solo los libres)
	            .requestMatchers(HttpMethod.GET, "/piso").hasRole("ADMINISTRADOR")

	            // Eliminar piso
	            .requestMatchers(HttpMethod.DELETE, "/piso/{idPiso}").hasRole("ADMINISTRADOR")

	            // Gestión de usuarios
	            .requestMatchers(HttpMethod.GET, "/usuario").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.PUT, "/usuario/{idUsuario}/bloquear").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.PUT, "/usuario/{idUsuario}/desbloquear").hasRole("ADMINISTRADOR")

	            // Ver alquiler concreto por ID y listado global
	            .requestMatchers(HttpMethod.GET, "/alquiler").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.GET, "/alquiler/{idAlquiler}").hasRole("ADMINISTRADOR")

	            // Historial y alquiler actual: admin puede ver el de cualquier usuario
	            // (los propios usuarios también acceden — ver sección USUARIO+OWNER)
	            // → se resuelve con hasAnyRole en esa sección

	            // Feedback: ver todos (visibles + ocultos) y toggle visible
	            .requestMatchers(HttpMethod.GET, "/feedback/{idFeedback}").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.GET, "/feedback/usuario/{idUsuario}/todos").hasRole("ADMINISTRADOR")
	            .requestMatchers(HttpMethod.PUT, "/feedback/{idFeedback}/toggle").hasRole("ADMINISTRADOR")

	            // ── OWNER Y ADMINISTRADOR ───────────────────────────────────────
	            // Ver solicitudes pendientes de un piso
	            .requestMatchers(HttpMethod.GET, "/alquiler/piso/{idPiso}/solicitudes").hasAnyRole("OWNER", "ADMINISTRADOR")
	            // Resolver solicitudes (aceptar o rechazar)
	            .requestMatchers(HttpMethod.PUT, "/alquiler/{idAlquiler}/resolver").hasAnyRole("OWNER", "ADMINISTRADOR")
	            // Ceder piso
	            .requestMatchers(HttpMethod.PUT, "/piso/{idPiso}/ceder").hasAnyRole("OWNER", "ADMINISTRADOR")
	            // Modificar información básica del piso
	            .requestMatchers(HttpMethod.PUT, "/piso/{idPiso}").hasAnyRole("OWNER", "ADMINISTRADOR")
	            // Gestión de fotos del piso (el service valida que sea el owner del piso)
	            .requestMatchers(HttpMethod.POST, "/foto").hasRole("OWNER")
	            .requestMatchers(HttpMethod.DELETE, "/foto/{idFoto}").hasRole("OWNER")

	            // ── USUARIO, OWNER Y ADMINISTRADOR (cualquier autenticado) ──────
	            // Cerrar sesión (solo si has iniciado sesión, es decir, tienes token)
	            .requestMatchers(HttpMethod.POST, "/usuario/cerrar-sesion").authenticated()
	            // Ver perfil de cualquier usuario
	            .requestMatchers(HttpMethod.GET, "/usuario/{idUsuario}").authenticated()
	            // Historial y alquiler actual (el service valida que sea el propio usuario)
	            .requestMatchers(HttpMethod.GET, "/alquiler/usuario/{idUsuario}/historial").hasAnyRole("USUARIO", "OWNER", "ADMINISTRADOR")
	            .requestMatchers(HttpMethod.GET, "/alquiler/usuario/{idUsuario}/actual").hasAnyRole("USUARIO", "OWNER", "ADMINISTRADOR")

	            // ── SOLO USUARIO ────────────────────────────────────────────────
	            // Crear piso (en el service pasa a OWNER automáticamente)
	            .requestMatchers(HttpMethod.POST, "/piso/crear/{idUsuario}").hasRole("USUARIO")

	            // ── USUARIO Y OWNER ─────────────────────────────────────────────
	            // Ver piso como residente (requiere login para verificar convivencia)
	            .requestMatchers(HttpMethod.GET, "/piso/{idPiso}/residente").hasAnyRole("USUARIO", "OWNER")
	            // Ver usuarios que viven en un piso y compañeros
	            .requestMatchers(HttpMethod.GET, "/piso/{idPiso}/usuarios").hasAnyRole("USUARIO", "OWNER")
	            .requestMatchers(HttpMethod.GET, "/alquiler/usuario/{idUsuario}/companeros").hasAnyRole("USUARIO", "OWNER")
	            // Actualizar perfil y credenciales
	            .requestMatchers(HttpMethod.PUT, "/usuario/{idUsuario}/actualizar-perfil").hasAnyRole("USUARIO", "OWNER")
	            .requestMatchers(HttpMethod.PUT, "/usuario/{idUsuario}/credenciales").hasAnyRole("USUARIO", "OWNER")
	            // Cerrar sesión como usuario/owner
	            .requestMatchers(HttpMethod.POST, "/usuario/cerrar-sesion").hasAnyRole("USUARIO", "OWNER")
	            // Enviar y cancelar solicitudes de alquiler
	            .requestMatchers(HttpMethod.POST, "/alquiler/solicitar").hasAnyRole("USUARIO", "OWNER")
	            .requestMatchers(HttpMethod.PUT, "/alquiler/{idAlquiler}/cancelar").hasAnyRole("USUARIO", "OWNER")
	            // Salir del piso (solo USUARIO, un OWNER primero debe ceder el piso)
	            .requestMatchers(HttpMethod.PUT, "/alquiler/piso/{idPiso}/salir").hasRole("USUARIO")
	            // Favoritos
	            .requestMatchers(HttpMethod.GET,    "/favorito").hasAnyRole("USUARIO", "OWNER")
	            .requestMatchers(HttpMethod.GET,    "/favorito/{idFavorito}").hasAnyRole("USUARIO", "OWNER")
	            .requestMatchers(HttpMethod.POST,   "/favorito").hasAnyRole("USUARIO", "OWNER")
	            .requestMatchers(HttpMethod.DELETE, "/favorito").hasAnyRole("USUARIO", "OWNER")
	            // Dejar feedback (el service valida que hayan convivido)
	            .requestMatchers(HttpMethod.POST, "/feedback/{idUsuarioPone}/{idUsuarioRecibe}").hasAnyRole("USUARIO", "OWNER")

	            // ── CUALQUIER PETICIÓN NO DECLARADA: DENEGADA ───────────────────
	            .anyRequest().denyAll()
	        )
	        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

	    return http.build();
	}
	
	
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Divide la cadena por comas y elimina espacios en blanco
        List<String> allowedOrigins = Arrays.stream(frontendUrls.split(","))
                                            .map(String::trim)
                                            .toList();
//        List<String> allowedOrigins = Arrays.asList("http://localhost:4200");
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
	

}
