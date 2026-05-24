package com.emr.emr_system.modules.medicine.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MedicineStatusRequest {

    @NotNull(message = "isActive is required")
    private Boolean isActive;
}