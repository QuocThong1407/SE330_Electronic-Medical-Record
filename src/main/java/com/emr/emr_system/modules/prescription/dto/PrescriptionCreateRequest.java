package com.emr.emr_system.modules.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionCreateRequest {

    @NotNull(message = "Medical record ID is required")
    private UUID medicalRecordId;

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    @NotNull(message = "Prescribed date is required")
    private LocalDate prescribedDate;

    private String notes;

    @NotNull(message = "Items are required")
    @Size(min = 1, message = "At least one prescription item is required")
    @Valid
    private List<PrescriptionItemRequest> items;
}