package com.emr.emr_system.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String tokenType;
    private String accessToken;
    private long expiresIn;
    private UserResponse user;

    public static AuthResponse of(String accessToken, long expiresIn, UserResponse user) {
        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(accessToken)
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}
