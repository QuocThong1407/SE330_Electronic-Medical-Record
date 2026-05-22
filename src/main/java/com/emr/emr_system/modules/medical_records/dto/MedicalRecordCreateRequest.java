package com.emr.emr_system.modules.medical_records.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordCreateRequest {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private LocalDateTime visitDate;
    private String chiefComplaint;
    private String presentIllness;
    private String assessment;
    private String treatmentPlan;
    private Boolean isConfidential;
}
