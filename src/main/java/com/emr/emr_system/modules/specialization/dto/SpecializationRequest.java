package com.emr.emr_system.modules.specialization.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SpecializationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
}
