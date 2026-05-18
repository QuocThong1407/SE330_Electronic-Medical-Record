package com.emr.emr_system.modules.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String phone;
    private String emailContact;
    private LocalDate dateOfBirth;
    private String bloodType;
}
