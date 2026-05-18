package com.emr.emr_system.modules.patient.dto;

import com.emr.emr_system.modules.patient.entity.PatientProfile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PatientProfileResponse {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String gender;
    private String phone;
    private String emailContact;
    private LocalDate dateOfBirth;
    private String bloodType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PatientProfileResponse from(PatientProfile profile) {
        return PatientProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .gender(profile.getGender())
                .phone(profile.getPhone())
                .emailContact(profile.getEmailContact())
                .dateOfBirth(profile.getDateOfBirth())
                .bloodType(profile.getBloodType())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
