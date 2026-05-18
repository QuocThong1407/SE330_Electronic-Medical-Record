package com.emr.emr_system.modules.doctor.dto;

import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DoctorProfileResponse {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String gender;
    private String phone;
    private String emailContact;
    private String specialization;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DoctorProfileResponse from(DoctorProfile profile) {
        return DoctorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .gender(profile.getGender())
                .phone(profile.getPhone())
                .emailContact(profile.getEmailContact())
                .specialization(profile.getSpecialization())
                .dateOfBirth(profile.getDateOfBirth())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
