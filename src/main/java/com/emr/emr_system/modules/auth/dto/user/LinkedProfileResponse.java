package com.emr.emr_system.modules.auth.dto.user;

import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.modules.patient.entity.PatientProfile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LinkedProfileResponse {
    private UUID id;
    private String type;
    private String code;
    private String fullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LinkedProfileResponse fromDoctor(DoctorProfile profile) {
        return LinkedProfileResponse.builder()
                .id(profile.getId())
                .type("DOCTOR")
                .code(profile.getEmployeeCode())
                .fullName(profile.getFullName())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public static LinkedProfileResponse fromPatient(PatientProfile profile) {
        return LinkedProfileResponse.builder()
                .id(profile.getId())
                .type("PATIENT")
                .code(profile.getPatientCode())
                .fullName(profile.getFullName())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
