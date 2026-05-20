package com.emr.emr_system.modules.specialization.dto;

import com.emr.emr_system.modules.specialization.entity.Specialization;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SpecializationResponse {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime createdAt;

    public static SpecializationResponse from(Specialization specialization) {
        return SpecializationResponse.builder()
                .id(specialization.getId())
                .name(specialization.getName())
                .description(specialization.getDescription())
                .createdAt(specialization.getCreatedAt())
                .build();
    }
}
