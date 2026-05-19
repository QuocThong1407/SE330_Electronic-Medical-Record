package com.emr.emr_system.modules.doctor.dto;

import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import com.emr.emr_system.shared.enums.Gender;
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
    private UUID departmentId;
    private String employeeCode;
    private String fullName;
    private Gender gender;
    private String phone;
    private String emailContact;
    private String degree;
    private Integer experienceYears;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DoctorProfileResponse from(DoctorProfile profile) {
        return DoctorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .departmentId(profile.getDepartmentId())
                .employeeCode(profile.getEmployeeCode())
                .fullName(profile.getFullName())
                .gender(profile.getGender())
                .phone(profile.getPhone())
                .emailContact(profile.getEmailContact())
                .degree(profile.getDegree())
                .experienceYears(profile.getExperienceYears())
                .dateOfBirth(profile.getDateOfBirth())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
