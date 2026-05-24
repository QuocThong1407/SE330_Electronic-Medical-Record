// PrescriptionDetailResponse.java
package com.emr.emr_system.modules.prescription.dto;

import com.emr.emr_system.modules.prescription.entity.Prescription;
import com.emr.emr_system.modules.prescription.entity.PrescriptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDetailResponse {

    private UUID id;
    private String prescriptionNo;
    private UUID medicalRecordId;
    private UUID patientId;
    private UUID doctorId;
    private LocalDate prescribedDate;
    private String notes;
    private List<PrescriptionItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PrescriptionDetailResponse from(Prescription prescription, List<PrescriptionItem> items) {
        return PrescriptionDetailResponse.builder()
                .id(prescription.getId())
                .prescriptionNo(prescription.getPrescriptionNo())
                .medicalRecordId(prescription.getMedicalRecordId())
                .patientId(prescription.getPatientId())
                .doctorId(prescription.getDoctorId())
                .prescribedDate(prescription.getPrescribedDate())
                .notes(prescription.getNotes())
                .items(items.stream().map(PrescriptionItemResponse::from).toList())
                .createdAt(prescription.getCreatedAt())
                .updatedAt(prescription.getUpdatedAt())
                .build();
    }
}