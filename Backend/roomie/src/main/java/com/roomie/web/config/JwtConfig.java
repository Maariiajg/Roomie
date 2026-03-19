package com.roomie.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

@Component
@Getter
public class JwtConfig {
	
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expires}")
    private long accessTokenExpires;

    @Value("${jwt.refresh.expires}")
    private long refreshTokenExpires;

    @Value("${jwt.issuer}")
    private String issuer;


}
