package com.emr.emr_system.modules.prescription.dto;

import com.emr.emr_system.modules.prescription.entity.PrescriptionItem;
import com.emr.emr_system.shared.enums.FrequencyEnum;
import com.emr.emr_system.shared.enums.MedicineUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemResponse {

    private UUID id;
    private UUID prescriptionId;
    private UUID medicineId;
    private String medicineName;
    private String dosage;
    private FrequencyEnum frequency;
    private Integer durationDays;
    private Integer quantity;
    private MedicineUnit unit;
    private String route;
    private String instructions;
    private String notes;

    public static PrescriptionItemResponse from(PrescriptionItem item) {
        return PrescriptionItemResponse.builder()
                .id(item.getId())
                .prescriptionId(item.getPrescriptionId())
                .medicineId(item.getMedicineId())
                .medicineName(item.getMedicineName())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .durationDays(item.getDurationDays())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .route(item.getRoute())
                .instructions(item.getInstructions())
                .notes(item.getNotes())
                .build();
    }
}