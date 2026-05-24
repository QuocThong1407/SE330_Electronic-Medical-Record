package com.emr.emr_system.modules.prescription.dto;

import com.emr.emr_system.modules.prescription.entity.Prescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {

    private UUID id;
    private String prescriptionNo;
    private UUID medicalRecordId;
    private UUID patientId;
    private UUID doctorId;
    private LocalDate prescribedDate;
    private String notes;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PrescriptionResponse from(Prescription prescription, int itemCount) {
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .prescriptionNo(prescription.getPrescriptionNo())
                .medicalRecordId(prescription.getMedicalRecordId())
                .patientId(prescription.getPatientId())
                .doctorId(prescription.getDoctorId())
                .prescribedDate(prescription.getPrescribedDate())
                .notes(prescription.getNotes())
                .itemCount(itemCount)
                .createdAt(prescription.getCreatedAt())
                .updatedAt(prescription.getUpdatedAt())
                .build();
    }
}