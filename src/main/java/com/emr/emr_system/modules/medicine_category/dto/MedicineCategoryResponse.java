package com.emr.emr_system.modules.medicine_category.dto;

import com.emr.emr_system.modules.medicine_category.entity.MedicineCategory;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MedicineCategoryResponse {
    private UUID id;
    private String name;
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static MedicineCategoryResponse from(MedicineCategory category) {
        return MedicineCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
