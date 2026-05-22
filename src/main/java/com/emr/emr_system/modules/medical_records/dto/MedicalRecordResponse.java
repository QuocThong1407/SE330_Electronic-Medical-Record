package com.emr.emr_system.modules.medical_records.dto;

import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
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
public class MedicalRecordResponse {
    private UUID id;
    private String recordNo;
    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private UUID departmentId;
    private LocalDateTime visitDate;
    private String chiefComplaint;
    private String presentIllness;
    private String assessment;
    private String treatmentPlan;
    private RecordStatus status;
    private Boolean isConfidential;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
