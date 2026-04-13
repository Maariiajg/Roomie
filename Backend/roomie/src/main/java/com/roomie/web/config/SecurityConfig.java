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

	        	    // ── RUTAS COMPLETAMENTE PÚBLICAS ─────────────────────────────
	        	    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
	        	    .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
	        	    .requestMatchers(HttpMethod.POST, "/auth/register-admin").permitAll()
	        	    .requestMatchers(HttpMethod.POST, "/auth/refresh").permitAll()

	        	    // Ver pisos libres/filtrados (sin token)
	        	    .requestMatchers(HttpMethod.GET,  "/piso/libres").permitAll()
	        	    .requestMatchers(HttpMethod.GET,  "/piso/filtrar").permitAll()
	        	    .requestMatchers(HttpMethod.GET,  "/piso/{idPiso}").permitAll()
	        	    .requestMatchers(HttpMethod.GET,  "/piso/{idPiso}/fotos").permitAll()
	        	    .requestMatchers(HttpMethod.GET,  "/foto/{idFoto}").permitAll()

	        	    // Reputación pública
	        	    .requestMatchers(HttpMethod.GET,  "/feedback/usuario/{idUsuario}").permitAll()
	        	    .requestMatchers(HttpMethod.GET,  "/feedback/media/{idUsuario}").permitAll()

	        	    // ── SOLO ADMINISTRADOR ────────────────────────────────────────
	        	    .requestMatchers(HttpMethod.GET,  "/administrador").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET,  "/administrador/{id}").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET,  "/administrador/solicitudes").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET,  "/administrador/solicitudes/count").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/administrador/{id}/aceptar").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET, "/administrador/perfil/{id}").hasRole("ADMINISTRADOR")

	        	    .requestMatchers(HttpMethod.GET,  "/piso").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.DELETE, "/piso/{idPiso}").hasRole("ADMINISTRADOR")

	        	    .requestMatchers(HttpMethod.GET,  "/usuario").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/usuario/{id}/bloquear").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/usuario/{id}/desbloquear").hasRole("ADMINISTRADOR")

	        	    .requestMatchers(HttpMethod.GET,  "/alquiler").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET,  "/alquiler/{idAlquiler}").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET,  "/feedback/{idFeedback}").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET,  "/feedback/usuario/{id}/todos").hasRole("ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/feedback/{id}/toggle").hasRole("ADMINISTRADOR")

	        	    // ── OWNER Y ADMINISTRADOR ─────────────────────────────────────
	        	    .requestMatchers(HttpMethod.GET,  "/alquiler/piso/{idPiso}/solicitudes").hasAnyRole("OWNER","ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/alquiler/{idAlquiler}/resolver").hasAnyRole("OWNER","ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/piso/{idPiso}/ceder").hasAnyRole("OWNER","ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.PUT,  "/piso/{idPiso}").hasAnyRole("OWNER","ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.POST, "/foto").hasAnyRole("OWNER","ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.DELETE, "/foto/{idFoto}").hasAnyRole("OWNER","ADMINISTRADOR")

	        	    // Expulsar usuario del piso (owner forzado)
	        	    .requestMatchers(HttpMethod.PUT,  "/alquiler/piso/{idPiso}/salir").hasAnyRole("USUARIO","OWNER")

	        	    // ── CUALQUIER AUTENTICADO ─────────────────────────────────────
	        	    .requestMatchers(HttpMethod.GET,  "/usuario/{idUsuario}").authenticated()
	        	    .requestMatchers(HttpMethod.PUT,  "/usuario/{id}/actualizar-perfil").authenticated()
	        	    .requestMatchers(HttpMethod.PUT,  "/usuario/{id}/credenciales").authenticated()
	        	    .requestMatchers(HttpMethod.GET,  "/piso/{idPiso}/residente").authenticated()
	        	    .requestMatchers(HttpMethod.GET,  "/piso/{idPiso}/usuarios").authenticated()
	        	    .requestMatchers(HttpMethod.POST, "/usuario/cerrar-sesion").authenticated()
	        	    //.requestMatchers(HttpMethod.GET, "/alquiler/piso/{idPiso}/solicitudes/count").hasAnyRole() //NO ES DEFINITIVO, HAY Q CAMBIARLO

	        	    // ── USUARIO Y OWNER (no administrador) ───────────────────────
	        	    .requestMatchers(HttpMethod.GET,  "/alquiler/usuario/{id}/historial").hasAnyRole("USUARIO","OWNER")
	        	    .requestMatchers(HttpMethod.GET,  "/alquiler/usuario/{id}/actual").hasAnyRole("USUARIO","OWNER")
	        	    .requestMatchers(HttpMethod.GET,  "/alquiler/usuario/{id}/companeros").hasAnyRole("USUARIO","OWNER")
	        	    .requestMatchers(HttpMethod.POST, "/alquiler/solicitar").hasRole("USUARIO")
	        	    .requestMatchers(HttpMethod.PUT,  "/alquiler/{id}/cancelar").hasAnyRole("USUARIO","OWNER")

	        	    //--- Solicitudes de alquiler -visible usuarios y solo owners resuelven
	        	    .requestMatchers(HttpMethod.GET, "/alquiler/piso/{idPiso}/solicitudes").hasAnyRole("USUARIO", "OWNER")
	        	    .requestMatchers(HttpMethod.GET, "/alquiler/piso/{idPiso}/solicitudes/count").hasAnyRole("USUARIO", "OWNER")
	        	    .requestMatchers(HttpMethod.PUT, "/alquiler/{idAlquiler}/resolver").hasAnyRole("OWNER", "ADMINISTRADOR")  // Admin también por si necesita intervenir
	        	    //-- OWNER---------------------
	        	    .requestMatchers(HttpMethod.GET, "/piso/mio/{idOwner}").hasRole("OWNER")
	        	    
	        	    // ── SOLO USUARIO (no owner) ───────────────────────────────────
	        	    .requestMatchers(HttpMethod.POST, "/piso/crear/{idUsuario}").hasRole("USUARIO")

	        	    // ── FAVORITOS (usuario y owner) ───────────────────────────────
	        	    .requestMatchers(HttpMethod.GET,    "/favorito").hasAnyRole("USUARIO","OWNER")
	        	    .requestMatchers(HttpMethod.GET,    "/favorito/{id}").hasAnyRole("USUARIO","OWNER")
	        	    .requestMatchers(HttpMethod.POST,   "/favorito").hasAnyRole("USUARIO","OWNER")
	        	    .requestMatchers(HttpMethod.DELETE, "/favorito").hasAnyRole("USUARIO","OWNER")

	        	    // ── FEEDBACK (usuario y owner) ────────────────────────────────
	        	    .requestMatchers(HttpMethod.POST, "/feedback/{idPone}/{idRecibe}").hasAnyRole("USUARIO","OWNER")

	        	    // ── ADMIN: historial por cualquier usuario ────────────────────
	        	    .requestMatchers(HttpMethod.GET, "/alquiler/usuario/{id}/historial").hasAnyRole("USUARIO","OWNER","ADMINISTRADOR")
	        	    .requestMatchers(HttpMethod.GET, "/alquiler/usuario/{id}/actual").hasAnyRole("USUARIO","OWNER","ADMINISTRADOR")

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
