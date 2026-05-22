package com.emr.emr_system.modules.medical_records.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_record_diagnoses")
@IdClass(MedicalRecordDiagnosisId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDiagnosis {
    @Id
    @Column(name = "medical_record_id", nullable = false)
    private UUID medicalRecordId;

    @Id
    @Column(name = "icd_code_id")
    private String icdCodeId;

    @Column(name = "custom_diagnosis")
    private String customDiagnosis;

    @Enumerated(EnumType.STRING)
    @Column(name = "diagnosis_type", nullable = false, length = 20)
    private DiagnosisType diagnosisType;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
