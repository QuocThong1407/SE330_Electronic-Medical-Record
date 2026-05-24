package com.emr.emr_system.modules.medicine.dto;

import com.emr.emr_system.shared.enums.MedicineUnit;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MedicineUpdateRequest {

    private UUID categoryId;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Unit is required")
    private MedicineUnit unit;

    private String manufacturer;
    private String description;
    private String sideEffects;
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity must be >= 0")
    private Integer stockQuantity;

    private Boolean isActive;
}