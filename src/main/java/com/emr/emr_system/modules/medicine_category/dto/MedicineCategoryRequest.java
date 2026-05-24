package com.emr.emr_system.modules.medicine_category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MedicineCategoryRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
}