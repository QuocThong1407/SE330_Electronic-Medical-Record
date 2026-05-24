package com.emr.emr_system.modules.prescription.dto;

import com.emr.emr_system.shared.enums.FrequencyEnum;
import com.emr.emr_system.shared.enums.MedicineUnit;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemRequest {

    private UUID medicineId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    private FrequencyEnum frequency;

    private Integer durationDays;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private MedicineUnit unit;

    private String route;
    private String instructions;
    private String notes;
}