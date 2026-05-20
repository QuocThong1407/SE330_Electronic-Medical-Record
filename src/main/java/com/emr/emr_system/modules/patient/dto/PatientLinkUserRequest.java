package com.emr.emr_system.modules.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PatientLinkUserRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;
}
