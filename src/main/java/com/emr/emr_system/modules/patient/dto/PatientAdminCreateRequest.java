package com.emr.emr_system.modules.patient.dto;

import com.emr.emr_system.shared.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientAdminCreateRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Gender is required")
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
}
