package com.emr.emr_system.modules.auth.dto;

import com.emr.emr_system.modules.auth.entity.RoleName;
import com.emr.emr_system.modules.auth.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private RoleName role;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .active(Boolean.TRUE.equals(user.getActive()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
