package com.emr.emr_system.modules.patient.dto;

import com.emr.emr_system.modules.patient.entity.PatientProfile;
import com.emr.emr_system.shared.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String patientCode;
    private String fullName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private String insuranceNumber;
    private LocalDate insuranceExpDate;
    private String phone;
    private String emailContact;
    private String address;
    private String city;
    private String bloodType;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private String notes;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    public static PatientProfileResponse from(PatientProfile profile) {
        return PatientProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .patientCode(profile.getPatientCode())
                .fullName(profile.getFullName())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth())
                .idCardNumber(profile.getIdCardNumber())
                .insuranceNumber(profile.getInsuranceNumber())
                .insuranceExpDate(profile.getInsuranceExpDate())
                .phone(profile.getPhone())
                .emailContact(profile.getEmailContact())
                .address(profile.getAddress())
                .city(profile.getCity())
                .bloodType(profile.getBloodType())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactPhone(profile.getEmergencyContactPhone())
                .emergencyContactRelation(profile.getEmergencyContactRelation())
                .notes(profile.getNotes())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
