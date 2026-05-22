package com.emr.emr_system.modules.medical_records.dto;

import com.emr.emr_system.modules.medical_records.entity.DiagnosisType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResponse {
    private UUID medicalRecordId;
    private String icdCodeId;
    private String customDiagnosis;
    private DiagnosisType diagnosisType;
    private String notes;
    private LocalDateTime createdAt;
}
