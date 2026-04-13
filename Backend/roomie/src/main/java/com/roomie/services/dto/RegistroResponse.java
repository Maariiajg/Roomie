package com.roomie.services.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter 
@AllArgsConstructor
public class RegistroResponse {
    private String accessToken;
    private String refreshToken;
    private int idUsuario;
    private String nombreUsuario;
    private String rol;
}
