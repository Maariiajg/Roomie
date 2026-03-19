package com.roomie.web.config;

import java.util.Date;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

@Component
public class JwtUtils {
	
	@Autowired
	private JwtConfig jwtConfig;
	
    public String generateAccessToken(UserDetails userDetails) {
        return JWT.create()
            .withSubject(userDetails.getUsername())
            .withClaim("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
            .withIssuedAt(new Date())
            .withIssuer(jwtConfig.getIssuer())
            .withExpiresAt(new Date(System.currentTimeMillis() + jwtConfig.getAccessTokenExpires()))
            .sign(Algorithm.HMAC256(jwtConfig.getSecret()));
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        return JWT.create()
            .withSubject(userDetails.getUsername())
            .withClaim("roles", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
            .withClaim("type", "refresh") // Opcional: ayuda a distinguir el tipo de token
            .withIssuedAt(new Date())
            .withIssuer(jwtConfig.getIssuer())
            .withExpiresAt(new Date(System.currentTimeMillis() + jwtConfig.getRefreshTokenExpires()))
            .sign(Algorithm.HMAC256(jwtConfig.getSecret()));
    }
    
    public String extractUsername(String token) {
        return JWT.require(Algorithm.HMAC256(jwtConfig.getSecret()))
            .build()
            .verify(token)
            .getSubject();
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername());
    }
    
    public String generateAccessToken(String token) {
        DecodedJWT jwt = JWT.decode(token);
        return JWT.create()
            .withSubject(jwt.getSubject())
            .withClaim("roles", jwt.getClaim("roles").asList(String.class))
            .withIssuedAt(new Date())
            .withIssuer(jwtConfig.getIssuer())
            .withExpiresAt(new Date(System.currentTimeMillis() + jwtConfig.getAccessTokenExpires()))
            .sign(Algorithm.HMAC256(jwtConfig.getSecret()));
    }
    
    public String generateRefreshToken(String token) {
        DecodedJWT jwt = JWT.decode(token);
        return JWT.create()
            .withSubject(jwt.getSubject())
            .withClaim("roles", jwt.getClaim("roles").asList(String.class))
            .withClaim("type", "refresh")
            .withIssuedAt(new Date())
            .withIssuer(jwtConfig.getIssuer())
            .withExpiresAt(new Date(System.currentTimeMillis() + jwtConfig.getAccessTokenExpires()))
            .sign(Algorithm.HMAC256(jwtConfig.getSecret()));
    }

}
